# Reading design direction — book-reading-presentation

Status: design-research artifact for `add-book-reading-experience` task 4.0.
Owner: `astro-ui-designer`. Consumed by: `astro-engineer` (implementation).
This is a **direction to build against**, not a component spec — it does not
change `tokens.css`, `Layout.astro`, or any component; those edits happen in
the implementation task, against this document.

Scope: the reading pages introduced by `book-reading-ia`/`book-structure-recovery`
(one page per Part/Chapter, ~40–50 per book) — not the existing flat
`/‹line›/libros/‹book›` view, not the entity reference pages, though several
recommendations below (tables, dot-ratings, stat blocks) also improve those.

Everything here **layers on top of** the existing per-line token system in
`src/styles/tokens.css` (`--bg`, `--bg-elevated`, `--fg`, `--muted`, `--accent`,
`--accent-contrast`, `--border`, `--space-1…5`, `--radius`, `--font-serif`,
`--font-sans`, `--measure`) and the existing components (`Callout`, `DotRating`,
`StatBlock`, `TableOfContents`, `Breadcrumb`, `SourceBadge`). Nothing here
introduces a second theming system or hardcodes per-line hex colors — every
new visual register is *derived from* the six lines' existing tokens so it
reskins automatically per line (Mage violet, Vampire crimson, etc.).

---

## 1. Prior art — what we're taking from what

Deliberately **not** looking at documentation-site generators (Docusaurus/
Nextra/mdBook defaults) — the brief calls those out as the wrong reference
class. Instead:

1. **Google Play Books' reading font, Literata** (TypeTogether/Google Fonts,
   OFL-licensed, self-hostable) — a serif built specifically for on-screen
   long-form book reading, with a variable *optical size* axis (a "text" grade
   for body copy, a "display" grade for large headings) in one family. Taking:
   the typeface itself, and the idea of **one self-hostable family covering
   both body and display** register instead of pairing two separate font
   downloads.
2. **Tufte-CSS / Edward Tufte's handout typesetting** — small-caps section
   labels, epigraphs, generous margin whitespace, sidenotes. Taking: the
   **kicker** (small uppercase structural label above a heading) and the
   discipline of a strictly limited, reused set of typographic devices rather
   than one-off styling per page.
3. **Gwern.net** — an extremely dense long-form reference/essay corpus that
   stays legible because it never invents a new treatment per page. Taking:
   the principle that **consistency of a small vocabulary of registers**
   across ~46 pages matters more than any single page looking clever — directly
   the "unambiguous at a glance, consistent across every page" requirement.
4. **Pocket / Instapaper "reader mode" and Readwise Reader** — reading products
   whose entire job is sustained long-form reading. Taking: constrained
   measure + generous line-height + a genuinely warm (not stark) light theme
   and a genuinely dark (not blue-black) dark theme, with chrome receding so
   the text column dominates the viewport.
5. **Archives of Nethys (Pathfinder 2e SRD) and D&D Beyond's compendium** — the
   closest *genre* precedent (tabletop RPG rules reference on the web). Taking:
   the boxed, sans-labelled, tabular "stat block" register that reads as
   unmistakably *mechanics* the instant your eye lands on it, never confusable
   with prose — informing the reference/stat-block register below.
6. **The Homebrewery** (D&D 5e homebrew typesetting) — used with restraint,
   not wholesale. Taking only: chapter-opener conventions (drop caps,
   decorative rule dividers) for the fiction register — deliberately *not*
   its parchment textures/background art, to stay zero-JS, fast, and
   consistent with this site's flat, token-driven minimalism.
7. **Editorial longform (NYT Magazine, The Guardian Long Read)** — Taking: serif
   body / sans UI-chrome contrast, the kicker-above-headline pattern (reused
   from Tufte above), and a plain horizontal rule as the lightweight
   section-break device between major blocks.

---

## 2. Type scale

Fluid via `clamp()`, mobile → desktop, in the pattern already used for
`--pad`. All sizes assume the existing 1.65 body line-height convention in
`Layout.astro`; fiction gets slightly more (1.7 — italics/ornament need more
air). Structural labels ("kicker") and reference material use the sans stack;
everything meant to be *read* (prose, fiction, headings) uses the serif stack.

