/** @internal */
export function mergeSets<T>(sets: Set<T>[]): Set<T> {
  switch (sets.length) {
    case 0:
      return new Set<T>();
    case 1:
      return sets[0];
    default:
      const out = sets[0];
      for (let i = 1; i < sets.length; i++) {
        for (const entry of sets[i]) {
          out.add(entry);
        }
      }

      return out;
  }
}
