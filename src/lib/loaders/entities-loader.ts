// Custom content-layer loader for the "entities" (reference-view) collection.
//
// Why a custom loader instead of the built-in `file()` loader: each
// `src/content/entities/<line>.json` file holds a JSON *array* of entities,
// one file per game line. `file()` (astro/loaders) does split a single JSON
// array into one store entry per item, but it only accepts a single file
// path — it has no glob support (`fileName.includes('*')` throws). Since we
// have six per-line files that must all land in one `entities` collection,
// this loader walks `src/content/entities/*.json` itself and merges every
// array into the store.
//
// Entity `id` values (e.g. "concentracion") are only unique *within* a line —
// the same merit/flaw id recurs across lines (Mage's "concentracion" and
// Vampire's "concentracion" are different entries). The store id is
// therefore namespaced as `<line>/<id>` to keep every entry addressable;
// `data.id` keeps the raw, unprefixed id used for URLs (see `lib/entities.ts`
// `entityUrl`), unchanged from the source JSON.
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { posixRelative } from '../paths';
import type { Loader, LoaderContext } from 'astro/loaders';

const ENTITIES_DIR = new URL('../../content/entities/', import.meta.url);

export function entitiesLoader(): Loader {
  return {
    name: 'wod20-entities-loader',
    load: async (context: LoaderContext) => {
      const { store, logger, parseData, config } = context;
      const dirPath = fileURLToPath(ENTITIES_DIR);
      let files: string[];
      try {
        files = (await fs.readdir(dirPath)).filter((name) => name.endsWith('.json')).sort();
      } catch {
        files = [];
      }
      store.clear();

      for (const fileName of files) {
        const fileUrl = new URL(fileName, ENTITIES_DIR);
        const filePath = fileURLToPath(fileUrl);
        let raw: unknown;
        try {
          raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        } catch (error) {
          logger.error(`Could not read/parse entities file ${filePath}: ${(error as Error).message}`);
          continue;
        }
        if (!Array.isArray(raw)) {
          logger.error(`Expected a JSON array in ${filePath}, got ${typeof raw}`);
          continue;
        }

        for (const item of raw as Array<{ id: string; line: string; body_es?: string }>) {
          const id = `${item.line}/${item.id}`;
          // Pre-render body_es Markdown → body_html at sync time (same pipeline as
          // the books loader: remark/rehype with GFM tables), so entity pages never
          // render Markdown at request time and tables/lists/emphasis display.
          const withHtml =
            item.body_es && item.body_es.trim()
              ? { ...item, body_html: (await context.renderMarkdown(item.body_es)).html }
              : item;
          const parsedData = await parseData({ id, data: withHtml, filePath });
          store.set({ id, data: parsedData, filePath: posixRelative(fileURLToPath(config.root), filePath) });
        }
        context.watcher?.add(filePath);
      }
    },
  };
}
