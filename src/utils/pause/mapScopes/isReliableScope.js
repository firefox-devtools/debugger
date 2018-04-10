/**
 * Consider a scope and its parents reliable if the vast majority of its
 * bindings were successfully mapped to generated scope bindings.
 */
export function isReliableScope(scope: OriginalScope): boolean {
  let totalBindings = 0;
  let unknownBindings = 0;

  for (let s = scope; s; s = s.parent) {
    const vars = (s.bindings && s.bindings.variables) || {};
    for (const key of Object.keys(vars)) {
      const binding = vars[key];

      totalBindings += 1;
      if (
        binding.value &&
        typeof binding.value === "object" &&
        (binding.value.type === "unscoped" || binding.value.type === "unmapped")
      ) {
        unknownBindings += 1;
      }
    }
  }

  // As determined by fair dice roll.
  return totalBindings === 0 || unknownBindings / totalBindings < 0.9;
}
