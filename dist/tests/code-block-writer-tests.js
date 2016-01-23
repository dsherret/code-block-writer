var assert = require("assert");
var code_block_writer_1 = require("./../code-block-writer");
describe("CodeBlockWriter", function () {
    describe("default opts", function () {
        it("should use a \n newline if none is specified", function () {
            var writer = new code_block_writer_1.default();
            writer.writeLine("test");
            assert.equal(writer.toString(), "test\n");
        });
    });
    describe("tests for \n", function () {
        runTestsForNewLineChar({ newLine: "\n" });
    });
    describe("tests for \r\n", function () {
        runTestsForNewLineChar({ newLine: "\r\n" });
    });
});
function runTestsForNewLineChar(opts) {
    function getWriter() {
        return new code_block_writer_1.default(opts);
    }
    function doTest(expected, writerCallback) {
        var writer = getWriter();
        writerCallback(writer);
        assert.equal(writer.toString(), expected.replace(/\r?\n/g, opts.newLine));
    }
    describe("write", function () {
        it("should write the text", function () {
            var expected = "test";
            doTest(expected, function (writer) {
                writer.write("test");
            });
        });
        it("should do nothing if providing a null string", function () {
            var expected = "";
            doTest(expected, function (writer) {
                writer.write(null);
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
        it("should remove a newline if the last thing before the block was a newline", function () {
            var expected = "test {\n    inside\n}\n";
            doTest(expected, function (writer) {
                writer.write("test ").block(function () {
                    writer.writeLine("inside").newLine();
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
            var expected = "test\n\ntext";
            doTest(expected, function (writer) {
                writer.write("test").newLine().newLine().write("text");
            });
        });
        it("should not do a newline at the start", function () {
            var expected = "";
            doTest(expected, function (writer) {
                writer.newLine();
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
            var expected = "test\n\ntext";
            doTest(expected, function (writer) {
                writer.write("test").newLine().newLine().newLine().write("text");
            });
        });
        it("should do a newline if a string causes it to not be a consecutive blank line", function () {
            var expected = "test\na\n";
            doTest(expected, function (writer) {
                writer.write("test").newLine().write("a").newLine();
            });
        });
        it("should never have two newlines at the end of a file", function () {
            var expected = "text\n";
            doTest(expected, function (writer) {
                writer.write("text").newLine().newLine();
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
}

//# sourceMappingURL=code-block-writer-tests.js.map
