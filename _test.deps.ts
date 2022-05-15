// temporary until deno_std is fixed
export { describe, it } from "https://raw.githubusercontent.com/dsherret/deno_std/make_bdd_work_dnt/testing/bdd.ts";
import { assertEquals, assertThrows } from "https://raw.githubusercontent.com/dsherret/deno_std/make_bdd_work_dnt/testing/asserts.ts";

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
