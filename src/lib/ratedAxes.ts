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
// generic Aspects). No entity carries one today and there is no resolver, so the axis comes back
// with its `ref` recorded and NO rows; a rowless axis renders no table rather than an empty one.

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
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

export function ratedAxes(mechanics?: Record<string, unknown> | null): Axis[] {
  const scales = mechanics?.scales;
  if (Array.isArray(scales) && scales.length > 0) {
    return scales
      .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object' && !Array.isArray(s))
      .map((s) => ({
        key: str(s.key),
        name_es: str(s.name_es),
        rating_max: num(s.rating_max),
        ratings: Array.isArray(s.ratings) ? s.ratings : [],
        allocation: str(s.allocation),
        ref: str(s.ref),
      }));
  }
  const rows = mechanics?.ratings;
  if (Array.isArray(rows) && rows.length > 0) {
    return [
      { key: '', name_es: '', rating_max: num(mechanics?.rating_max), ratings: rows, allocation: '', ref: '' },
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
 */
export function allocationNoteEs(axes: Axis[], poolMax?: number): string {
  const named = axes.filter((a) => a.name_es);
  if (named.length === 0) return '';
  const allocation = named[0]!.allocation;
  if (!named.every((a) => a.allocation === allocation)) return '';
  const count = named.length;
  const maxes = new Set(named.map((a) => a.rating_max));
  const each = maxes.size === 1 ? [...maxes][0] : undefined;
  const upTo = each !== undefined ? `, cada una hasta ${each}` : '';
  switch (allocation) {
    case 'partitioned':
      return poolMax !== undefined
        ? `Un solo depósito de ${poolMax} puntos que se reparte entre estas ${count} escalas${upTo}.`
        : `Un solo depósito de puntos que se reparte entre estas ${count} escalas${upTo}.`;
    case 'independent':
      return `Cada una de estas ${count} escalas se puntúa por separado${upTo}.`;
    case 'per-use':
      return `Se elige una de estas ${count} escalas en cada uso, hasta la puntuación del rasgo.`;
    default:
      return '';
  }
}
