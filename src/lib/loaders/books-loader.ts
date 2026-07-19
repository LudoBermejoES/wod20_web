// Custom content-layer loader for the "books" (reading-view) collection.
//
// Why a custom loader instead of the built-in `glob()` loader: each book JSON
// file matches `reading.schema.json` — a tree of chapters -> sections, where
// every section carries a raw Markdown string (`body_md`). The built-in
// loaders only parse whole-file data (`glob`) or whole-file arrays (`file`);
// neither renders the *nested* Markdown strings. Astro's content layer
// exposes exactly the tool for this: `context.renderMarkdown()`, the same
// Markdown pipeline (remark/rehype, GFM tables, etc.) used for `.md` content
// collection entries. This loader walks `src/content/books/**/*.json`,
// renders every section's `body_md` to `body_html` up front (at sync time,
// not per page render), and stores the augmented book as one entry per file.
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { posixRelative } from '../paths';
import type { Loader, LoaderContext } from 'astro/loaders';

const BOOKS_DIR = new URL('../../content/books/', import.meta.url);

// Extraction artifact left by the PDF pipeline for figures that have no text
// equivalent; not meaningful content, so we drop it before rendering.
const IMAGE_PLACEHOLDER = /<!--\s*image\s*-->/gi;

async function listJsonFiles(dir: URL): Promise<URL[]> {
  const dirPath = fileURLToPath(dir);
  let entries: Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: URL[] = [];
  for (const entry of entries) {
    const entryUrl = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) {
      files.push(...(await listJsonFiles(entryUrl)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryUrl);
    }
  }
  return files;
}

interface RawSection {
  title_es: string;
  anchor: string;
  level?: number;
  body_md: string;
  defines_entities?: string[];
}

interface RawChapter {
  title_es: string;
  anchor: string;
  level?: number;
  sections: RawSection[];
}

interface RawBook {
  book_id: string;
  line: string;
  title_es: string;
  source_pdf?: string | null;
  language: string;
  chapters: RawChapter[];
}

export function booksLoader(): Loader {
  return {
    name: 'wod20-books-loader',
    load: async (context: LoaderContext) => {
      const { store, logger, parseData, config } = context;
      const files = await listJsonFiles(BOOKS_DIR);
      store.clear();

      for (const fileUrl of files) {
        const filePath = fileURLToPath(fileUrl);
        let raw: RawBook;
        try {
          raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        } catch (error) {
          logger.error(`Could not read/parse book file ${filePath}: ${(error as Error).message}`);
          continue;
        }

        const chapters = await Promise.all(
          (raw.chapters ?? []).map(async (chapter) => ({
            ...chapter,
            sections: await Promise.all(
              (chapter.sections ?? []).map(async (section) => {
                const cleaned = (section.body_md ?? '').replace(IMAGE_PLACEHOLDER, '').trim();
                const rendered = await context.renderMarkdown(cleaned, { fileURL: fileUrl });
                return { ...section, body_md: cleaned, body_html: rendered.html };
              })
            ),
          }))
        );

        const id = raw.book_id;
        const data = { ...raw, chapters };
        const parsedData = await parseData({ id, data, filePath });
        store.set({ id, data: parsedData, filePath: posixRelative(fileURLToPath(config.root), filePath) });
        context.watcher?.add(filePath);
      }
    },
  };
}
