// Semantic search endpoint (add-semantic-search). The ONLY on-demand route — every
// reading/reference page stays prerendered/static. Runs on the Node server: embeds the
// Spanish query with BGE-M3 (transformers.js, kept warm) and vector-searches the SAME
// local LanceDB index the pipeline built (`derived/lancedb`), with optional line /
// content_type / language filters. Local-only; no cloud, no API key.
import type { APIRoute } from 'astro';
import * as lancedb from '@lancedb/lancedb';
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import path from 'node:path';

export const prerender = false; // opt this route into on-demand rendering

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
    const hits = rows.map((r) => {
      const line = r.game_line as string;
      const bookId = String(r.id ?? '').split('::')[0];
      return {
        text: r.text as string,
        book_id: bookId,
        book_title: r.book_title as string,
        game_line: line,
        language: r.language as string,
        content_type: r.content_type as string,
        breadcrumb: (r.heading_breadcrumb as string) || '',
        block_title: (r.block_title as string) || '',
        chapter: (r.chapter as string) || '',
        // deep link to the book's guide (per-passage anchor refined client-side / later)
        href: line && bookId ? `/${line}/guia/${bookId}` : undefined,
        score: r._distance as number,
      };
    });
    return jsonResponse({ q, k, count: hits.length, hits });
  } catch (e) {
    // model/index unavailable → 503; the rest of the site is unaffected (static).
    return jsonResponse({ error: String((e as Error)?.message ?? e) }, 503);
  }
};
