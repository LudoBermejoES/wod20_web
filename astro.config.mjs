// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Static site (default output). `site` is used for canonical URLs and sitemap.
// If deploying to GitHub Pages as a *project* page, also set:
//   base: '/wod20_web',
// and leave it unset for a custom domain / Netlify / Vercel.
export default defineConfig({
  site: 'https://ludobermejoes.github.io',
});
