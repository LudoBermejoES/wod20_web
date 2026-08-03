// "What are this entity's rated axes?" — the site's single answer, and a stated port of
// `webgen/models.py`'s `rated_axes()` / `axes_of_mechanics()` (the same rule, ported, not
// reinvented — the way `dotsGlyph` is ported in the char-creator).
//
// A trait carries `mechanics.ratings` XOR `mechanics.scales`:
//
//   * `ratings` — ONE unnamed ladder, `{rating, body_es}[]`. 182 traits. This yields the single
//     DEGENERATE axis with an empty `name_es`, which is what lets `StatBlock.astro` render every
//     pre-existing ladder through the same loop with no type test, and is why the single-ladder
//     markup is byte-identical to what the site emitted before `scales` existed.
//   * `scales` — MORE THAN ONE named, separately-rated axis, each with its own `rating_max`,
//     `allocation` and rows. `hunter/background/base-de-operaciones` is the first: Lujo, Seguridad
//     and Tamaño, one pool of 5 divided between them.
//
// `scales` wins if both are somehow present, matching the Python precedence; `webgen`'s
// `test_multi_scale_coverage.py` fails such a record rather than letting the precedence decide.
//
// A scale may cite a shared definition by `ref` instead of inlining its rows (the M20 Sorcerer
// generic Aspects, defined once at `markdown/mage/m20-sorcerer.md:287-385` and cited by 15 hedge
// Paths). SUCH A REF IS RESOLVED HERE, against a lookup the caller supplies — the port of
// `models._axis_of_scale()` + `models._shared_scale_index()`. Before the resolver existed this
// function recorded the `ref` and returned the axis ROWLESS, and `StatBlock.astro` then dropped it
// with an `isObjectArray(axis.ratings)` filter: `mage/hedge-path/curacion` rendered 0 of its 1
// cited Aspect and `sombras` 1 of its 5, while the allocation note still said "estas 5 escalas".
// A page showing a subset and claiming completeness is this change's founding defect, restated.
//
// Two properties of the Python resolver are mirrored deliberately:
//
//   * A resolved target may legitimately carry NO rows. `mage/aspect/dano-curacion` is stated as a
//     FORMULA and the book prints no rungs, so it comes back with `body_es` set and `ratings`
//     empty; the renderer prints the sentence where the table would go. `body_es` is taken ONLY
//     when the target has no rows — for the other ten Aspects that field holds the ladder's raw
//     Markdown, and printing it beside the table would show each ladder twice.
//   * An UNRESOLVABLE ref comes back with its `ref` recorded, no rows and no prose — exactly what
//     this function did for every ref before a resolver existed. `axisRenders()` is then false, so
//     the axis is not drawn AND is not counted by `allocationNoteEs()`; a scale the page cannot
//     show is never a scale the page claims to have shown.

/** One independently-rated axis of a trait. `key`/`name_es`/`allocation` are EMPTY for the
 * degenerate axis of a plain `mechanics.ratings` carrier. */
export interface Axis {
  key: string;
  name_es: string;
  rating_max?: number;
  /** `{rating, body_es}` rows in rung order. Left untyped: reference-entity `mechanics` is
   * authored outside this app, so a row is whatever the shard holds. */
  ratings: unknown[];
  allocation: string;
  ref: string;
  /** A FORMULA axis' prose: set only when a resolved `ref` target states the axis as a sentence
   * instead of tabulating it. `''` for every axis that has (or should have) rows. */
  body_es: string;
}

/** `ref` (`"<line>/<type>/<id>"`) -> the shared-scale entity, or `undefined`. The port of
 * `models._shared_scale_index().get(ref)`; built by `lib/sharedScales.ts` over the site's own
 * entity store, so nothing here holds a second copy of an Aspect's ladder. */
export type SharedScaleLookup = (ref: string) => Record<string, unknown> | undefined;

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** Rows fit to be rendered as a ladder table: a non-empty array of plain objects. Exported so the
 * renderer and `allocationNoteEs()` decide "does this axis draw?" with the SAME predicate — the
 * note over-counting the tables is the defect, and two predicates is how it comes back. */
export function isRatingRows(v: unknown): v is Array<Record<string, unknown>> {
  return (
    Array.isArray(v) && v.length > 0 && v.every((x) => x !== null && typeof x === 'object' && !Array.isArray(x))
  );
}

/** Does this axis put anything on the page — a ladder table, or a formula sentence? */
export function axisRenders(axis: Axis): boolean {
  return isRatingRows(axis.ratings) || axis.body_es !== '';
}

/** One `mechanics.scales` entry as an `Axis`. The port of `models._axis_of_scale()`: an entry is
 * either INLINE (`rating_max` + `ratings`) or a `ref`, never both, so resolution has nothing to
 * merge and nothing to prefer. */
