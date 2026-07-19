import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { booksLoader } from './lib/loaders/books-loader';
import { entitiesLoader } from './lib/loaders/entities-loader';

// Shared across both collections: the six game lines plus "shared" rules that
// don't belong to a single line (mirrors entity.schema.json / reading.schema.json).
const lineSchema = z.enum(['mage', 'vampire', 'werewolf', 'wraith', 'changeling', 'hunter', 'shared']);

// --- entities (webgen/schema/entity.schema.json) --------------------------

const sourceSchema = z.object({
  book_id: z.string(),
  book_title_es: z.string().optional(),
  page: z.union([z.number().int(), z.string()]).nullable().optional(),
  section_anchor: z.string().nullable().optional(),
  variant: z.enum(['base', 'reprint', 'expanded', 'variant']).default('base'),
});

const reviewSchema = z
  .object({
    reason: z.string().optional(),
    conflicts: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .loose()
  .nullable()
  .optional();

const entitySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.string(),
    line: lineSchema,
    name_en: z.string(),
    name_es: z.string(),
    body_es: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Type-specific mechanical fields (per webgen/taxonomy.json); shape
    // varies by `type`, values preserved verbatim from the source.
    mechanics: z.record(z.string(), z.unknown()).default({}),
    sources: z.array(sourceSchema).min(1),
    related: z.array(z.string()).default([]),
    review: reviewSchema,
  })
  // entity.schema.json declares `additionalProperties: true`.
  .loose();

// --- books / reading view (webgen/schema/reading.schema.json) -------------

const sectionSchema = z.object({
  title_es: z.string(),
  anchor: z.string(),
  level: z.number().int().min(1).max(6).optional(),
  body_md: z.string(),
  // Rendered by `booksLoader` at sync time (remark/rehype, same pipeline as
  // Markdown content collections) so pages never render Markdown at request time.
  body_html: z.string(),
  defines_entities: z.array(z.string()).default([]),
});

const chapterSchema = z.object({
  title_es: z.string(),
  anchor: z.string(),
  level: z.number().int().min(1).max(6).optional(),
  sections: z.array(sectionSchema),
});

const bookSchema = z.object({
  book_id: z.string(),
  line: lineSchema,
  title_es: z.string(),
  source_pdf: z.string().nullable().optional(),
  language: z.literal('es'),
  chapters: z.array(chapterSchema),
});

const books = defineCollection({
  loader: booksLoader(),
  schema: bookSchema,
});

const entities = defineCollection({
  // One file per line (`src/content/entities/<line>.json`), each holding a
  // JSON array of entities; `entitiesLoader` merges all six into one
  // collection (see that module for why a custom loader is needed here).
  loader: entitiesLoader(),
  schema: entitySchema,
});

export const collections = { books, entities };
