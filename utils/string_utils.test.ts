import { describe, expect, it } from "../test_helpers/mocha.ts";
import { escapeChar, escapeForWithinString, getStringFromStrOrFunc } from "./string_utils.ts";

describe("escapeForWithinString", () => {
  function doTest(input: string, expected: string) {
    expect(escapeForWithinString(input, "\"")).to.equal(expected);
  }

  it("should escape the quotes and newline", () => {
    doTest(`"testing\n this out"`, `\\"testing\\\n this out\\"`);
  });
});

describe("escapeChar", () => {
  function doTest(input: string, char: string, expected: string) {
    expect(escapeChar(input, char)).to.equal(expected);
  }

  it("should throw when specifying a char length > 1", () => {
    expect(() => escapeChar("", "ab")).to.throw();
  });

  it("should throw when specifying a char length < 1", () => {
    expect(() => escapeChar("", "")).to.throw();
  });

  it("should escape the single quotes when specified", () => {
    doTest(`'testing "this" out'`, `'`, `\\'testing "this" out\\'`);
  });

  it("should escape regardless of if the character is already escaped", () => {
    doTest(`"testing \\"this\\" out"`, `"`, `\\"testing \\\\"this\\\\" out\\"`);
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
