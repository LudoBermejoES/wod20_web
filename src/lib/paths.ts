import { relative } from 'node:path';

/** `node:path.relative`, normalized to forward slashes (for storing in the content store). */
export function posixRelative(from: string, to: string): string {
  return relative(from, to).split('\\').join('/');
}
