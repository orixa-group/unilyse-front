export function truncateList<T>(
  items: readonly T[],
  maxVisible: number,
): { visible: T[]; overflowCount: number } {
  if (items.length <= maxVisible) {
    return { visible: [...items], overflowCount: 0 };
  }
  return {
    visible: items.slice(0, maxVisible),
    overflowCount: items.length - maxVisible,
  };
}