| Role | Font | Size | Line-height | Weight | Notes |
|---|---|---|---|---|---|
| Kicker (`LIBRO I · CAPÍTULO 3 · PARTE II`) | sans | `0.75rem` | 1.4 | 700 | uppercase, `letter-spacing: 0.08em`, `color: var(--accent)` |
| H1 (page/Part title) | serif | `clamp(1.85rem, 1.5rem + 1.8vw, 2.75rem)` | 1.15 | 700 | `letter-spacing: -0.01em` |
| Dek (optional one-line summary under H1) | serif italic | `clamp(1.05rem, 1rem + 0.3vw, 1.25rem)` | 1.45 | 400 | `color: var(--muted)` |
| H2 (in-page major heading) | serif | `clamp(1.4rem, 1.2rem + 1vw, 1.9rem)` | 1.25 | 700 | |
| H3 (sub-section / demoted mini-TOC anchor) | serif | `clamp(1.15rem, 1.05rem + 0.5vw, 1.4rem)` | 1.3 | 700 | |
| H4 (minor label heading, e.g. a stat-block group title) | sans | `1rem` | 1.4 | 700 | uppercase, `letter-spacing: 0.04em`, `color: var(--muted)` — matches kicker register, signals "this is metadata, not prose" |
| Body prose | serif | `clamp(1rem, 0.97rem + 0.15vw, 1.125rem)` | 1.65 | 400 | optional `font-feature-settings: 'onum' 1` for oldstyle figures in running text |
| Fiction body | serif | same as body | 1.7 | 400 | **not** set in italic wholesale (see §6 — sustained italics hurt legibility; italics reserved for the opening line only) |
| Reference/table cells, numeric | sans | `0.95em` of body | 1.5 | 400 | `font-variant-numeric: tabular-nums` |
| Table cells, prose-like (e.g. glossary) | serif | body size | 1.5 | 400 | matches surrounding prose register |
| Caption / SourceBadge / footnote | sans | `0.85rem` | 1.4 | 400 | `color: var(--muted)` (existing) |
| Blockquote | serif italic | body size | 1.6 | 400 | `color: var(--muted)` (existing, unchanged) |

