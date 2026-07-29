// Canonical list of the six WoD20 game lines this site covers, with their
// Spanish display name and subtitle. Slugs (the `id`) are the English line
// ids used in content collections and URLs; display text is Spanish.
export interface LineInfo {
  id: 'mage' | 'vampire' | 'werewolf' | 'wraith' | 'changeling' | 'hunter' | 'shared';
  nombre: string;
  subtitulo: string;
}

export const LINES: LineInfo[] = [
  { id: 'mage', nombre: 'Mago', subtitulo: 'La Ascensión' },
  { id: 'vampire', nombre: 'Vampiro', subtitulo: 'La Mascarada' },
  { id: 'werewolf', nombre: 'Hombre Lobo', subtitulo: 'El Apocalipsis' },
  { id: 'wraith', nombre: 'Wraith', subtitulo: 'El Olvido' },
  { id: 'changeling', nombre: 'Changeling', subtitulo: 'El Ensueño' },
  { id: 'hunter', nombre: 'Cazador', subtitulo: 'La Venganza' },
  // Cross-line content that applies to EVERY line, not just combat. "Combate" was wrong and
  // actively misleading: only 3 of the 7 shared entity types are combat content (maneuvers,
  // martial arts, vehicles) -- the other 4 are archetypes, derangements, flaws and SECONDARY
  // ABILITIES, and a combat label hid that last one badly enough that it read as missing.
  // `foundry_export.py`'s LINE_ES says "Común" for the same reason; this file is what the home
  // page and the search filter actually render, so it was the stale copy of the two.
  { id: 'shared', nombre: 'Común', subtitulo: 'Contenido común a todas las líneas' },
];

export function lineInfo(id: string): LineInfo | undefined {
  return LINES.find((l) => l.id === id);
}
