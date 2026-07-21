// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
// Output stays STATIC by default — every reading/reference page is prerendered and
// zero-JS. The Node adapter enables the single on-demand route `src/pages/api/search.ts`
// (`export const prerender = false`) for semantic search backed by the local LanceDB KB
// (add-semantic-search). `site` is used for canonical URLs and sitemap.
export default defineConfig({
  site: 'https://ludobermejoes.github.io',
  adapter: node({ mode: 'standalone' }),
});
