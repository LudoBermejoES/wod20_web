// The site's shared-scale index: `"<line>/<type>/<id>" -> the entity`, for every entity a
// `mechanics.scales[].ref` may cite. The port of `webgen/models.py`'s `_shared_scale_index()`,
// and the only place the reading site resolves a ref.
//
// SOURCE: the site's own `entities` collection (`src/content/entities/<line>.json`), which is what
// `regen.py` syncs out of `webgen/data/entities/`. Reading the store rather than shipping a second
// copy of the Aspects' ladders is the whole point of modelling a shared scale as an entity: the
// corpus prints those rungs once (`markdown/mage/m20-sorcerer.md:287-385`), so the site stores them
// once and 15 hedge Paths cite them.
//
// LAZY AND MEMOISED ON THE PROMISE, and that is load-bearing rather than an optimisation:
// `StatBlock.astro` renders ~10,000 times in a build (every entity, as a card and again on its
// detail page), and an index rebuilt per render would walk the whole ~9,900-record collection each
// time. The first stat block pays for the walk; every later one awaits the same resolved promise.
// A build whose pages carry no `ref` still pays it once, which is the one place this differs from
// the Python resolver — `getCollection` is not cheap to make conditional and the walk is O(n) once.
import { getCollection } from 'astro:content';
import type { SharedScaleLookup } from './ratedAxes';

/** Entity types a `mechanics.scales[].ref` may name. Mirrors `models.SHARED_SCALE_TYPES` — one
 * member today (`aspect`, the 11 generic M20 Sorcerer Aspects), a set so a second line needing the
 * same idea does not change the shape of anything here. */
const SHARED_SCALE_TYPES = new Set(['aspect']);

let indexPromise: Promise<Map<string, Record<string, unknown>>> | null = null;

async function buildIndex(): Promise<Map<string, Record<string, unknown>>> {
  const index = new Map<string, Record<string, unknown>>();
  const entries = await getCollection('entities');
  for (const entry of entries) {
    const data = entry.data as unknown as Record<string, unknown>;
    if (!SHARED_SCALE_TYPES.has(String(data.type))) continue;
    const key = `${data.line}/${data.type}/${data.id}`;
    // `setdefault` semantics, exactly as the Python index: first writer wins, so a duplicate id
    // cannot make the rendering depend on collection order.
    if (!index.has(key)) index.set(key, data);
  }
  return index;
}

/** The lookup `ratedAxes()` takes. Resolves to a function so a caller can `await` it once in
 * component frontmatter and then resolve synchronously per axis. */
export async function sharedScaleLookup(): Promise<SharedScaleLookup> {
  if (!indexPromise) indexPromise = buildIndex();
  const index = await indexPromise;
  return (ref: string) => index.get(ref);
}