**Measure**: the existing `--measure: 68ch` already satisfies the spec's
~66ch target (within the stated 45–75ch tolerance) — no change required. It
stays the max-width for body prose, fiction, blockquotes, stat-block `dl`s,
and the mini-TOC. Wide reference tables are the one deliberate exception
(`max-width: none`, already the case in `Layout.astro`'s `.prose table`) since
constraining a multi-column stat table to 68ch causes wrapping that hurts
scannability more than it helps.

**Responsive rule**: only `clamp()` and the existing single grid breakpoint
(§6, sidebar) change layout — no separate mobile/desktop type scales to
maintain.

---

## 3. Typography — families

- **Reading serif (body + headings): Literata**, self-hosted, Latin +
  Latin-Extended subset (needed for á é í ó ú ñ ü ¿ ¡). Static instances
  recommended over the full variable font for a predictable payload: Regular
  400, Italic 400, SemiBold 600, Bold 700 (4 × woff2, Latin-Extended subset,
  roughly 20–35 KB each). `font-display: swap`; preload only the Regular
  weight (`<link rel="preload" as="font" type="font/woff2" crossorigin>`)
  since it's the majority of above-the-fold text. Fallback stack unchanged:
  `--font-serif: 'Literata', ui-serif, Georgia, 'Times New Roman', serif;` —
  system serif remains a perfectly legible fallback if self-hosting is ever
  deferred, so nothing regresses if the font fails to load.
- **UI sans (nav, breadcrumbs, kicker, sidebar, mini-TOC labels, stat-block
  labels, table headers, captions): unchanged system-ui stack**
  (`--font-sans`, already in `tokens.css`) — zero bytes, zero risk, and the
  serif/sans split is itself the primary signal separating "chrome/metadata"
  from "content to read."
- **Monospace** (dice notation, code): unchanged `ui-monospace` stack.
- No external font CDN (Google Fonts `<link>`, etc.) — self-host the woff2
  files under `public/fonts/` per the static/CSP/zero-JS constraint.

---

## 4. Vertical rhythm

Builds on the existing `--space-1…5` scale (`0.25rem…2.5rem`); no new scale
needed, but two rules to make hierarchy visible through spacing, not just
size, and one new named step for major page-level breaks:

- **Heading top-margin scales with level, bottom-margin stays tight** — more
  air *above* a heading than below it (classic editorial rule: the heading
  belongs with what follows, not what precedes):
  - `h1`: n/a (top of page)
  - `h2`: `margin-block: var(--space-5) 0.4em` (2.5rem before — a real section
    break)
  - `h3`: `margin-block: var(--space-4) 0.35em` (1.5rem before)
  - `h4`: `margin-block: var(--space-3) 0.3em` (1rem before)
  - `:where(h1,h2,h3,h4) + *`: `margin-block-start: 0` (no double gap when a
    heading is immediately followed by content)
- **Paragraph rhythm**: unchanged, `margin-block: 0 1em` (existing `.prose`
  rule).
- **New token — `--space-6: 4rem`**, for the rare full block-level break: the
  gap before/after a fiction interlude returning to rules prose, and between
  Parts on the rare oversized page that had to be split (D6/D2 Tier-2). This
  is the one new spacing step; everything else reuses `--space-1…5`.
- **Section-break device**: between major blocks (not every heading — only
  where content genuinely changes register, e.g. rules → fiction → rules), a
  plain centered horizontal rule at ~30% measure width,
  `border-top: 1px solid var(--border)`, `margin-block: var(--space-6)`
  — the "editorial hairline" from NYT/Guardian longform, not a heading.

---

## 5. Palette — composing with the per-line theme token

No new hues, no new per-line hardcoding. Everything derives from the six
existing tokens per line (`--bg`, `--bg-elevated`, `--fg`, `--muted`,
`--accent`, `--border`), so the reading design reskins automatically across
all six lines (Mage violet, Vampire crimson, Werewolf rust, Wraith slate,
Changeling verdant, Hunter amber) in both the dark default and the
`prefers-color-scheme: light` variant already defined in `tokens.css`.

- **`--accent` is used sparingly and only as a *pointer*, never as a fill for
  body text or large areas**: links, the kicker label, dot-rating pips,
  blockquote's left border, the fiction-register tint (below), and the
  section-break hairline's rare accent variant. Never as running-text color
  (contrast risk + it stops meaning anything if it's everywhere).
- **Three visual registers, built from existing tokens, each unambiguous on
  sight** (this directly answers "how rules vs fiction vs reference are
  differentiated" — see full treatment in §6):
  1. **Rules prose** — plain: `--fg` on `--bg`, serif, no box, no tint. The
     neutral baseline register everything else contrasts against.
  2. **Fiction interlude** — a background tint derived from the line's own
     accent: `--bg-fiction: color-mix(in oklab, var(--accent) 8%, var(--bg-elevated))`.
     This is a **new token to add** in the implementation task (one line in
     `tokens.css`'s `:root`, inherited by every line automatically — no
     per-line override needed since it's a `color-mix()` off the two tokens
     each line already redefines). Because it's derived, Mage fiction gets a
     faint violet cast, Vampire fiction a faint crimson cast, etc., for free.
  3. **Reference/stat block** — `--bg-elevated`, `1px solid var(--border)`,
     sans labels — already exactly what `StatBlock.astro` and `Callout.astro`
     do today; extend the same box treatment to new reading-page reference
     content rather than inventing a fourth container style.
- **Contrast obligation for the one new token**: `--bg-fiction` must be
  re-checked for body-text contrast (`--fg` on `--bg-fiction` ≥ 4.5:1) per
  line per theme (12 combinations: 6 lines × dark/light) before shipping,
  same bar `tokens.css`'s header comment already states for the existing
  tokens — an 8% mix is chosen to be safe by construction (it barely moves
  luminance) but must still be spot-checked, not assumed.
- **Light theme is a genuinely warm reading paper, not an inverted dark
  theme** — already true in `tokens.css` (`--bg: #f7f4ef` base, and each
  line's light `--bg` is a tinted off-white, e.g. Mage `#f6f2fb`) — keep this
  as-is; it already matches the "warm reading paper" reference from Pocket/
  Instapaper in §1. Nothing to change here.

---

## 6. Distinct treatment per content type / component

### Rules prose
Baseline register (§5.1). Serif, `--fg`/`--bg`, no box, no tint, no icon. If
everything else is correctly differentiated, rules prose is what's left when
you subtract fiction/reference/tables/quotes — it should look the *plainest*
page element, by design.

### Fiction interludes
The core fix for "everything looks the same." Rendered as a distinct wrapper
(new semantic element, e.g. `<aside class="interlude">` or a `content_type:
fiction` block from `book-structure-recovery`), **not** reusing `Callout`
(that component's amber/red left-border reads as a warning/admonition, which
is the wrong signal for narrative fiction) and **not** a `blockquote` (that's
reserved for actual quoted text/epigraphs within rules prose):

- Background: `--bg-fiction` (§5), full measure width, generous
  `padding: var(--space-4)`, `border-radius: var(--radius)` — an *inset*, not
  a bordered box (no `border`, no accent left-rule) so it reads as "a
  different kind of page," not "an alert."
- **Do not italicize the whole passage.** Sustained italic text is measurably
  harder to read at length — the opposite of the legibility goal. Instead:
  - The interlude's **opening line/sentence** in italic (a `.lede` span) —
    the print convention for a scene's first beat — then roman for the rest.
  - A **drop cap** on the first paragraph's first letter
    (`.interlude > p:first-of-type::first-letter`, pure CSS, `font-size:
    2.6em`, `line-height: 0.8`, `float: left`, `color: var(--accent)`) — a
    Homebrewery/print-book flourish, cheap and zero-JS.
  - A small decorative rule/mark at the top of the block (e.g. a centered
    `···` or a 2px accent-colored short rule) as the "you have entered a
    fiction interlude" signal that doesn't depend on color perception alone.
- Kept out of the in-page mini-TOC's heading hierarchy visually (still
  anchor-linkable, but the mini-TOC entry gets a small icon/label like
  "(relato)" so scanning the TOC also signals register, not just the page).

### Reference / stat blocks
Already partially built (`StatBlock.astro`): keep and extend its register —
`--bg-elevated` box, `1px solid var(--border)`, sans uppercase muted labels
(`dt`), `tabular-nums` for numeric values, dot-rating pips for rated fields.
New reading-page reference content (e.g. a Sphere/Foundation table, a merit
list) should reuse this exact box, not invent a new one. This is deliberately
the *opposite pole* from fiction: sans not serif, boxed not inset, tabular
not narrative, muted not tinted — reference material should look
unmistakably "look this up," fiction should look unmistakably "read this as a
scene."

### Tables
Extend `Layout.astro`'s existing `.prose table` rules:
- Add zebra striping for wide/dense tables: `tbody tr:nth-child(even) { background: color-mix(in oklab, var(--bg-elevated) 60%, transparent); }` — helps row-tracking on multi-column mechanical tables (weapon stats, XP costs) without a hard border grid.
- Numeric columns: `font-variant-numeric: tabular-nums`, right- or
  center-aligned (per §2's numeric-vs-prose table rule); prose-like table
  cells (glossary, cross-reference tables) stay left-aligned serif.
- Very wide tables: wrap in a `div` with `overflow-x: auto` and
  `th { position: sticky; top: 0; }` inside that scroll container — pure CSS,
  no JS, prevents horizontal page overflow on narrow viewports (existing
  `.prose table { max-width: none }` already opts out of the measure
  constraint for these).

### Dot-ratings
Unchanged (`DotRating.astro` already correct: accent-colored pips, accessible
label). Ensure the reading pages' body copy size context doesn't shrink pips
below the existing `0.95em` — keep as a drop-in component.

### Block-quotes
Unchanged (`Layout.astro`'s existing `.prose blockquote`: `border-inline-start:
3px solid var(--accent)`, italic, `--muted`) — reserved for actual quoted
text/epigraphs inside rules prose. Do not reuse for fiction (see above) or
for callouts (that's `Callout.astro`'s job).

### In-page mini-TOC
Existing `TableOfContents.astro` box treatment is right (bordered,
`--bg-elevated`, sans, uppercase label) — kept. Placement changes at the
layout breakpoint (§ below): on wide viewports it sits `position: sticky;
top: var(--space-4)` in a right-hand gutter column beside the measure column
(not competing with reading width); on narrow viewports it renders inline,
directly under the kicker/H1, non-sticky, as it does today.

### Sidebar (book-wide chapter/part tree)
Deliberately **not** a permanently-visible left rail — that's the generic
docs-site pattern the brief says to avoid, and a ~40–50-entry tree competing
with a 68ch reading column for width undermines "content dominates chrome"
(the Kindle/iBooks/Reader-app philosophy from §1.3). Instead: a native
`<details><summary>Índice del libro</summary>…</details>` block placed right
under the breadcrumb, **collapsed by default**, zero-JS. This is a genuine
design decision, not a fallback: the persistent, always-visible wayfinding
element is the *short*, page-local mini-TOC + prev/next; the *long*,
book-wide tree is opt-in. Style the `<summary>` to match the kicker register
(sans, small, uppercase-ish) so it doesn't look like a stray control.

### Breadcrumbs
Unchanged component; add the **kicker line** (§2) as a second, complementary
wayfinding element directly above the H1 — not a duplicate of the breadcrumb,
but a same-page structural label (`LIBRO I · CAPÍTULO 3 · PARTE II`) that's
visible even without scrolling up to the breadcrumb, and reinforces position
in the hierarchy the instant the page renders.

### Layout breakpoint (sidebar/mini-TOC placement only)
Single breakpoint, `min-width: 1024px`:
- `< 1024px`: single column, full measure-constrained content, mini-TOC
  inline non-sticky, sidebar `<details>` collapsed.
- `>= 1024px`: a two-column grid on the reading-page wrapper,
  `grid-template-columns: minmax(0, var(--measure)) minmax(200px, 260px);
  column-gap: var(--space-5);`, mini-TOC sticky in the second column, sidebar
  `<details>` still collapsed by default (short book-tree access doesn't need
  the extra column — keeping it collapsed everywhere is the differentiator
  from docs sites, not just a mobile compromise).
No JS at either size; `<details>` and `position: sticky` are load-bearing
CSS-only mechanisms throughout.

---

## 7. How the hierarchy stays unambiguous, page after page

A fixed, small vocabulary, reused identically on all ~46 pages of every book
(never redesigned per page):

```
kicker (sans, uppercase, accent, 0.75rem)      "LIBRO I · CAPÍTULO 3 · PARTE II"
  ↓
H1 (serif, bold, largest, clamp 1.85–2.75rem)  the Part/Chapter title
  ↓
dek (serif italic, muted, optional)            one-line summary, if present
  ↓
breadcrumb (sans, small, muted) — already rendered above the kicker
  ↓
mini-TOC (sans, boxed, bg-elevated)            page-local headings
  ↓
body (serif, --fg, 1.65 line-height, 68ch)     rules prose — the default state
  │
  ├─ fiction interlude (serif, bg-fiction tint, opening-line italic + drop cap, no border)
  ├─ reference/stat block (sans labels, bg-elevated box, border, tabular nums)
  ├─ table (serif or sans cells per content, zebra striping, sticky header if wide)
  ├─ blockquote (serif italic, accent left-border, muted)
  └─ section-break hairline (thin border, --space-6 gap) between register changes
  ↓
prev/next (sans, small, border-top hairline)
```

Because every register maps to exactly one font-family + weight + box
treatment + color source, a reader only has to learn the system once — by
page 2 of any book, "boxed + sans + tabular" reads as *mechanics*, "tinted +
no border + drop cap" reads as *story*, "plain serif" reads as *rules*, with
no need to consciously parse which is which. This is the concrete answer to
D8's "beauty and clarity are explicit design goals" and the
book-reading-presentation spec's "consistent across every page in the book"
scenario.

---

## 8. Proposed new tokens (for `astro-engineer` to add, not added here)

```css
/* tokens.css :root — additions, not per-line overrides */
--space-6: 4rem;                 /* major block-level break (fiction ↔ rules, split Parts) */
--bg-fiction: color-mix(in oklab, var(--accent) 8%, var(--bg-elevated));
```

No other new tokens; no per-line hex additions. Font-family additions are
scoped to `--font-serif`'s value (swap in Literata ahead of the existing
fallbacks), not a new variable.

## 9. What this document does not decide
Implementation details (exact component/file names for the fiction wrapper,
whether the mini-TOC's "(relato)" tag is a real string or an icon, the exact
`<details>` disclosure triangle styling) are `astro-engineer`'s call at build
time, consistent with the registers and tokens fixed above. The pilot
(`m20-core-rulebook-es`) should be reviewed against §§5–7 of this document —
beauty (typographic quality, coherence) and clarity (unambiguous register at
a glance) — per the spec's acceptance scenario, not against a generic a11y
checklist alone.
