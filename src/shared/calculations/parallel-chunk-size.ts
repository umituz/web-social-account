/**
 * Item chunking for parallel processing with a concurrency cap.
 *
 * Splits an array into consecutive slices of at most `chunkSize` items
 * so callers can `await Promise.all(slice.map(...))` per slice.
 */

export const chunkItems = <T>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};
