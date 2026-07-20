import { getCollection } from 'astro:content';

// Maps a book's section identifier to the exact guide page (and in-page anchor)
// that contains it, so entity cross-links can deep-link into the reading site the
// way they used to deep-link into the retired flat view.
//
// Both sides are produced by the same Python `slugify`: a books-collection section
// anchor is `<chapterAnchor>--<sectionSlug>`, and a guide page exposes that same
// `sectionSlug` either as a mini-TOC anchor (→ link with `#sectionSlug`) or as its
// own page slug (→ link to the page, no fragment). So we match on the stored strings
// directly — no TS re-slugify (which could diverge from the Python one).

export interface GuideTarget {
  book: string;
  slug: string; // guide page slug
  fragment?: string; // in-page anchor, when the section is a heading within the page
}

let _index: Map<string, GuideTarget> | null = null;

function key(line: string, book: string, token: string): string {
  return `${line}/${book}/${token}`;
}

/** Build (once, memoized) an index from `line/book/token` → guide page target. */
export async function guideAnchorIndex(): Promise<Map<string, GuideTarget>> {
  if (_index) return _index;
  const m = new Map<string, GuideTarget>();
  const pages = await getCollection('guidePages');
  for (const p of pages) {
    const { line, book_id: book, slug } = p.data;
    // a section that became its own page: match on the page slug (no fragment)
    const pageKey = key(line, book, slug);
    if (!m.has(pageKey)) m.set(pageKey, { book, slug });
    // a section rendered as a heading inside the page: match on its TOC anchor
    for (const t of p.data.toc ?? []) {
      const k = key(line, book, t.anchor);
      if (!m.has(k)) m.set(k, { book, slug, fragment: t.anchor });
    }
  }
  _index = m;
  return m;
}

/** Resolve a books-collection section anchor to a guide URL path, or undefined. */
export function resolveGuideHref(
  index: Map<string, GuideTarget>,
  line: string,
  book: string,
  sectionAnchor: string
): string | undefined {
  const token = sectionAnchor.split('--').pop() ?? sectionAnchor;
  const hit = index.get(key(line, book, token));
  if (!hit) return undefined;
  return `/${line}/guia/${hit.book}/${hit.slug}${hit.fragment ? `#${hit.fragment}` : ''}`;
}
