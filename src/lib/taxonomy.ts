// Spanish display labels and mechanical-field metadata for reference entity
// types, mirrored (Mage pilot + shared types only) from the canonical
// taxonomy at `webgen/taxonomy.json`. That file is tooling-side (Python) and
// lives outside this Astro project, so this is a hand-kept, read-only copy
// scoped to what the site currently renders. If a type is missing here, the
// UI falls back to a title-cased version of the raw `type` string.

export interface TypeInfo {
  /** Spanish label for the entity type (singular). */
  label_es: string;
  /** Mechanical fields this type carries, in display order. */
  mechanical_fields: string[];
}

export const TYPE_INFO: Record<string, TypeInfo> = {
  merit: { label_es: 'Mérito', mechanical_fields: ['cost', 'category', 'prerequisites'] },
  flaw: { label_es: 'Defecto', mechanical_fields: ['bonus', 'category', 'prerequisites'] },
  background: { label_es: 'Trasfondo', mechanical_fields: ['rating_max', 'ratings'] },
  archetype: { label_es: 'Arquetipo', mechanical_fields: ['regain_condition'] },
  rote: {
    label_es: 'Rutina',
    mechanical_fields: ['spheres', 'arete_min', 'practice', 'instruments', 'effect'],
  },
  'sphere-effect': { label_es: 'Efecto de Esfera', mechanical_fields: ['sphere', 'level', 'effect'] },
  wonder: { label_es: 'Prodigio', mechanical_fields: ['subtype', 'rank', 'arete', 'quintessence', 'powers'] },
  ritual: { label_es: 'Ritual', mechanical_fields: ['spheres', 'duration', 'procedure'] },
  paradigm: { label_es: 'Paradigma', mechanical_fields: [] },
  practice: { label_es: 'Práctica', mechanical_fields: ['associated_abilities'] },
  instrument: { label_es: 'Instrumento', mechanical_fields: [] },
  resonance: { label_es: 'Resonancia', mechanical_fields: ['flavor'] },
};

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

// Spanish labels for the generic mechanical-field keys used across taxonomy
// types (task 1.1's `mechanical_fields` lists).
const MECHANIC_LABELS: Record<string, string> = {
  cost: 'Coste',
  category: 'Categoría',
  prerequisites: 'Requisitos',
  bonus: 'Bono',
  rating_max: 'Puntuación máxima',
  ratings: 'Puntuaciones',
  regain_condition: 'Condición de recuperación',
  spheres: 'Esferas',
  arete_min: 'Arete mínimo',
  practice: 'Práctica',
  instruments: 'Instrumentos',
  effect: 'Efecto',
  sphere: 'Esfera',
  level: 'Nivel',
  subtype: 'Subtipo',
  rank: 'Rango',
  arete: 'Arete',
  quintessence: 'Quintaesencia',
  powers: 'Poderes',
  duration: 'Duración',
  procedure: 'Procedimiento',
  associated_abilities: 'Habilidades asociadas',
  flavor: 'Matiz',
};

export function mechanicLabelEs(key: string): string {
  return MECHANIC_LABELS[key] ?? typeLabelEs(key);
}
