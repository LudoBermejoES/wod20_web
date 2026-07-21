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
  // Cross-line content (Storyteller System): combat maneuvers, martial arts, vehicles.
  { id: 'shared', nombre: 'Reglas Generales', subtitulo: 'Sistema Narrador' },
];

export function lineInfo(id: string): LineInfo | undefined {
  return LINES.find((l) => l.id === id);
}
