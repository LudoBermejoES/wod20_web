// Presentation layer for entity-type and mechanics-key labels.
//
// THE TABLES ARE NOT HERE ANY MORE. `TypeInfo`, `TYPE_INFO` and `MECHANIC_LABELS` live in
// `./taxonomy.gen`, emitted by `webgen/web_taxonomy_export.py` from `webgen/taxonomy.json` +
// `webgen/mechanic_labels.json` and byte-diffed by `webgen/tests/test_derivation_drift.py`.
//
// This file used to carry its own copy of the type table, described in its own header as "a
// hand-kept, read-only copy scoped to what the site currently renders". It was the only consumer of
// `mechanical_fields` anywhere, and measured against the canonical registry it disagreed on 41 of
// the 57 types it declared, omitted 7 the registry declares, and declared 5 the registry did not --
// with nothing comparing the two, because a diff-based check cannot run in the CI job that clones no
// submodules. Adding a type here can no longer grant it rendering support: the generator FAILS if a
// shipped type is not registered with a `label_es`.
//
// What stays hand-written is presentation, not data: the fallback formatters (a title-caser for an
// unknown type, a readable formatter for an unlabelled mechanics key), the URL pluralisation rule,
// and the line/sphere label tables, which are site choices rather than mirrors -- `SPHERE_LABELS`
// says `prime -> Prima` where `pipeline/glossary.json` says `Cardinal`, and deriving it would change
// what the site renders.
import { MECHANIC_LABELS, TYPE_INFO, type TypeInfo } from './taxonomy.gen';

export { TYPE_INFO };
export type { TypeInfo };

export function typeLabelEs(type: string): string {
  const info = TYPE_INFO[type];
  if (info) return info.label_es;
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** English type -> plural URL segment, matching webgen/slugs.py `entity_url`. */
export function typeSegment(type: string): string {
  return type.endsWith('s') ? type : `${type}s`;
}

const LINE_LABELS: Record<string, string> = {
  mage: 'Mago',
  vampire: 'Vampiro',
  werewolf: 'Hombre Lobo',
  wraith: 'Wraith',
  changeling: 'Changeling',
  hunter: 'Cazador',
  shared: 'Común',
};

export function lineLabelEs(line: string): string {
  return LINE_LABELS[line] ?? line;
}

// The nine Mage spheres (canonical WoD20 set), for labelling `mechanics.spheres`.
const SPHERE_LABELS: Record<string, string> = {
  correspondence: 'Correspondencia',
  entropy: 'Entropía',
  forces: 'Fuerzas',
  life: 'Vida',
  matter: 'Materia',
  mind: 'Mente',
  prime: 'Prima',
  spirit: 'Espíritu',
  time: 'Tiempo',
};

export function sphereLabelEs(sphere: string): string {
  return SPHERE_LABELS[sphere.toLowerCase()] ?? typeLabelEs(sphere);
}

export function mechanicLabelEs(key: string): string {
  const mapped = MECHANIC_LABELS[key];
  if (mapped) return mapped;
  // Fallback: format the raw key readably (underscores/hyphens → spaces,
  // sentence case) so unmapped keys never render like "Associated_practices".
  // `MECHANIC_LABELS` is incomplete by verdict, not by neglect -- nothing in the corpus states a
  // Spanish label for a mechanics key, so this path is load-bearing rather than exceptional (2,638
  // of 14,104 rendered rows), and it is already correct for the accidental Spanish (`nivel`,
  // `tribu`, `raza`). Its coverage is ratcheted by `models.MECHANIC_LABEL_RATCHET`.
  const spaced = key.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
