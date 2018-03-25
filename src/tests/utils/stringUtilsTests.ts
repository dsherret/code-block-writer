import * as assert from "assert";
import {es5StringRepeat, stringRepeat} from "../../utils/stringUtils";

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
