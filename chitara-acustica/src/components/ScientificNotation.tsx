import type { ReactNode } from 'react';

const indexedVariable = /([A-Za-z])_([\p{L}\p{N}]+)/gu;

/** Render the underscore notation used in lesson strings as real typographic subscripts. */
export function formatScientificIndices(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of text.matchAll(indexedVariable)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <span key={`indexed-${index++}`}>
        {match[1]}<sub>{match[2]}</sub>
      </span>,
    );
    cursor = start + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
