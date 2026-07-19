# wod20_web

Static [Astro](https://astro.build) website for the **Mundo de Tinieblas 20.º
aniversario** knowledge base — a Spanish-language site presenting the translated
World of Darkness 20th-Anniversary rulebook content.

This repository is consumed as a **git submodule** by the
[`wod20`](https://github.com/LudoBermejoES/wod20) knowledge-base project (mounted
at `./wod20_web`). The source rulebook Markdown lives in that parent project; this
repo is the presentation layer.

- **Framework:** Astro v7 (static output, `output: 'static'`)
- **Language:** Spanish (`lang="es"`)
- **Status:** scaffold — landing page + base layout. Content collections over the
  translated rulebooks come next.

## Commands

Run from the repo root:

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build the static site to `./dist/` |
| `npm run preview` | Preview the build locally |

## Structure

```text
src/
├── layouts/Layout.astro   base HTML shell (es, a11y landmarks, meta)
└── pages/index.astro      landing page
astro.config.mjs           static config; `site` set, `base` noted for GH Pages
```

## Deploy

Static output in `dist/`. Set `base: '/wod20_web'` in `astro.config.mjs` for a
GitHub Pages project page; leave it unset for a custom domain / Netlify / Vercel.
