import * as assert from "assert";
import CodeBlockWriter from "./../code-block-writer";

describe("CodeBlockWriter", () => {
    describe("default opts", () => {
        it("should use a \n newline if none is specified", () => {
            const writer = new CodeBlockWriter();
            writer.writeLine("test");
            assert.equal(writer.toString(), "test\n");
        });
    });

    describe("tests for \n", () => {
        runTestsForNewLineChar({ newLine: "\n" });
    });

    describe("tests for \r\n", () => {
        runTestsForNewLineChar({ newLine: "\r\n" });
    });
});

function runTestsForNewLineChar(opts: { newLine: string }) {
    function getWriter() {
        return new CodeBlockWriter(opts);
    }

    function doTest(expected: string, writerCallback: (writer: CodeBlockWriter) => void) {
        const writer = getWriter();
        writerCallback(writer);
        assert.equal(writer.toString(), expected.replace(/\r?\n/g, opts.newLine));
    }

    describe("#write()", () => {
        it("should write a single letter", () => {
            const expected = `a`;

            doTest(expected, writer => {
                writer.write("a");
            });
        });

        it("should write the text", () => {
            const expected = `test`;

            doTest(expected, writer => {
                writer.write("test");
            });
        });

        it("should do nothing if providing a null string", () => {
            const expected = "";

            doTest(expected, writer => {
                writer.write(null as any as string);
            });
        });

        it("should indent if it's passed a newline character inside a block", () => {
            const expected =
`test {
    inside
    inside
}`;
            doTest(expected, writer => {
                writer.write("test ").block(() => {
                    writer.write(`inside${opts.newLine}inside`);
                });
            });
        });

        it("should write all requested newlines", () => {
            const expected = "\n\ntest\n\n";

            doTest(expected, writer => {
                writer.write("\n\ntest\n\n");
            });
        });
    });

    describe("#block()", () => {
        it("should write text inside a block", () => {
            const expected =
`test {
    inside
}`;
            doTest(expected, writer => {
                writer.write("test").block(() => {
                    writer.write("inside");
                });
            });
        });

        it("should write text inside a block inside a block", () => {
            const expected =
`test {
    inside {
        inside again
    }
}`;

            doTest(expected, writer => {
                writer.write("test").block(() => {
                    writer.write("inside").block(() => {
                        writer.write("inside again");
                    });
                });
            });
        });

        it("should not do an extra space if there was a space added before the block", () => {
            const expected =
`test {
    inside
}`;
            doTest(expected, writer => {
                writer.write("test ").block(() => {
                    writer.write("inside");
                });
            });
        });

        it("should put the brace on the next space if there is a newline before it", () => {
            const expected =
`test {
    inside

    inside
}`;
            doTest(expected, writer => {
                writer.write("test ").block(() => {
                    writer.writeLine("inside").newLine().write("inside");
                });
            });
        });

        it("should not add an extra newline if the last character written in the block was a newline", () => {
            const expected =
`test {
    inside
}`;
            doTest(expected, writer => {
                writer.write("test ").block(() => {
                    writer.writeLine("inside");
                });
            });
        });

        it("should add a newline after the block when writing afterwards", () => {
            const expected =
` {
    t;
}
 `;
            doTest(expected, writer => {
                writer.block(() => writer.write("t;")).write(" ");
            });
        });

        it("should not add a newline after the block when doing a condition call and the conditions are false", () => {
            const expected =
` {
    t;
}`;
            doTest(expected, writer => {
                writer.block(() => writer.write("t;")).conditionalWrite(false, " ").conditionalWriteLine(false, " ").conditionalNewLine(false);
            });
        });

        it("should not indent when in a string", () => {
            const expected = "block {\n    const t = `\nt`;\n    const u = 1;\n}";

            doTest(expected, writer => {
                writer.write("block").block(() => {
                    writer.write("const t = `\nt`;\nconst u = 1;");
                });
            });
        });

        it("should indent when in a comment", () => {
            const expected = "block {\n    const t = /*\n    const u = 1;*/\n}";

            doTest(expected, writer => {
                writer.write("block").block(() => {
                    writer.write("const t = /*\nconst u = 1;*/");
                });
            });
        });
    });

    describe("#inlineBlock()", () => {
        it("should do an inline block correctly", () => {
            const expected = `someCall({\n    console.log();\n});`;

            doTest(expected, writer => {
                writer.write("someCall(").inlineBlock(() => {
                    writer.write("console.log();");
                }).write(");");
            });
        });
    });

    describe("#writeLine()", () => {
        it("should write some text on a line", () => {
            const expected = `test\n`;

            doTest(expected, writer => {
                writer.writeLine("test");
            });
        });

        it("should start writing on a newline if the last one was just writing", () => {
            const expected = `test\ntest\ntest\n`;

            doTest(expected, writer => {
                writer.writeLine("test").write("test").writeLine("test");
            });
        });

        it("should not create a newline between two writeLines", () => {
            const expected = `test\ntest\n`;

            doTest(expected, writer => {
                writer.writeLine("test").writeLine("test");
            });
        });
    });

    describe("#blankLine()", () => {
        it("should do a blank line if the last text was not a new line", () => {
            const expected = `test\n\ntest`;

            doTest(expected, writer => {
                writer.write("test").blankLine().write("test");
            });
        });

        it("should do a blank line if the last text was a newline", () => {
            const expected = `test\n\ntest`;

            doTest(expected, writer => {
                writer.writeLine("test").blankLine().write("test");
            });
        });

        it("should do a blank line if the last was a blank line", () => {
            const expected = `test\n\n\ntest`;

            doTest(expected, writer => {
                writer.writeLine("test").blankLine().blankLine().write("test");
            });
        });
    });

    describe("#indent()", () => {
        it("should indent as necessary", () => {
            const expected = `test\n    test`;

            doTest(expected, writer => {
                writer.writeLine("test").indent().write("test");
            });
        });
    });

    describe("#newLineIfLastNotNewLine()", () => {
        it("should do a newline if the last text was not a newline", () => {
            const expected = `test\n`;

            doTest(expected, writer => {
                writer.write("test").newLineIfLastNotNewLine();
            });
        });

        it("should not do a newline if the last text was a newline", () => {
            const expected = `test\n`;

            doTest(expected, writer => {
                writer.writeLine("test").newLineIfLastNotNewLine();
            });
        });
    });

    describe("#newLine()", () => {
        it("should do a newline when writing", () => {
            const expected = `test\n`;

            doTest(expected, writer => {
                writer.write("test").newLine();
            });
        });

        it("should do a newline after doing a newline", () => {
            const expected = `test\n\ntext`;

            doTest(expected, writer => {
                writer.write("test").newLine().newLine().write("text");
            });
        });

        it("should allow doing a newline at the start", () => {
            const expected = `\n`;

            doTest(expected, writer => {
                writer.newLine();
            });
        });

        it("should allow doing a newline after doing a block", () => {
            const expected = `test {\n\n    test\n}`;

            doTest(expected, writer => {
                writer.write("test").block(() => {
                    writer.newLine().writeLine("test");
                });
            });
        });

        it("should allow doing a newline if the last line was a blank line (allow consecutive blank lines)", () => {
            const expected = `test\n\n\ntext`;

            doTest(expected, writer => {
                writer.write("test").newLine().newLine().newLine().write("text");
            });
        });

        it("should do a newline if a string causes it to not be a consecutive blank line", () => {
            const expected = `test\na\n`;

            doTest(expected, writer => {
                writer.write("test").newLine().write("a").newLine();
            });
        });

        it("should never have two newlines at the end of a file", () => {
            const expected = `text\n`;

            doTest(expected, writer => {
                writer.write("text").newLine().newLine();
            });
        });

        it("should indent if it's passed a newline character inside a block", () => {
            const expected =
`test {
    inside
    inside
}`;
            doTest(expected, writer => {
                writer.write("test ").block(() => {
                    writer.writeLine(`inside${opts.newLine}inside`);
                });
            });
        });
    });

    describe("#spaceIfLastNotSpace()", () => {
        it("should do a space at the beginning of the file", () => {
            const expected = ` `;

            doTest(expected, writer => {
                writer.spaceIfLastNotSpace();
            });
        });

        it("should do a space if the last character wasn't a space", () => {
            const expected = `test `;

            doTest(expected, writer => {
                writer.write("test").spaceIfLastNotSpace();
            });
        });

        it("should not do a space if the last character was a space", () => {
            const expected = `test `;

            doTest(expected, writer => {
                writer.write("test").spaceIfLastNotSpace().spaceIfLastNotSpace();
            });
        });

        it("should do a space if the last character was a newline", () => {
            const expected = `test\n `;

            doTest(expected, writer => {
                writer.write("test").newLine().spaceIfLastNotSpace();
            });
        });
    });

    describe("#getLength()", () => {
        it("should return the length", () => {
            const writer = getWriter();
            writer.write("1234");
            assert.equal(writer.getLength(), 4);
        });
    });

    describe("#conditionalNewLine()", () => {
        it("should write when the condition is true", () => {
            doTest("t\n", writer => {
                writer.write("t").conditionalNewLine(true);
            });
        });

        it("should not write when the condition is false", () => {
            doTest("t", writer => {
                writer.write("t").conditionalNewLine(false);
            });
        });
    });

    describe("#conditionalWrite()", () => {
        it("should write when the condition is true", () => {
            doTest("test", writer => {
                writer.conditionalWrite(true, "test");
            });
        });

        it("should not write when the condition is false", () => {
            doTest("", writer => {
                writer.conditionalWrite(false, "test");
            });
        });
    });

    describe("#conditionalWriteLine()", () => {
        it("should write when the condition is true", () => {
            doTest("test\n", writer => {
                writer.conditionalWriteLine(true, "test");
            });
        });

        it("should not write when the condition is false", () => {
            doTest("", writer => {
                writer.conditionalWriteLine(false, "test");
            });
        });
    });
}

