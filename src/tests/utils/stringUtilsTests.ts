import * as assert from "assert";
import {es5StringRepeat, stringRepeat, escapeChar, escapeForWithinString, getStringFromStrOrFunc} from "../../utils/stringUtils";

describe("string repeat", () => {
    function doTests(func: (str: string, times: number) => string) {
        it("should repeat the string", () => {
            assert.equal(func(" ", 2), "  ");
        });

        it("should not repeat the string if specifying 0", () => {
            assert.equal(func(" ", 0), "");
        });

        it("should throw if specifying a negative number", () => {
            assert.throws(() => func(" ", -1));
        });
    }

    describe("es5StringRepeat", () => {
        doTests(es5StringRepeat);
    });

    describe("stringRepeat", () => {
        doTests(stringRepeat);
    });
});

describe("escapeForWithinString", () => {
    function doTest(input: string, expected: string) {
        assert.equal(escapeForWithinString(input, "\""), expected);
    }

    it("should escape the quotes and newline", () => {
        doTest(`"testing\n this out"`, `\\"testing\\\n this out\\"`);
    });
});

describe("escapeChar", () => {
    function doTest(input: string, char: string, expected: string) {
        assert.equal(escapeChar(input, char), expected);
    }

    it("should throw when specifying a char length > 1", () => {
        assert.throws(() => escapeChar("", "ab"));
    });

    it("should throw when specifying a char length < 1", () => {
        assert.throws(() => escapeChar("", ""));
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
        assert.equal(getStringFromStrOrFunc("test"), "test");
    });

    it("should return a string when given a function", () => {
        assert.equal(getStringFromStrOrFunc(() => "test"), "test");
    });
});
