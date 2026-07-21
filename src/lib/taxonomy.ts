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
    label_es: 'Fórmula',
    mechanical_fields: ['spheres', 'arete_min', 'practice', 'instruments', 'effect'],
  },
  'sphere-effect': { label_es: 'Efecto de Esfera', mechanical_fields: ['sphere', 'level', 'effect'] },
  wonder: { label_es: 'Maravilla', mechanical_fields: ['subtype', 'rank', 'arete', 'quintessence', 'powers'] },
  ritual: { label_es: 'Ritual', mechanical_fields: ['spheres', 'duration', 'procedure'] },
  paradigm: { label_es: 'Paradigma', mechanical_fields: [] },
  practice: { label_es: 'Práctica', mechanical_fields: ['associated_abilities'] },
  instrument: { label_es: 'Instrumento', mechanical_fields: [] },
  resonance: { label_es: 'Resonancia', mechanical_fields: ['flavor'] },
  'arcanos-power': { label_es: 'Poder de Arcanos', mechanical_fields: ['level', 'arcanos'] },
  'discipline-power': { label_es: 'Poder de Disciplina', mechanical_fields: ['level', 'discipline'] },
  artifact: { label_es: 'Artefacto', mechanical_fields: ['level'] },
  'hedge-path': { label_es: 'Senda de Hechicería', mechanical_fields: [] },
  'psychic-phenomenon': { label_es: 'Fenómeno Psíquico', mechanical_fields: [] },
  clan: { label_es: 'Clan', mechanical_fields: [] },
  'revenant-family': { label_es: 'Familia Revenant', mechanical_fields: [] },
  'changing-breed': { label_es: 'Raza Cambiante', mechanical_fields: [] },
  bane: { label_es: 'Perdición', mechanical_fields: ['rage', 'gnosis', 'willpower', 'essence', 'charms'] },
  fomor: { label_es: 'Fomor', mechanical_fields: ['willpower', 'powers'] },
  // Lane-B prose types (non-Mage lines)
  'combination-discipline': { label_es: 'Disciplina Combinada', mechanical_fields: ['disciplines', 'level', 'cost'] },
  'discipline-ritual': { label_es: 'Ritual de Disciplina', mechanical_fields: ['level', 'discipline', 'system'] },
  'thaumaturgy-path': { label_es: 'Senda de Taumaturgia', mechanical_fields: [] },
  'necromancy-path': { label_es: 'Senda de Nigromancia', mechanical_fields: [] },
  gift: { label_es: 'Don', mechanical_fields: ['rank', 'breed_auspice', 'spirit', 'system'] },
  rite: { label_es: 'Rito', mechanical_fields: ['level', 'type', 'system'] },
  fetish: { label_es: 'Fetiche', mechanical_fields: ['level', 'gnosis', 'spirit'] },
  totem: { label_es: 'Tótem', mechanical_fields: ['cost', 'bonuses'] },
  fetter: { label_es: 'Vínculo', mechanical_fields: [] },
  relic: { label_es: 'Reliquia', mechanical_fields: [] },
  'dark-arcanos': { label_es: 'Arcano Oscuro', mechanical_fields: ['level', 'arcanos'] },
  'sorcery-ritual': { label_es: 'Ritual de Hechicería', mechanical_fields: ['level'] },
  art: { label_es: 'Arte', mechanical_fields: ['level'] },
  realm: { label_es: 'Reino', mechanical_fields: ['level'] },
  cantrip: { label_es: 'Ensalmo', mechanical_fields: ['art', 'realm'] },
  treasure: { label_es: 'Tesoro', mechanical_fields: ['level'] },
  edge: { label_es: 'Filo', mechanical_fields: ['level', 'creed'] },
  conviction: { label_es: 'Convicción', mechanical_fields: [] },
  // Combat gear + signature types (add-gear-and-signature-entities)
  weapon: {
    label_es: 'Arma',
    mechanical_fields: ['weapon_class', 'damage', 'damage_type', 'difficulty', 'conceal',
      'range', 'rate', 'clip', 'strength_min', 'pathos_cost', 'material', 'faction', 'notes'],
  },
  armor: {
    label_es: 'Armadura',
    mechanical_fields: ['rating', 'penalty', 'armor_class', 'is_shield', 'shield_bonus', 'notes'],
  },
  equipment: {
    label_es: 'Equipo',
    mechanical_fields: ['category', 'cost_or_rating', 'effect', 'notes'],
  },
  derangement: {
    label_es: 'Trastorno',
    mechanical_fields: ['category', 'game_effect', 'trigger'],
  },
  numen: {
    label_es: 'Numen',
    mechanical_fields: ['category', 'roll', 'difficulty', 'cost', 'duration', 'levels'],
  },
  kith: {
    label_es: 'Linaje',
    mechanical_fields: ['pronunciation', 'affinity_realm', 'birthrights', 'frailty', 'quote', 'appearance'],
  },
  house: {
    label_es: 'Casa',
    mechanical_fields: ['court_alignment', 'tier', 'nickname', 'boon', 'flaw', 'exile_story', 'heraldry'],
  },
  legacy: { label_es: 'Legado', mechanical_fields: ['court_type', 'quest', 'ban'] },
  'secret-society': {
    label_es: 'Sociedad Secreta',
    mechanical_fields: ['membership', 'rites', 'boon', 'ban', 'recruitment'],
  },
  thorn: { label_es: 'Espina', mechanical_fields: ['cost', 'effect', 'activation'] },
  guild: {
    label_es: 'Gremio',
    mechanical_fields: ['associated_arcanos', 'guild_marks', 'role', 'status'],
  },
  'shadow-archetype': {
    label_es: 'Arquetipo de la Sombra',
    mechanical_fields: ['associated_thorn', 'dark_passions'],
  },
  'path-of-enlightenment': {
    label_es: 'Senda de Iluminación',
    mechanical_fields: ['nickname', 'virtues', 'bearing', 'ethics', 'hierarchy_of_sins'],
  },
  tactic: { label_es: 'Táctica', mechanical_fields: ['requirements', 'rolls', 'effect'] },
  // Combat compendium types (add-combat-maneuvers)
  maneuver: {
    label_es: 'Maniobra',
    mechanical_fields: ['category', 'style', 'tier', 'applies_to', 'roll', 'difficulty',
      'damage', 'min_ability', 'notes'],
  },
  'martial-art': {
    label_es: 'Arte Marcial',
    mechanical_fields: ['style_type', 'premises', 'benefits', 'eight_limbs', 'maneuvers'],
  },
  vehicle: {
    label_es: 'Vehículo',
    mechanical_fields: ['category', 'safe_speed', 'max_speed', 'maneuverability', 'crew',
      'passengers', 'durability', 'structure', 'weapons', 'notes'],
  },
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
// Spanish labels for mechanic keys. The Lane-B corpus uses many synonymous keys
// (English + Spanish variants of the same concept); they all map to one canonical
// Spanish label here. Unmapped keys fall back to a readable formatting.
const MECHANIC_LABELS: Record<string, string> = {
  // core / shared
  cost: 'Coste',
  coste: 'Coste',
  category: 'Categoría',
  categoria: 'Categoría',
  clase: 'Clase',
  effect_class: 'Clase de efecto',
  prerequisites: 'Requisitos',
  prerequisite: 'Requisito',
  requisito: 'Requisito',
  requirement: 'Requisito',
  sphere_requirement: 'Requisito de esfera',
  bonus: 'Bono',
  bono: 'Bono',
  rating_max: 'Puntuación máxima',
  ratings: 'Puntuaciones',
  rating: 'Puntuación',
  regain_condition: 'Condición de recuperación',
  level: 'Nivel',
  subtype: 'Subtipo',
  rank: 'Rango',
  rango: 'Rango',
  nature: 'Naturaleza',
  duration: 'Duración',
  duracion: 'Duración',
  notes: 'Notas',
  notas: 'Notas',
  note: 'Nota',
  nota: 'Nota',
  flavor: 'Matiz',
  reference: 'Referencia',
  referencia: 'Referencia',
  external_reference: 'Referencia',
  cross_reference: 'Referencia',
  nota_fuente: 'Nota de fuente',
  system: 'Sistema',
  sistema: 'Sistema',
  // Mage
  spheres: 'Esferas',
  esferas: 'Esferas',
  sphere: 'Esfera',
  esfera: 'Esfera',
  sphere_base: 'Esfera base',
  spheres_base: 'Esferas base',
  base_spheres: 'Esferas base',
  sphere_note: 'Nota de esfera',
  analogous_sphere: 'Esfera análoga',
  affinity_sphere: 'Esfera afín',
  esferas_afines: 'Esferas afines',
  sphere_alias: 'Alias de esfera',
  arete: 'Arete',
  arete_min: 'Arete mínimo',
  quintessence: 'Quintaesencia',
  quintaesencia: 'Quintaesencia',
  quintessence_cost: 'Coste de quintaesencia',
  coste_quintaesencia: 'Coste de quintaesencia',
  practice: 'Práctica',
  practicas_asociadas: 'Prácticas asociadas',
  associated_practices: 'Prácticas asociadas',
  instruments: 'Instrumentos',
  instrumentos_comunes: 'Instrumentos comunes',
  common_instruments: 'Instrumentos comunes',
  usual_instruments: 'Instrumentos habituales',
  instrumentos_asociados: 'Instrumentos asociados',
  instrumento: 'Instrumento',
  procedure: 'Procedimiento',
  associated_abilities: 'Habilidades asociadas',
  habilidades_asociadas: 'Habilidades asociadas',
  associated_skills: 'Habilidades asociadas',
  tecnicas_asociadas: 'Técnicas asociadas',
  paradigmas_asociados: 'Paradigmas asociados',
  associated_paradigms: 'Paradigmas asociados',
  arts: 'Artes',
  arte: 'Arte',
  wonder_type: 'Tipo de maravilla',
  wonder_subtype: 'Subtipo de maravilla',
  iluminacion: 'Iluminación',
  illumination: 'Iluminación',
  energia_primordial: 'Energía primordial',
  primal_energy: 'Energía primordial',
  background_cost: 'Coste de trasfondo',
  coste_de_trasfondo: 'Coste de trasfondo',
  coste_trasfondo: 'Coste de trasfondo',
  path_es: 'Senda',
  vulgaridad: 'Vulgaridad',
  vulgar: 'Vulgar',
  vulgar_coincident: 'Vulgar/Coincidente',
  coincidental: 'Coincidente',
  coincidence: 'Coincidente',
  coincidental_note: 'Nota de coincidencia',
  paradox: 'Paradoja',
  paradoja: 'Paradoja',
  resonance: 'Resonancia',
  resonancia: 'Resonancia',
  convention: 'Convención',
  effect: 'Efecto',
  efecto: 'Efecto',
  efecto_esfera: 'Efecto de esfera',
  stat_line: 'Bloque de rasgos',
  stat_block: 'Bloque de rasgos',
  statblock: 'Bloque de rasgos',
  // rolls / results
  successes: 'Éxitos',
  exitos: 'Éxitos',
  successes_needed: 'Éxitos necesarios',
  difficulty: 'Dificultad',
  dificultad: 'Dificultad',
  dificultad_base: 'Dificultad base',
  modifier: 'Modificador',
  modificador: 'Modificador',
  modificador_dificultad: 'Modificador de dificultad',
  roll: 'Tirada',
  tirada: 'Tirada',
  tiradas: 'Tiradas',
  dice_pool: 'Reserva de dados',
  roll_time: 'Tiempo de tirada',
  casting_time: 'Tiempo de lanzamiento',
  damage: 'Daño',
  dano: 'Daño',
  'daño': 'Daño',
  healing: 'Curación',
  resistance: 'Resistencia',
  resistencia: 'Resistencia',
  duration_note: 'Nota de duración',
  procedure_note: 'Nota de procedimiento',
  teaches: 'Enseña',
  descripciones: 'Descripciones',
  ejemplo: 'Ejemplo',
  ejemplos: 'Ejemplos',
  examples: 'Ejemplos',
  restriccion: 'Restricción',
  restriction: 'Restricción',
  area: 'Área',
  speed: 'Velocidad',
  velocidad: 'Velocidad',
  maintenance: 'Mantenimiento',
  mantenimiento: 'Mantenimiento',
  vehicle: 'Vehículo',
  vehicles: 'Vehículos',
  table: 'Tabla',
  tipo: 'Tipo',
  tipo_magia: 'Tipo de magia',
  clan: 'Clan',
  // Werewolf / Wraith / spirit
  rage: 'Rabia',
  gnosis: 'Gnosis',
  willpower: 'Fuerza de Voluntad',
  essence: 'Esencia',
  charms: 'Encantamientos',
  powers: 'Poderes',
  arcanos: 'Arcanos',
  arcano: 'Arcano',
  discipline: 'Disciplina',
  // Combat gear / maneuvers / vehicles
  weapon_class: 'Clase de arma',
  damage_type: 'Tipo de daño',
  difficulty: 'Dificultad',
  conceal: 'Ocultación',
  range: 'Alcance',
  rate: 'Cadencia',
  clip: 'Cargador',
  strength_min: 'Fuerza mínima',
  pathos_cost: 'Coste de Pathos',
  material: 'Material',
  faction: 'Facción',
  notes: 'Notas',
  rating: 'Puntuación',
  penalty: 'Penalización',
  armor_class: 'Clase de armadura',
  is_shield: 'Escudo',
  shield_bonus: 'Bonificación de escudo',
  category: 'Categoría',
  cost_or_rating: 'Coste / Puntuación',
  effect: 'Efecto',
  game_effect: 'Efecto de juego',
  trigger: 'Detonante',
  roll: 'Tirada',
  cost: 'Coste',
  duration: 'Duración',
  levels: 'Niveles',
  pronunciation: 'Pronunciación',
  affinity_realm: 'Reino afín',
  birthrights: 'Privilegios',
  frailty: 'Flaqueza',
  quote: 'Cita',
  appearance: 'Apariencia',
  court_alignment: 'Corte',
  court_type: 'Corte',
  tier: 'Rango',
  nickname: 'Apodo',
  boon: 'Favor',
  flaw: 'Defecto',
  exile_story: 'Exilio',
  heraldry: 'Heráldica',
  quest: 'Búsqueda',
  ban: 'Prohibición',
  membership: 'Membresía',
  rites: 'Rituales y ritos',
  recruitment: 'Reclutamiento',
  activation: 'Activación',
  associated_arcanos: 'Arcanos asociado',
  guild_marks: 'Marcas de gremio',
  role: 'Función',
  status: 'Estado',
  associated_thorn: 'Espina asociada',
  dark_passions: 'Pasiones oscuras',
  virtues: 'Virtudes',
  bearing: 'Porte',
  ethics: 'Ética',
  hierarchy_of_sins: 'Jerarquía de pecados',
  requirements: 'Requisitos',
  rolls: 'Tiradas',
  style: 'Estilo',
  style_type: 'Tipo de estilo',
  tier_maneuver: 'Nivel',
  applies_to: 'Se aplica a',
  min_ability: 'Habilidad mínima',
  premises: 'Premisas',
  benefits: 'Beneficios',
  eight_limbs: 'Ocho miembros',
  maneuvers: 'Maniobras',
  safe_speed: 'Velocidad segura',
  max_speed: 'Velocidad máxima',
  maneuverability: 'Maniobrabilidad',
  crew: 'Tripulación',
  passengers: 'Pasajeros',
  durability: 'Durabilidad',
  structure: 'Estructura',
  weapons: 'Armas',
};

export function mechanicLabelEs(key: string): string {
  const mapped = MECHANIC_LABELS[key];
  if (mapped) return mapped;
  // Fallback: format the raw key readably (underscores/hyphens → spaces,
  // sentence case) so unmapped keys never render like "Associated_practices".
  const spaced = key.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
