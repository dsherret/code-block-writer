var assert = require("assert");
var code_block_writer_1 = require("./../code-block-writer");
function getWriter() {
    return new code_block_writer_1.default();
}
function doTest(expected, writerCallback) {
    var writer = getWriter();
    writerCallback(writer);
    assert.equal(writer.toString(), expected);
}
describe("CodeBlockWriter", function () {
    describe("write", function () {
        it("should write the text", function () {
            var expected = "test";
            doTest(expected, function (writer) {
                writer.write("test");
            });
        });
    });
    describe("block()", function () {
        it("should write text inside a block", function () {
            var expected = "test {\n    inside\n}\n";
            doTest(expected, function (writer) {
                writer.write("test").block(function () {
                    writer.write("inside");
                });
            });
        });
        it("should write text inside a block inside a block", function () {
            var expected = "test {\n    inside {\n        inside again\n    }\n}\n";
            doTest(expected, function (writer) {
                writer.write("test").block(function () {
                    writer.write("inside").block(function () {
                        writer.write("inside again");
                    });
                });
            });
        });
        it("should not do an extra space if there was a space added before the block", function () {
            var expected = "test {\n    inside\n}\n";
            doTest(expected, function (writer) {
                writer.write("test ").block(function () {
                    writer.write("inside");
                });
            });
        });
        it("should put the brace on the next space if there is a newline before it", function () {
            var expected = "test {\n    inside\n\n    inside\n}\n";
            doTest(expected, function (writer) {
                writer.write("test ").block(function () {
                    writer.writeLine("inside").newLine().write("inside");
                });
            });
        });
    });
    describe("writeLine()", function () {
        it("should write some text on a line", function () {
            var expected = "test\n";
            doTest(expected, function (writer) {
                writer.writeLine("test");
            });
        });
        it("should start writing on a newline if the last one was just writing", function () {
            var expected = "test\ntest\ntest\n";
            doTest(expected, function (writer) {
                writer.writeLine("test").write("test").writeLine("test");
            });
        });
        it("should not create a newline between two writeLines", function () {
            var expected = "test\ntest\n";
            doTest(expected, function (writer) {
                writer.writeLine("test").writeLine("test");
            });
        });
    });
    describe("newLineIfLastCharNotNewLine()", function () {
        it("should do a newline if the last text was not a newline", function () {
            var expected = "test\n";
            doTest(expected, function (writer) {
                writer.write("test").newLineIfLastCharNotNewLine();
            });
        });
        it("should not do a newline if the last text was a newline", function () {
            var expected = "test\n";
            doTest(expected, function (writer) {
                writer.writeLine("test").newLineIfLastCharNotNewLine();
            });
        });
    });
    describe("newLine()", function () {
        it("should do a newline when writing", function () {
            var expected = "test\n";
            doTest(expected, function (writer) {
                writer.write("test").newLine();
            });
        });
        it("should do a newline after doing a newline", function () {
            var expected = "test\n\n";
            doTest(expected, function (writer) {
                writer.write("test").newLine().newLine();
            });
        });
        it("should not do a newline after doing a block", function () {
            var expected = "test {\n    test\n}\n";
            doTest(expected, function (writer) {
                writer.write("test").block(function () {
                    writer.newLine().writeLine("test");
                });
            });
        });
        it("should not do a newline if the last line was a blank line (no consecutive blank lines)", function () {
            var expected = "test\n\n";
            doTest(expected, function (writer) {
                writer.write("test").newLine().newLine().newLine();
            });
        });
        it("should do a newline if a string causes it to not be a consecutive blank line", function () {
            var expected = "test\na\n\n";
            doTest(expected, function (writer) {
                writer.write("test").newLine().write("a").newLine().newLine();
            });
        });
    });
    describe("spaceIfLastNotSpace()", function () {
        it("should do a space if the last character wasn't a space", function () {
            var expected = "test ";
            doTest(expected, function (writer) {
                writer.write("test").spaceIfLastNotSpace();
            });
        });
        it("should not do a space if the last character was a space", function () {
            var expected = "test ";
            doTest(expected, function (writer) {
                writer.write("test").spaceIfLastNotSpace().spaceIfLastNotSpace();
            });
        });
        it("should not do a space if the last character was a newline", function () {
            var expected = "test\n";
            doTest(expected, function (writer) {
                writer.write("test").newLine().spaceIfLastNotSpace();
            });
        });
    });
    describe("getLength()", function () {
        it("should return the length", function () {
            var writer = getWriter();
            writer.write("1234");
            assert.equal(writer.getLength(), 4);
        });
    });
});

//# sourceMappingURL=code-block-writer-tests.js.map
