// temporary until deno_std 0.140 is released
export { describe, it } from "https://raw.githubusercontent.com/denoland/deno_std/dfbb3f9e21e57f71c0ceafb0dffe4692029d2602/testing/bdd.ts";
import { assertEquals, assertThrows } from "https://raw.githubusercontent.com/denoland/deno_std/dfbb3f9e21e57f71c0ceafb0dffe4692029d2602/testing/asserts.ts";

// temporary until we get this in std
export function expect<T>(value: T) {
  return {
    to: {
      deep: {
        equal(otherValue: T) {
          assertEquals(value, otherValue);
        },
      },
      equal(otherValue: T, message?: string) {
        assertEquals(value, otherValue, message);
      },
      throw(message?: string) {
        assertThrows(value as any, undefined, undefined, message);
      },
      not: {
        throw() {
          (value as any)();
        },
      },
    },
  };
}
