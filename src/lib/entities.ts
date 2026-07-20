// Mirrors webgen/slugs.py `entity_url`: English path segments, Spanish display
// text. Keep in sync with that module if the URL shape ever changes.
import { typeSegment } from './taxonomy';

export function entityUrl(line: string, type: string, id: string): string {
  return `/${line}/${typeSegment(type)}/${id}`;
}

export function lineUrl(line: string): string {
  return `/${line}`;
}

export function bookUrl(line: string, bookId: string): string {
  // The canonical book view is now the per-book reading site ("guía"); the flat
  // /libros/ view was retired.
  return `/${line}/guia/${bookId}`;
}