function axisOfScale(s: Record<string, unknown>, resolve?: SharedScaleLookup): Axis {
  const ref = str(s.ref);
  const key = str(s.key);
  const name_es = str(s.name_es);
  const allocation = str(s.allocation);
  if (!ref) {
    return {
      key,
      name_es,
      rating_max: num(s.rating_max),
      ratings: Array.isArray(s.ratings) ? s.ratings : [],
      allocation,
      ref: '',
      body_es: '',
    };
  }
  const target = obj(resolve?.(ref));
  const tmech = obj(target.mechanics);
  const rows = Array.isArray(tmech.ratings) ? tmech.ratings : [];
  return {
    key,
    name_es: name_es || str(target.name_es),
    rating_max: num(tmech.rating_max),
    ratings: rows,
    allocation,
    ref,
    body_es: rows.length > 0 ? '' : str(target.body_es),
  };
}

export function ratedAxes(
  mechanics?: Record<string, unknown> | null,
  resolve?: SharedScaleLookup
): Axis[] {
  const scales = mechanics?.scales;
  if (Array.isArray(scales) && scales.length > 0) {
    return scales
      .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object' && !Array.isArray(s))
      .map((s) => axisOfScale(s, resolve));
  }
  const rows = mechanics?.ratings;
  if (Array.isArray(rows) && rows.length > 0) {
    return [
      {
        key: '',
        name_es: '',
        rating_max: num(mechanics?.rating_max),
        ratings: rows,
        allocation: '',
        ref: '',
        body_es: '',
      },
    ];
  }
  return [];
}

/** The mechanics key the ladder tables hang off, so the renderer asks `ratedAxes` once instead of
 * type-testing `mechanics` per field. `''` when the trait has no rated axis at all. */
export function axisFieldKey(mechanics?: Record<string, unknown> | null): string {
  const scales = mechanics?.scales;
  if (Array.isArray(scales) && scales.length > 0) return 'scales';
  const rows = mechanics?.ratings;
  if (Array.isArray(rows) && rows.length > 0) return 'ratings';
  return '';
}

/** How the reader is meant to SPEND points across a multi-scale trait's axes, in Spanish.
 *
 * This is the whole reason a `scales` carrier cannot just render three tables side by side: "one
 * pool of 5 divided between three 1-5 scales" is a rule stated in the book's prose ("deben dividir
 * sus puntos entre las tres categorías siguientes") that a reader cannot infer from the tables.
 * The three values are the closed `models.ALLOCATIONS` vocabulary.
 *
 * `poolMax` is the ENTITY's own `mechanics.rating_max` — for a `partitioned` trait that bounds the
 * SUM, while each axis's own `rating_max` bounds that one term. For `base-de-operaciones` both are
 * 5 and they are not the same 5.
 *
 * Returns `''` for the degenerate single-ladder case and for an unknown/absent allocation, so
 * nothing extra is emitted for the 182 traits that predate `scales`.
 *
 * IT COUNTS THE AXES THAT ACTUALLY RENDER (`axisRenders`), not every axis the record declares.
 * The two used to be the same number because every scale was inline; with `ref` scales they are
 * not, and the gap is the defect this note was written to prevent: `mage/hedge-path/sombras`
 * declares 5 axes, and before the resolver landed the page drew ONE table under a note reading
 * *"cada una de estas 5 escalas"*. A note may under-claim relative to the data (the page then
 * simply shows fewer scales); it may never over-claim relative to the page.
 */
export function allocationNoteEs(axes: Axis[], poolMax?: number): string {
  const named = axes.filter((a) => a.name_es && axisRenders(a));
  if (named.length === 0) return '';
  const allocation = named[0]!.allocation;
  if (!named.every((a) => a.allocation === allocation)) return '';
  const count = named.length;
  const one = count === 1;
  const maxes = new Set(named.map((a) => a.rating_max));
  const each = maxes.size === 1 ? [...maxes][0] : undefined;
  // Singular is not cosmetic here: a hedge Path may cite exactly ONE shared Aspect
  // (`mage/hedge-path/curacion` cites Daño/Curación and nothing else), and "estas 1 escalas" is
  // the sentence that state used to be impossible to reach.
  const upTo = each !== undefined ? (one ? `, hasta ${each}` : `, cada una hasta ${each}`) : '';
  const these = one ? 'esta escala' : `estas ${count} escalas`;
  switch (allocation) {
    case 'partitioned':
      return poolMax !== undefined
        ? `Un solo depósito de ${poolMax} puntos que se reparte entre ${these}${upTo}.`
        : `Un solo depósito de puntos que se reparte entre ${these}${upTo}.`;
    case 'independent':
      return one
        ? `Esta escala se puntúa por separado${upTo}.`
        : `Cada una de estas ${count} escalas se puntúa por separado${upTo}.`;
    case 'per-use':
      return one
        ? `Esta escala se elige en cada uso, hasta la puntuación del rasgo.`
        : `Se elige una de estas ${count} escalas en cada uso, hasta la puntuación del rasgo.`;
    default:
      return '';
  }
}
