export { describe, it } from "https://deno.land/std@0.139.0/testing/bdd.ts";
import { assertEquals, assertThrows } from "https://deno.land/std@0.139.0/testing/asserts.ts";

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