describe("#isInString", () => {
    function doInStringTest(str: string, expectedValues: boolean[]) {
        assert.equal(str.length + 1, expectedValues.length);
        const writer = new CodeBlockWriter();
        assert.equal(writer.isInString(), expectedValues[0]);
        for (let i = 0; i < str.length; i++) {
            writer.write(str[i]);
            assert.equal(writer.isInString(), expectedValues[i + 1]);
        }
    }

    it("should be in a string while in double quotes", () => {
        doInStringTest(`s"y"`, [false, false, true, true, false]);
    });

    it("should be in a string while in single quotes", () => {
        doInStringTest(`s'y'`, [false, false, true, true, false]);
    });

    it("should be in a string while in backticks", () => {
        doInStringTest("s`y`", [false, false, true, true, false]);
    });

    it("should not be affected by other string quotes while in double quotes", () => {
        doInStringTest(`"'\`\${}"`, [false, true, true, true, true, true, true, false]);
    });

    it("should not be affected by other string quotes while in single quotes", () => {
        doInStringTest(`'"\`\${}'`, [false, true, true, true, true, true, true, false]);
    });

    it("should not be affected by other string quotes while in back ticks", () => {
        doInStringTest(`\`'"\``, [false, true, true, true, false]);
    });

    it("should not be in a string while in backticks within braces", () => {
        doInStringTest("`y${t}`", [false, true, true, true, false, false, true, false]);
    });

    it("should be in a string while in backticks within braces within a single quote string", () => {
        doInStringTest("`${'t'}`", [false, true, true, false, true, true, false, true, false]);
    });

    it("should be in a string while in backticks within braces within a double quote string", () => {
        doInStringTest("`${\"t\"}`", [false, true, true, false, true, true, false, true, false]);
    });

    it("should be in a string while in backticks within braces within back ticks", () => {
        doInStringTest("`${`t`}`", [false, true, true, false, true, true, false, true, false]);
    });

    it("should not be in a string while in backticks within braces within back ticks within braces", () => {
        doInStringTest("`${`${t}`}`", [false, true, true, false, true, true, false, false, true, false, true, false]);
    });

    it("should not be in a string while comments", () => {
        doInStringTest("//'t'", [false, false, false, false, false, false]);
    });

    it("should be in a string while the previous line was a comment and now this is a string", () => {
        doInStringTest("//t\n't'", [false, false, false, false, false, true, true, false]);
    });

    it("should not be in a string for star comments", () => {
        doInStringTest("/*\n't'\n*/'t'", [false, false, false, false, false, false, false, false, false, false, true, true, false]);
    });
});

