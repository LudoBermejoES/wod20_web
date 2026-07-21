// Semantic search endpoint (add-semantic-search). The ONLY on-demand route — every
// reading/reference page stays prerendered/static. Runs on the Node server: embeds the
// Spanish query with BGE-M3 (transformers.js, kept warm) and vector-searches the SAME
// local LanceDB index the pipeline built (`derived/lancedb`), with optional line /
// content_type / language filters. Local-only; no cloud, no API key.
import type { APIRoute } from 'astro';
import * as lancedb from '@lancedb/lancedb';
import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';
import path from 'node:path';
import { guideAnchorIndex, resolveGuideHref, type GuideTarget } from '../../lib/guide-anchors';

export const prerender = false; // opt this route into on-demand rendering

// The BGE-M3 ONNX weights download on first use. The default cache is INSIDE
// node_modules, which a redeploy's `npm ci` wipes — forcing a full re-download every
// time. Point it at a persistent dir (set on the server, preserved across deploys) so
// the model is fetched once. Unset in dev → library default (node_modules cache).
if (process.env.WOD20_MODEL_CACHE) env.cacheDir = process.env.WOD20_MODEL_CACHE;

// ASCII-slug a heading the same way the guide loader builds its anchor ids, so a chunk's
// heading resolves to a guide page's TOC anchor (deep link to the passage).
function slugifyHeading(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Structural divider titles ("Libro III", "Capítulo Diez", "Parte IV: …", "Paso Dos")
// are generic and recur as anchors across pages, so their #fragment matches are
// unreliable — accept only a clean page-level match for them.
const DIVIDER = /^\s*(libro|parte|acto|fase|paso|cap[ií]tulo)\b/i;

// Resolve a hit to the best guide URL:
//  1) the chunk's OWN `guide_slug` → the EXACT reading page. Each chunk carries the
//     slug of the guide page that renders its recover()-block (1:1; set in chunk.py to
//     match generate_guide's `_slug_unique`), so this is a direct, non-heuristic hit —
//     e.g. the "Necromancia" block resolves to page `una-cuestion-de-derecho`, whose
//     own title differs from the block title and so was unreachable by title-matching.
//     Refine to an in-page #anchor only when a chunk sub-heading is a TOC anchor of
//     that same page.
//  2) fallback (guide_slug missing/unresolved — e.g. flat-fallback books): sub-headings,
//     then part/chapter/block, rejecting #fragment matches from structural dividers.
//  3) else the book's guide index.
function resolveHref(
  idx: Map<string, GuideTarget>,
  line: string,
  bookId: string,
  text: string,
  guideSlug: string,
  blockTitle: string,
  chapter: string,
  part: string
): string | undefined {
  if (!line || !bookId) return undefined;
  const headings = [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1].trim());

  const pageHref = guideSlug ? resolveGuideHref(idx, line, bookId, guideSlug) : undefined;
  if (pageHref) {
    const page = pageHref.split('#')[0];
    for (const h of headings) {
      const r = resolveGuideHref(idx, line, bookId, slugifyHeading(h));
      if (r && r.includes('#') && r.split('#')[0] === page) return r; // same-page anchor
    }
    return pageHref; // exact page
  }

  for (const h of headings) {
    const r = resolveGuideHref(idx, line, bookId, slugifyHeading(h));
    if (r) return r; // precise passage
  }
  for (const s of [part, chapter, blockTitle]) {
    if (!s) continue;
    const r = resolveGuideHref(idx, line, bookId, slugifyHeading(s));
    if (r && (!r.includes('#') || !DIVIDER.test(s))) return r;
  }
  return `/${line}/guia/${bookId}`;
}

// dedup consecutive equal breadcrumb segments ("Necromancia > Necromancia" → "Necromancia")
function cleanCrumb(crumb: string): string {
  const parts = crumb.split(' > ').map((s) => s.trim()).filter(Boolean);
  return parts.filter((p, i) => p !== parts[i - 1]).join(' > ');
}

let _anchorIdx: Promise<Map<string, GuideTarget>> | null = null;
function anchorIndex() {
  if (!_anchorIdx) _anchorIdx = guideAnchorIndex();
  return _anchorIdx;
}

// derived/lancedb lives at the repo root (sibling of wod20_web). Override in prod.
const LANCEDB_DIR =
  process.env.WOD20_LANCEDB_DIR ?? path.resolve(process.cwd(), '../derived/lancedb');
const MODEL = process.env.WOD20_EMBED_MODEL ?? 'Xenova/bge-m3';
const TABLE = 'chunks';

// --- warm singletons: model + table load ONCE, held resident across requests ---
let _extractor: Promise<FeatureExtractionPipeline> | null = null;
function embedder() {
  // dtype fp32 (not the default quantized) to match the Python-indexed BGE-M3 vectors.
  if (!_extractor) _extractor = pipeline('feature-extraction', MODEL, { dtype: 'fp32' });
  return _extractor;
}
let _table: Promise<lancedb.Table> | null = null;
function table() {
  if (!_table) _table = lancedb.connect(LANCEDB_DIR).then((db) => db.openTable(TABLE));
  return _table;
}

async function embedQuery(text: string): Promise<number[]> {
  const extract = await embedder();
  // BGE-M3 dense embedding = CLS pooling + L2 normalize (must match the indexer).
  const out = await extract(text, { pooling: 'cls', normalize: true });
  return Array.from(out.data as Float32Array);
}

// query param → LanceDB column
const FILTERS: Record<string, string> = {
  line: 'game_line',
  type: 'content_type',
  lang: 'language',
  book: 'book_title',
};

function jsonResponse(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim();
  if (!q) return jsonResponse({ error: 'missing query param `q`' }, 400);
  const k = Math.min(Math.max(parseInt(url.searchParams.get('k') ?? '8', 10) || 8, 1), 30);

  try {
    const vec = await embedQuery(q);
    let search = (await table()).search(vec).distanceType('cosine').limit(k);
    const clauses: string[] = [];
    for (const [param, col] of Object.entries(FILTERS)) {
      const v = url.searchParams.get(param);
      if (v) clauses.push(`${col} = '${v.replace(/'/g, "''")}'`);
    }
    if (clauses.length) search = search.where(clauses.join(' AND '));

    const rows = (await search.toArray()) as Record<string, unknown>[];
    const idx = await anchorIndex();
    const hits = rows.map((r) => {
      const line = r.game_line as string;
      const bookId = String(r.id ?? '').split('::')[0];
      const text = (r.text as string) ?? '';
      const blockTitle = (r.block_title as string) || '';
      const chapter = (r.chapter as string) || '';
      const part = (r.part as string) || '';
      const guideSlug = (r.guide_slug as string) || '';
      const href = resolveHref(idx, line, bookId, text, guideSlug, blockTitle, chapter, part);
      return {
        text,
        book_id: bookId,
        book_title: r.book_title as string,
        game_line: line,
        language: r.language as string,
        content_type: r.content_type as string,
        breadcrumb: cleanCrumb((r.heading_breadcrumb as string) || ''),
        block_title: blockTitle,
        chapter,
        href,
        score: r._distance as number,
      };
    });
    return jsonResponse({ q, k, count: hits.length, hits });
  } catch (e) {
    // model/index unavailable → 503; the rest of the site is unaffected (static).
    return jsonResponse({ error: String((e as Error)?.message ?? e) }, 503);
  }
};
