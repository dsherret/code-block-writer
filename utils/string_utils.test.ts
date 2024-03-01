import { describe, expect, it } from "../_test.deps.ts";
import { escapeForWithinString, getStringFromStrOrFunc } from "./string_utils.ts";

describe("escapeForWithinString", () => {
  function doTest(input: string, expected: string) {
    expect(escapeForWithinString(input, "\"")).to.equal(expected);
  }

  it("should escape the quotes and newline", () => {
    doTest(`"testing\n this out"`, `\\"testing\\n\\\n this out\\"`);
  });

  function doQuoteTest(input: string, quote: string, expected: string) {
    expect(escapeForWithinString(input, quote)).to.equal(expected);
  }

  it("should escape the single quotes when specified", () => {
    doQuoteTest(`'testing "this" out'`, `'`, `\\'testing "this" out\\'`);
  });

  it("should escape regardless of if the character is already escaped", () => {
    doQuoteTest(`"testing \\"this\\" out"`, `"`, `\\"testing \\\\\\"this\\\\\\" out\\"`);
  });

  it("should escape unicode escape sequences", () => {
    doQuoteTest(`\\u0009`, `"`, `\\\\u0009`);
  });
});

describe("getStringFromStrOrFunc", () => {
  it("should return a string when given a string", () => {
    expect(getStringFromStrOrFunc("test")).to.equal("test");
  });

  it("should return a string when given a function", () => {
    expect(getStringFromStrOrFunc(() => "test")).to.equal("test");
  });
});