describe("#isInComment", () => {
    function doInCommentTest(str: string, expectedValues: boolean[]) {
        assert.equal(str.length + 1, expectedValues.length);
        const writer = new CodeBlockWriter();
        assert.equal(writer.isInComment(), expectedValues[0]);
        for (let i = 0; i < str.length; i++) {
            writer.write(str[i]);
            assert.equal(writer.isInComment(), expectedValues[i + 1]);
        }
    }

    it("should be in a comment for star comments", () => {
        doInCommentTest("/*\nt\n*/", [false, false, true, true, true, true, true, false]);
    });

    it("should be in a comment for line comments", () => {
        doInCommentTest("// t\nt", [false, false, true, true, true, false, false]);
    });
});

describe("indentNumberOfSpaces", () => {
    const writer = new CodeBlockWriter({ indentNumberOfSpaces: 2 });
    writer.write("do").block(() => {
        writer.write("something");
    });

    const expected =
`do {
  something
}`;

    it("should indent 2 spaces", () => {
        assert.equal(writer.toString(), expected);
    });
});

describe("useTabs", () => {
    const writer = new CodeBlockWriter({ useTabs: true });
    writer.write("do").block(() => {
        writer.write("do").block(() => {
            writer.write("something");
        });
    });

    const expected =
`do {
\tdo {
\t\tsomething
\t}
}`;

    it("should use tabs", () => {
        assert.equal(writer.toString(), expected);
    });
});
