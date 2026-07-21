// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
// Output stays STATIC by default — every reading/reference page is prerendered and
// zero-JS. The Node adapter enables the single on-demand route `src/pages/api/search.ts`
// (`export const prerender = false`) for semantic search backed by the local LanceDB KB
// (add-semantic-search). `site` is used for canonical URLs and sitemap.
//
// `middleware` mode (not `standalone`): the build emits a request `handler` instead of a
// self-starting server, so `server.mjs` can wrap it with a site-wide password gate
// (HTTP Basic Auth) that also covers the prerendered pages — Astro middleware alone runs
// at BUILD time for prerendered routes, so it can't gate them at request time.
export default defineConfig({
  site: 'https://wod.ludobermejo.es',
  adapter: node({ mode: 'middleware' }),
});
