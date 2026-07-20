// Loaders for the per-book reading site ("guía", add-book-reading-experience).
//
// Content lives at `src/content/guide/<line>/<book>/`:
//   - `NNN-<slug>.json`  → one reading page (body_md rendered to body_html here)
//   - `_index.json`      → per-book nav tree + metadata
//
// Two collections: `guidePages` (one entry per page, id `<line>/<book>/<slug>`)
// and `guideBooks` (one entry per book, id `<line>/<book>`). Markdown is rendered
// at sync time (same GFM pipeline as the books loader) so pages are static HTML.
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { posixRelative } from '../paths';
import type { Loader, LoaderContext } from 'astro/loaders';

const GUIDE_DIR = new URL('../../content/guide/', import.meta.url);
const IMAGE_PLACEHOLDER = /<!--\s*image\s*-->/g;

async function walkBooks(): Promise<{ line: string; book: string; dir: URL }[]> {
  const root = fileURLToPath(GUIDE_DIR);
  const out: { line: string; book: string; dir: URL }[] = [];
  let lines: string[];
  try {
    lines = await fs.readdir(root);
  } catch {
    return out;
  }
  for (const line of lines.sort()) {
    const lineDir = new URL(`${line}/`, GUIDE_DIR);
    let books: string[];
    try {
      books = (await fs.readdir(fileURLToPath(lineDir))).sort();
    } catch {
      continue;
    }
    for (const book of books) {
      out.push({ line, book, dir: new URL(`${book}/`, lineDir) });
    }
  }
  return out;
}

export function guidePagesLoader(): Loader {
  return {
    name: 'wod20-guide-pages-loader',
    load: async (context: LoaderContext) => {
      const { store, logger, parseData, config } = context;
      store.clear();
      for (const { dir } of await walkBooks()) {
        let files: string[];
        try {
          files = (await fs.readdir(fileURLToPath(dir)))
            .filter((n) => n.endsWith('.json') && n !== '_index.json')
            .sort();
        } catch {
          continue;
        }
        for (const name of files) {
          const fileUrl = new URL(name, dir);
          const filePath = fileURLToPath(fileUrl);
          let raw: { line: string; book_id: string; slug: string; body_md?: string };
          try {
            raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
          } catch (e) {
            logger.error(`guide page ${filePath}: ${(e as Error).message}`);
            continue;
          }
          const cleaned = (raw.body_md ?? '').replace(IMAGE_PLACEHOLDER, '').trim();
          const rendered = await context.renderMarkdown(cleaned, { fileURL: fileUrl });
          const id = `${raw.line}/${raw.book_id}/${raw.slug}`;
          const data = await parseData({
            id,
            data: { ...raw, body_md: cleaned, body_html: rendered.html },
            filePath,
          });
          store.set({ id, data, filePath: posixRelative(fileURLToPath(config.root), filePath) });
        }
      }
    },
  };
}

export function guideBooksLoader(): Loader {
  return {
    name: 'wod20-guide-books-loader',
    load: async (context: LoaderContext) => {
      const { store, logger, parseData, config } = context;
      store.clear();
      for (const { dir } of await walkBooks()) {
        const fileUrl = new URL('_index.json', dir);
        const filePath = fileURLToPath(fileUrl);
        let raw: { line: string; book_id: string };
        try {
          raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        } catch (e) {
          logger.error(`guide index ${filePath}: ${(e as Error).message}`);
          continue;
        }
        const id = `${raw.line}/${raw.book_id}`;
        const data = await parseData({ id, data: raw, filePath });
        store.set({ id, data, filePath: posixRelative(fileURLToPath(config.root), filePath) });
      }
    },
  };
}
