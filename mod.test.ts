import { describe, expect, it } from "./_test.deps.ts";
import CodeBlockWriter from "./mod.ts";

describe("CodeBlockWriter", () => {
  describe("default opts", () => {
    it("should use a \n newline if none is specified", () => {
      const writer = new CodeBlockWriter();
      writer.writeLine("test");
      expect(writer.toString()).to.equal("test\n");
    });
  });

  describe("tests for \\n", () => {
    runTestsForNewLineChar({ newLine: "\n" });
  });

  describe("tests for \\r\\n", () => {
    runTestsForNewLineChar({ newLine: "\r\n" });
  });
});

function runTestsForNewLineChar(opts: { newLine: "\r\n" | "\n" }) {
  function getWriter(additionalOpts: { useSingleQuote?: boolean } = {}) {
    return new CodeBlockWriter({
      newLine: opts.newLine,
      useSingleQuote: additionalOpts.useSingleQuote,
    });
  }

  function doTest(
    expected: string,
    writerCallback: (writer: CodeBlockWriter) => void,
    additionalOpts: { useSingleQuote?: boolean } = {},
  ) {
    const writer = getWriter(additionalOpts);
    writerCallback(writer);
    expect(writer.toString()).to.equal(expected.replace(/\r?\n/g, opts.newLine));
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
        writer.write(null as unknown as string);
      });
    });

    it("should indent if it's passed a newline character inside a block", () => {
      const expected = `test {
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

    it("should not write indentation between newlines", () => {
      const expected = "    test\n\n    test";

      doTest(expected, writer => {
        writer.setIndentationLevel(1);
        writer.write("test\n\ntest");
      });
    });

    it("should indent if passed an empty string at the start of a newline within a block", () => {
      const expected = `test {\n    inside\n    \n}`;
      doTest(expected, writer => {
        writer.write("test ").block(() => {
          writer.writeLine(`inside`);
          writer.write("");
        });
      });
    });
  });

  describe("#block()", () => {
    it("should allow an empty block", () => {
      const expected = `test {
}`;
      doTest(expected, writer => {
        writer.write("test").block();
      });
    });

    it("should write text inside a block", () => {
      const expected = `test {
    inside
}`;
      doTest(expected, writer => {
        writer.write("test").block(() => {
          writer.write("inside");
        });
      });
    });

    it("should write text inside a block inside a block", () => {
      const expected = `test {
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
      const expected = `test {
    inside
}`;
      doTest(expected, writer => {
        writer.write("test ").block(() => {
          writer.write("inside");
        });
      });
    });

    it("should put the brace on the next line if there is a newline before it", () => {
      const expected = `test
{
    inside
}`;
      doTest(expected, writer => {
        writer.writeLine("test").block(() => {
          writer.writeLine("inside");
        });
      });
    });

    it("should not add an extra newline if the last character written in the block was a newline", () => {
      const expected = `test {
    inside
}`;
      doTest(expected, writer => {
        writer.write("test ").block(() => {
          writer.writeLine("inside");
        });
      });
    });

    it("should add a newline after the block when writing afterwards", () => {
      const expected = `{
    t;
}
 `;
      doTest(expected, writer => {
        writer.block(() => writer.write("t;")).write(" ");
      });
    });

    it("should not add a newline after the block when doing a condition call and the conditions are false", () => {
      const expected = `{
    t;
}`;
      doTest(expected, writer => {
        writer.block(() => writer.write("t;"))
          .conditionalWrite(false, " ")
          .conditionalWriteLine(false, " ")
          .conditionalNewLine(false)
          .conditionalBlankLine(false);
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
    it("should allow an empty inline block", () => {
      const expected = `someCall({\n});`;

      doTest(expected, writer => {
        writer.write("someCall(").inlineBlock().write(");");
      });
    });

    it("should do an inline block correctly", () => {
      const expected = `someCall({\n    console.log();\n});`;

      doTest(expected, writer => {
        writer.write("someCall(").inlineBlock(() => {
          writer.write("console.log();");
        }).write(");");
      });
    });
  });

  describe("#indent()", () => {
    describe("number argument", () => {
      it("should indent as necessary", () => {
        const expected = `test\n    test`;

        doTest(expected, writer => {
          writer.writeLine("test").indent().write("test");
        });
      });

      it("should indent multiple times when specifying an argument", () => {
        const expected = `test\n        test`;

        doTest(expected, writer => {
          writer.writeLine("test").indent(2).write("test");
        });
      });
    });

    describe("block argument", () => {
      it("should indent text inside a block", () => {
        const expected = `test\n    inside`;
        doTest(expected, writer => {
          writer.write("test").indent(() => {
            writer.write("inside");
          });
        });
      });

      it("should not do a newline on the first line", () => {
        const expected = `    inside`;
        doTest(expected, writer => {
          writer.indent(() => {
            writer.write("inside");
          });
        });
      });

      it("should not do a newline at the start if the last was a new line", () => {
        const expected = `test\n    inside`;
        doTest(expected, writer => {
          writer.writeLine("test").indent(() => {
            writer.write("inside");
          });
        });
      });

      it("should not do a newline at the end if the last was a new line", () => {
        const expected = `    inside\ntest`;
        doTest(expected, writer => {
          writer.indent(() => {
            writer.writeLine("inside");
          }).write("test");
        });
      });

      it("should indent text inside a block inside a block", () => {
        const expected = `test
    inside
        inside again
test`;

        doTest(expected, writer => {
          writer.write("test").indent(() => {
            writer.write("inside").indent(() => {
              writer.write("inside again");
            });
          });
          writer.write("test");
        });
      });

      it("should not indent when in a string", () => {
        const expected = "block\n    const t = `\nt`;\n    const u = 1;";

        doTest(expected, writer => {
          writer.write("block").indent(() => {
            writer.write("const t = `\nt`;\nconst u = 1;");
          });
        });
      });

      it("should indent when in a comment", () => {
        const expected = "block\n    const t = /*\n    const u = 1;*/";

        doTest(expected, writer => {
          writer.write("block").indent(() => {
            writer.write("const t = /*\nconst u = 1;*/");
          });
        });
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

    it("should indent if passed an empty string at the start of a newline within a block", () => {
      const expected = `test {\n    inside\n    \n}`;
      doTest(expected, writer => {
        writer.write("test ").block(() => {
          writer.writeLine(`inside`);
          writer.writeLine("");
        });
      });
    });
  });

  describe("#blankLineIfLastNot()", () => {
    it("should do a blank line if the last text was not a newline", () => {
      const expected = `test\n\n`;

      doTest(expected, writer => {
        writer.write("test").blankLineIfLastNot();
      });
    });

    it("should do a blank line if the last text was a newline", () => {
      const expected = `test\n\n`;

      doTest(expected, writer => {
        writer.writeLine("test").blankLineIfLastNot();
      });
    });

    it("should not do a blank line if the last text was a blank line", () => {
      const expected = `test\n\n`;

      doTest(expected, writer => {
        writer.write("test").blankLine().blankLineIfLastNot();
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

  describe("#conditionalBlankLine()", () => {
    it("should write when the condition is true", () => {
      doTest("t\n\n", writer => {
        writer.write("t").conditionalBlankLine(true);
      });
    });

    it("should not write when the condition is false", () => {
      doTest("t", writer => {
        writer.write("t").conditionalBlankLine(false);
      });
    });

    it("should not write when the condition is undefined", () => {
      doTest("t", writer => {
        writer.write("t").conditionalBlankLine(undefined);
      });
    });
  });

  describe("#newLineIfLastNot()", () => {
    it("should do a newline if the last text was not a newline", () => {
      const expected = `test\n`;

      doTest(expected, writer => {
        writer.write("test").newLineIfLastNot();
      });
    });

    it("should not do a newline if the last text was a newline", () => {
      const expected = `test\n`;

      doTest(expected, writer => {
        writer.writeLine("test").newLineIfLastNot();
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

    it("should be allowed to have two newlines at the end of a file", () => {
      const expected = `text\n\n`;

      doTest(expected, writer => {
        writer.write("text").newLine().newLine();
      });
    });

    it("should indent if it's passed a newline character inside a block", () => {
      const expected = `test {
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

  describe("#quote()", () => {
    it("should write out a double quote character", () => {
      const expected = `"`;
      doTest(expected, writer => {
        writer.quote();
      });
    });

    it("should write out a single quote character", () => {
      const expected = `'`;
      doTest(expected, writer => {
        writer.quote();
      }, { useSingleQuote: true });
    });

    it("should write out text surrounded by quotes", () => {
      const expected = `"test"`;
      doTest(expected, writer => {
        writer.quote("test");
      });
    });

    it("should write out text surrounded by quotes and escape quotes and new lines", () => {
      const expected = `"te\\"\\r\\n\\\r\nst"`;
      doTest(expected, writer => {
        writer.quote("te\"\r\nst");
      });
    });
  });

  describe("#spaceIfLastNot()", () => {
    it("should do a space at the beginning of the file", () => {
      const expected = ` `;

      doTest(expected, writer => {
        writer.spaceIfLastNot();
      });
    });

    it("should do a space if the last character wasn't a space", () => {
      const expected = `test `;

      doTest(expected, writer => {
        writer.write("test").spaceIfLastNot();
      });
    });

    it("should not do a space if the last character was a space", () => {
      const expected = `test `;

      doTest(expected, writer => {
        writer.write("test").spaceIfLastNot().spaceIfLastNot();
      });
    });

    it("should do a space if the last character was a newline", () => {
      const expected = `test\n `;

      doTest(expected, writer => {
        writer.write("test").newLine().spaceIfLastNot();
      });
    });
  });

  describe("#space()", () => {
    it("should do a space when saying to", () => {
      const expected = `   `;
      doTest(expected, writer => {
        writer.space().space().space();
      });
    });

    it("should do a space when saying to do multiple", () => {
      const expected = `     `;
      doTest(expected, writer => {
        writer.space(5);
      });
    });

    it("should throw if providing a negative number", () => {
      const writer = new CodeBlockWriter();
      expect(() => writer.space(-1)).to.throw();
    });
  });

  describe("#tabIfLastNot()", () => {
    it("should do a tab at the beginning of the file", () => {
      const expected = `\t`;

      doTest(expected, writer => {
        writer.tabIfLastNot();
      });
    });

    it("should do a tab if the last character wasn't a tab", () => {
      const expected = `test\t`;

      doTest(expected, writer => {
        writer.write("test").tabIfLastNot();
      });
    });

    it("should not do a tab if the last character was a tab", () => {
      const expected = `test\t`;

      doTest(expected, writer => {
        writer.write("test").tabIfLastNot().tabIfLastNot();
      });
    });

    it("should do a tab if the last character was a newline", () => {
      const expected = `test\n\t`;

      doTest(expected, writer => {
        writer.write("test").newLine().tabIfLastNot();
      });
    });
  });

  describe("#tab()", () => {
    it("should do a tab when saying to", () => {
      const expected = `\t\t\t`;
      doTest(expected, writer => {
        writer.tab().tab().tab();
      });
    });

    it("should do a tab when saying to do multiple", () => {
      const expected = `\t\t\t\t\t`;
      doTest(expected, writer => {
        writer.tab(5);
      });
    });

    it("should throw if providing a negative number", () => {
      const writer = new CodeBlockWriter();
      expect(() => writer.tab(-1)).to.throw();
    });
  });

  describe("#getLength()", () => {
    it("should return the length", () => {
      const writer = getWriter();
      writer.write("1234");
      expect(writer.getLength()).to.equal(4);
    });

    it("should get the correct length after various kinds of writes", () => {
      const writer = getWriter();
      writer.write("1").writeLine("2").write("3").block(() => writer.write("4")).tab(5).quote("testing").blankLine();
      expect(writer.getLength()).to.equal(writer.toString().length);
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

    it("should not write when the condition is undefined", () => {
      doTest("t", writer => {
        writer.write("t").conditionalNewLine(undefined);
      });
    });
  });

  describe("#conditionalWrite()", () => {
    it("should write the given string when the condition is true", () => {
      doTest("test", writer => {
        writer.conditionalWrite(true, "test");
      });
    });

    it("should not write the given string when the condition is false", () => {
      doTest("", writer => {
        writer.conditionalWrite(false, "test");
      });
    });

    it("should not write the given string when the condition is undefined", () => {
      doTest("", writer => {
        writer.conditionalWrite(undefined, "test");
      });
    });

    it("should write the result of the given function when the condition is true", () => {
      doTest("test", writer => {
        writer.conditionalWrite(true, () => "test");
      });
    });

    it("should not write the result of the given function when the condition is false", () => {
      doTest("", writer => {
        writer.conditionalWrite(false, () => "test");
      });
    });

    it("should not evaluate the given function when the condition is false", () => {
      // deno-lint-ignore no-explicit-any
      const test: any = null;
      doTest("", writer => {
        writer.conditionalWrite(false, () => test.test);
      });
    });
  });

  describe("#conditionalWriteLine()", () => {
    it("should write the given string when the condition is true", () => {
      doTest("test\n", writer => {
        writer.conditionalWriteLine(true, "test");
      });
    });

    it("should not write the given string when the condition is false", () => {
      doTest("", writer => {
        writer.conditionalWriteLine(false, "test");
      });
    });

    it("should not write the given string when the condition is undefined", () => {
      doTest("", writer => {
        writer.conditionalWriteLine(undefined, "test");
      });
    });

    it("should write the result of the given function when the condition is true", () => {
      doTest("test\n", writer => {
        writer.conditionalWriteLine(true, () => "test");
      });
    });

    it("should not write the result of the given function when the condition is false", () => {
      doTest("", writer => {
        writer.conditionalWriteLine(false, () => "test");
      });
    });

    it("should not evaluate the given function when the condition is false", () => {
      // deno-lint-ignore no-explicit-any
      const test: any = null;
      doTest("", writer => {
        writer.conditionalWriteLine(false, () => test.test);
      });
    });
  });

  describe("#closeComment()", () => {
    it("should not do anything if not in a comment", () => {
      doTest("test", writer => {
        writer.write("test").closeComment();
      });
    });

    it("should do a newline if in a slash slash comment", () => {
      doTest("// test\n", writer => {
        writer.write("// test").closeComment();
      });
    });

    it("should add a space at the end if on same line in a star slash comment", () => {
      doTest("/* test */", writer => {
        writer.write("/* test").closeComment();
      });
    });

    it("should not add a space at the end if on same line and a space exists in a star slash comment", () => {
      doTest("/* test */", writer => {
        writer.write("/* test ").closeComment();
      });
    });

    it("should not add a space at the start of the line in a star slash comment", () => {
      doTest("/* test\n*/", writer => {
        writer.writeLine("/* test").closeComment();
      });
    });
  });

  describe("#unsafeInsert()", () => {
    it("should throw if providing a negative number", () => {
      const writer = new CodeBlockWriter();
      expect(() => writer.unsafeInsert(-1, "t"))
        .to.throw("Provided position of '-1' was less than zero.");
    });

    it("should throw if providing a number greater than the length", () => {
      const writer = new CodeBlockWriter();
      expect(() => writer.unsafeInsert(1, "t"))
        .to.throw("Provided position of '1' was greater than the text length of '0'.");
    });

    it("should support inserting at the beginning", () => {
      doTest("01234", writer => {
        writer.write("1234").unsafeInsert(0, "0");
        expect(writer.getLength()).to.equal(5);
      });
    });

    it("should support inserting at the end", () => {
      doTest("01234", writer => {
        writer.write("0123").unsafeInsert(4, "4");
        expect(writer.getLength()).to.equal(5);
      });
    });

    it("should support inserting in the first half at the beginning of an existing string", () => {
      doTest("0x123456", writer => {
        writer.write("0").write("12").write("3").write("45").write("6");
        writer.unsafeInsert(1, "x");
        expect(writer.getLength()).to.equal(8);
      });
    });

    it("should support inserting in the first half in the middle of an existing string", () => {
      doTest("01x23456", writer => {
        writer.write("0").write("12").write("3").write("45").write("6");
        writer.unsafeInsert(2, "x");
        expect(writer.getLength()).to.equal(8);
      });
    });

    it("should support inserting in the first half at the end of an existing string", () => {
      doTest("012x3456", writer => {
        writer.write("0").write("12").write("3").write("45").write("6");
        writer.unsafeInsert(3, "x");
        expect(writer.getLength()).to.equal(8);
      });
    });

    it("should support inserting in the second half at the beginning of an existing string", () => {
      doTest("0123x456", writer => {
        writer.write("0").write("12").write("3").write("45").write("6");
        writer.unsafeInsert(4, "x");
        expect(writer.getLength()).to.equal(8);
      });
    });

    it("should support inserting in the second half in the middle of an existing string", () => {
      doTest("01234x56", writer => {
        writer.write("0").write("12").write("3").write("45").write("6");
        writer.unsafeInsert(5, "x");
        expect(writer.getLength()).to.equal(8);
      });
    });

    it("should support inserting in the second half at the end of an existing string", () => {
      doTest("012345x6", writer => {
        writer.write("0").write("12").write("3").write("45").write("6");
        writer.unsafeInsert(6, "x");
        expect(writer.getLength()).to.equal(8);
      });
    });
  });
}

describe("#setIndentationLevel", () => {
  it("should throw when providing a negative number", () => {
    const writer = new CodeBlockWriter();
    expect(() => writer.setIndentationLevel(-1)).to.throw();
  });

  it("should throw when not providing a number or string", () => {
    const writer = new CodeBlockWriter();
    // deno-lint-ignore no-explicit-any
    expect(() => writer.setIndentationLevel({} as any)).to.throw();
  });

  it("should not throw when providing an empty string", () => {
    const writer = new CodeBlockWriter();
    expect(() => writer.setIndentationLevel("")).to.not.throw();
  });

  it("should throw when providing a string that doesn't contain only spaces and tabs", () => {
    const writer = new CodeBlockWriter();
    expect(() => writer.setIndentationLevel("  \ta")).to.throw();
  });

  it("should be able to set the indentation level and it maintains it over newlines", () => {
    const writer = new CodeBlockWriter();
    writer.setIndentationLevel(2);
    writer.writeLine("t");
    writer.writeLine("t");

    expect(writer.toString()).to.equal("        t\n        t\n");
    expect(writer.getIndentationLevel()).to.equal(2);
  });

  it("should be able to set the indentation level to 0 within a block", () => {
    const writer = new CodeBlockWriter();
    writer.write("t").block(() => {
      writer.setIndentationLevel(0);
      writer.writeLine("t");
      writer.writeLine("t");
    }).write("t").block(() => {
      writer.write("t");
    });

    expect(writer.toString()).to.equal("t {\nt\nt\n}\nt {\n    t\n}");
  });

  function doSpacesTest(numberSpaces: number) {
    const writer = new CodeBlockWriter({ indentNumberOfSpaces: numberSpaces });
    const indent = Array(numberSpaces + 1).join(" ");
    writer.setIndentationLevel(indent + indent);
    writer.write("t").block(() => writer.write("t"));

    expect(writer.toString()).to.equal(`${indent + indent}t {\n${indent + indent + indent}t\n${indent + indent}}`);
    expect(writer.getIndentationLevel()).to.equal(2);
  }

  it("should be able to set the indentation level using a string with two spaces", () => {
    doSpacesTest(2);
  });

  it("should be able to set the indentation level using a string with four spaces", () => {
    doSpacesTest(4);
  });

  it("should be able to set the indentation level using a string with eight spaces", () => {
    doSpacesTest(8);
  });

  it("should indent by the provided number of tabs", () => {
    const writer = new CodeBlockWriter({ useTabs: true });
    writer.setIndentationLevel("\t\t");
    writer.write("s");

    expect(writer.toString()).to.equal(`\t\ts`);
  });

  it("should indent to the nearest indent when mixing tabs and spaces (round down)", () => {
    const writer = new CodeBlockWriter({ useTabs: true });
    writer.setIndentationLevel("\t \t ");
    writer.write("s");

    expect(writer.toString()).to.equal(`\t\ts`);
  });

  it("should indent to the nearest indent when mixing tabs and spaces (round down, 2 spaces)", () => {
    const writer = new CodeBlockWriter({ useTabs: true, indentNumberOfSpaces: 2 });
    writer.setIndentationLevel("\t \t");
    writer.write("s");

    expect(writer.toString()).to.equal(`\t\ts`);
  });

  it("should indent to the nearest indent when mixing tabs and spaces (round up)", () => {
    const writer = new CodeBlockWriter({ useTabs: true });
    writer.setIndentationLevel("\t \t  ");
    writer.write("s");

    expect(writer.toString()).to.equal(`\t\t\ts`);
  });

  it("should indent to the nearest indent when mixing tabs and spaces (2 spaces)", () => {
    const writer = new CodeBlockWriter({ useTabs: true, indentNumberOfSpaces: 2 });
    writer.setIndentationLevel("\t \t     ");
    writer.write("s");

    expect(writer.toString()).to.equal(`\t\t\t\t\ts`);
  });

  function doPortionTest(level: number, expected: string) {
    const writer = new CodeBlockWriter({ useTabs: false, indentNumberOfSpaces: 4 });
    writer.setIndentationLevel(level);
    writer.write("s");
    expect(writer.toString()).to.equal(expected + `s`);
  }

  it("should indent a quarter of an indent when using spaces and specifying a quarter", () => {
    doPortionTest(0.25, " ");
  });

  it("should indent half an indent when using spaces and specifying halfway", () => {
    doPortionTest(0.5, "  ");
  });

  it("should indent a third of an indent when using spaces and specifying a third", () => {
    doPortionTest(0.75, "   ");
  });

  it("should round the indent when specifying a position between two indexes", () => {
    doPortionTest(0.125, " ");
  });
});

describe("#withIndentationLevel", () => {
  it("should use the provided indentation level within the block", () => {
    const writer = new CodeBlockWriter();
    writer.withIndentationLevel(2, () => {
      expect(writer.getIndentationLevel()).to.equal(2);
    });
    expect(writer.getIndentationLevel()).to.equal(0);
  });

  it("should use the provided indentation level within the block when providing a string", () => {
    const writer = new CodeBlockWriter();
    writer.withIndentationLevel("    ", () => {
      expect(writer.getIndentationLevel()).to.equal(1);
    });
    expect(writer.getIndentationLevel()).to.equal(0);
  });
});

describe("#queueIndentationLevel", () => {
  it("should throw when providing a negative number", () => {
    const writer = new CodeBlockWriter();
    expect(() => writer.queueIndentationLevel(-1)).to.throw();
  });

  it("should throw when not providing a number or string", () => {
    const writer = new CodeBlockWriter();
    // deno-lint-ignore no-explicit-any
    expect(() => writer.queueIndentationLevel({} as any)).to.throw();
  });

  it("should not throw when providing an empty string", () => {
    const writer = new CodeBlockWriter();
    expect(() => writer.queueIndentationLevel("")).to.not.throw();
  });

  it("should throw when providing a string that doesn't contain only spaces and tabs", () => {
    const writer = new CodeBlockWriter();
    expect(() => writer.queueIndentationLevel("  \ta")).to.throw();
  });

  it("should write with indentation when queuing and immediately doing a newline", () => {
    const writer = new CodeBlockWriter();
    writer.queueIndentationLevel(1);
    writer.newLine().write("t");

    expect(writer.toString()).to.equal("\n    t");
  });

  it("should be able to queue the indentation level", () => {
    const writer = new CodeBlockWriter();
    writer.queueIndentationLevel(1);
    writer.writeLine("t");
    writer.writeLine("t");

    expect(writer.toString()).to.equal("t\n    t\n");
  });

  it("should be able to queue the indentation mid line and it will write the next line with indentation", () => {
    const writer = new CodeBlockWriter();
    writer.write("t");
    writer.queueIndentationLevel(1);
    writer.write("t");
    writer.writeLine("t");

    expect(writer.toString()).to.equal("tt\n    t\n");
  });

  it("should be able to set and queue an indentation", () => {
    const writer = new CodeBlockWriter();
    writer.setIndentationLevel(1);
    writer.queueIndentationLevel(2);
    writer.writeLine("t");
    writer.writeLine("t");

    expect(writer.toString()).to.equal("    t\n        t\n");
  });

  it("should be able to set after queueng an indentation", () => {
    const writer = new CodeBlockWriter();
    writer.queueIndentationLevel(1);
    writer.writeLine("t");
    writer.writeLine("t");
    writer.setIndentationLevel(2);
    writer.writeLine("t");
    writer.writeLine("t");

    expect(writer.toString()).to.equal("t\n    t\n        t\n        t\n");
  });
});

describe("#hangingIndent", () => {
  it("should queue an indent +1 when using newLine() and writing text", () => {
    function doTest(action: (writer: CodeBlockWriter) => void) {
      const writer = new CodeBlockWriter();
      writer.setIndentationLevel(2);
      writer.hangingIndent(() => {
        expect(writer.getIndentationLevel()).to.equal(2);
        action(writer);
        expect(writer.getIndentationLevel()).to.equal(3);
      });
      expect(writer.getIndentationLevel()).to.equal(2);
    }

    doTest(writer => writer.newLine());
    doTest(writer => writer.write("testing\nthis"));
  });

  it("should handle nested indentations", () => {
    const writer = new CodeBlockWriter();
    writer.write("(");
    writer.hangingIndent(() => {
      writer.write("p");
      writer.hangingIndent(() => {
        writer.write(": string\n| number");
      });
    });
    writer.write(")");
    expect(writer.toString()).to.equal("(p: string\n    | number)");
  });

  it("should handle if a block occurs within a hanging indent", () => {
    const writer = new CodeBlockWriter();
    writer.hangingIndent(() => {
      writer.block();
    });
    expect(writer.toString()).to.equal("{\n    }");
  });

  it("should not indent if within a string", () => {
    const writer = new CodeBlockWriter();
    writer.hangingIndent(() => {
      writer.quote("t\nu").newLine().write("t");
    });
    expect(writer.toString()).to.equal(`"t\\n\\\nu"\n    t`);
  });
});

describe("#hangingIndentUnlessBlock", () => {
  it("should write with hanging indentation when not a brace", () => {
    const writer = new CodeBlockWriter();
    writer.setIndentationLevel(2);
    writer.hangingIndentUnlessBlock(() => {
      expect(writer.getIndentationLevel()).to.equal(2);
      writer.write("t").newLine();
      expect(writer.getIndentationLevel()).to.equal(3);
    });
    expect(writer.getIndentationLevel()).to.equal(2);
  });

  it("should not write with hanging indentation when it's a block and using \n newlines", () => {
    const writer = new CodeBlockWriter();
    writer.hangingIndentUnlessBlock(() => {
      writer.write("t").block(() => {
        writer.write("f");
      });
    });
    expect(writer.toString()).to.equal(`t {\n    f\n}`);
  });

  it("should not write with hanging indentation when it's a block and using \r\n newlines", () => {
    const writer = new CodeBlockWriter({ newLine: "\r\n" });
    writer.hangingIndentUnlessBlock(() => {
      writer.write("t").block(() => {
        writer.write("f");
      });
    });
    expect(writer.toString()).to.equal(`t {\r\n    f\r\n}`);
  });

  it("should write blocks at the same hanging indentation once past the first line with hanging indenation", () => {
    const writer = new CodeBlockWriter();
    writer.hangingIndentUnlessBlock(() => {
      writer.writeLine("t");
      writer.write("u").block(() => {
        writer.write("f");
      });
      writer.write("v");
    });
    expect(writer.toString()).to.equal(`t\n    u {\n        f\n    }\n    v`);
  });

  it("should ignore blocks written in a string", () => {
    // this would be strange to happen... but this behaviour seems ok
    const writer = new CodeBlockWriter();
    writer.hangingIndentUnlessBlock(() => {
      writer.writeLine("`t{");
      writer.write("v`");
      writer.block(() => writer.write("u"));
    });
    expect(writer.toString()).to.equal("`t{\nv` {\n    u\n}");
  });
});

describe("#endsWith", () => {
  function doTest(str: string, text: string, expectedValue: boolean) {
    const writer = new CodeBlockWriter();
    writer.write(str);
    expect(writer.endsWith(text)).to.equal(expectedValue);
  }

  it("should be true when equal", () => {
    doTest("test", "test", true);
  });

  it("should be true when it ends with", () => {
    doTest("test", "st", true);
  });

  it("should be false when the provided text is greater than the length", () => {
    doTest("test", "test1", false);
  });

  it("should be false when the provided text does not end with", () => {
    doTest("test", "rt", false);
  });
});

describe("#iterateLastChars", () => {
  it("should iterate over the past characters until the end", () => {
    const writer = new CodeBlockWriter();
    writer.write("test\n");
    const expected: [string, number][] = [
      ["\n", 4],
      ["t", 3],
      ["s", 2],
      ["e", 1],
      ["t", 0],
    ];
    const result: typeof expected = [];
    const returnValue = writer.iterateLastChars((char, index) => {
      result.push([char, index]);
    });
    expect(result).to.deep.equal(expected);
    expect(returnValue).to.equal(undefined);
  });

  it("should stop and return the value when returning a non-null value", () => {
    const writer = new CodeBlockWriter();
    writer.write("test");
    const returnValue = writer.iterateLastChars(char => {
      if (char !== "t") {
        throw new Error("It didn't stop for some reason.");
      }
      return false;
    });
    expect(returnValue).to.equal(false);
  });
});

describe("#getIndentationLevel", () => {
  it("should get the indentation level", () => {
    const writer = new CodeBlockWriter();
    writer.setIndentationLevel(5);
    expect(writer.getIndentationLevel()).to.equal(5);
  });
});

describe("#isInString", () => {
  function doTest(str: string, expectedValues: boolean[]) {
    expect(str.length + 1).to.equal(expectedValues.length);
    const writer = new CodeBlockWriter();
    expect(writer.isInString()).to.equal(expectedValues[0]);
    for (let i = 0; i < str.length; i++) {
      writer.write(str[i]);
      expect(writer.isInString()).to.equal(expectedValues[i + 1], `at expected position ${i + 1}`);
    }
  }

  it("should be in a string while in double quotes", () => {
    doTest(`s"y"`, [false, false, true, true, false]);
  });

  it("should be in a string while in single quotes", () => {
    doTest(`s'y'`, [false, false, true, true, false]);
  });

  it("should be in a string while in backticks", () => {
    doTest("s`y`", [false, false, true, true, false]);
  });

  it("should not be in a string after a new line and not closing the double quote", () => {
    doTest(`s"y\nt`, [false, false, true, true, false, false]);
  });

  it("should be in a string after a new line and not closing the double quote, but escaping the new line", () => {
    doTest(`s"y\\\nt`, [false, false, true, true, true, true, true]);
  });

  it("should not be in a string after a new line and not closing the single quote", () => {
    doTest(`s'y\nt`, [false, false, true, true, false, false]);
  });

  it("should be in a string after a new line and not closing the single quote, but escaping the new line", () => {
    doTest(`s'y\\\nt`, [false, false, true, true, true, true, true]);
  });

  it("should be in a string after a new line and not closing the back tick", () => {
    doTest("s\`y\nt", [false, false, true, true, true, true]);
  });

  it("should not be affected by other string quotes while in double quotes", () => {
    doTest(`"'\`\${}"`, [false, true, true, true, true, true, true, false]);
  });

  it("should not be affected by other string quotes while in single quotes", () => {
    doTest(`'"\`\${}'`, [false, true, true, true, true, true, true, false]);
  });

  it("should not be affected by other string quotes while in back ticks", () => {
    doTest(`\`'"\``, [false, true, true, true, false]);
  });

  it("should not be in a string while in backticks within braces", () => {
    doTest("`y${t}`", [false, true, true, true, false, false, true, false]);
  });

  it("should be in a string while in backticks within braces within a single quote string", () => {
    doTest("`${'t'}`", [false, true, true, false, true, true, false, true, false]);
  });

  it("should be in a string while in backticks within braces within a double quote string", () => {
    doTest("`${\"t\"}`", [false, true, true, false, true, true, false, true, false]);
  });

  it("should be in a string while in backticks within braces within back ticks", () => {
    doTest("`${`t`}`", [false, true, true, false, true, true, false, true, false]);
  });

  it("should not be in a string while in backticks within braces within back ticks within braces", () => {
    doTest("`${`${t}`}`", [false, true, true, false, true, true, false, false, true, false, true, false]);
  });

  it("should not be in a string while comments", () => {
    doTest("//'t'", [false, false, false, false, false, false]);
  });

  it("should be in a string while the previous line was a comment and now this is a string", () => {
    doTest("//t\n't'", [false, false, false, false, false, true, true, false]);
  });

  it("should not be in a string for star comments", () => {
    doTest("/*\n't'\n*/'t'", [false, false, false, false, false, false, false, false, false, false, true, true, false]);
  });

  it("should not be in a string for regex using a single quote", () => {
    doTest("/'test/", [false, false, false, false, false, false, false, false]);
  });

  it("should not be in a string for regex using a double quote", () => {
    doTest("/\"test/", [false, false, false, false, false, false, false, false]);
  });

  it("should not be in a string for regex using a back tick", () => {
    doTest("/`test/", [false, false, false, false, false, false, false, false]);
  });

  it("should be in a string for a string after a regex", () => {
    doTest("/`/'t'", [false, false, false, false, true, true, false]);
  });

  it("should handle escaped single quotes", () => {
    doTest(`'\\''`, [false, true, true, true, false]);
  });

  it("should handle escaped double quotes", () => {
    doTest(`"\\""`, [false, true, true, true, false]);
  });

  it("should handle escaped back ticks", () => {
    doTest("`\\``", [false, true, true, true, false]);
  });

  it("should handle escaped template spans", () => {
    doTest("`\\${t}`", [false, true, true, true, true, true, true, false]);
  });
});

function runSequentialCheck<T>(
  str: string,
  expectedValues: T[],
  func: (writer: CodeBlockWriter) => T,
  writer = new CodeBlockWriter(),
) {
  expect(str.length + 1).to.equal(expectedValues.length);
  expect(func(writer)).to.equal(expectedValues[0]);
  for (let i = 0; i < str.length; i++) {
    writer.write(str[i]);
    expect(func(writer)).to.equal(expectedValues[i + 1], `For char: ${JSON.stringify(str[i])} (${i})`);
  }
}

describe("#isInComment", () => {
  function doTest(str: string, expectedValues: boolean[]) {
    runSequentialCheck(str, expectedValues, writer => writer.isInComment());
  }

  it("should be in a comment for star comments", () => {
    doTest("/*\nt\n*/", [false, false, true, true, true, true, true, false]);
  });

  it("should be in a comment for line comments", () => {
    doTest("// t\nt", [false, false, true, true, true, false, false]);
  });
});

describe("#isLastSpace", () => {
  function doTest(str: string, expectedValues: boolean[]) {
    runSequentialCheck(str, expectedValues, writer => writer.isLastSpace());
  }

  it("should be true when a space", () => {
    doTest("t t\t\r\n", [false, false, true, false, false, false, false]);
  });
});

describe("#isLastTab", () => {
  function doTest(str: string, expectedValues: boolean[]) {
    runSequentialCheck(str, expectedValues, writer => writer.isLastTab());
  }

  it("should be true when a tab", () => {
    doTest("t t\t\r\n", [false, false, false, false, true, false, false]);
  });
});

describe("#isOnFirstLineOfBlock", () => {
  function doTest(str: string, expectedValues: boolean[]) {
    runSequentialCheck(str, expectedValues, writer => writer.isOnFirstLineOfBlock());
  }

  it("should be true up until the new line", () => {
    doTest("t \t\n", [true, true, true, true, false]);
  });

  it("should be true when on a new block", () => {
    const writer = new CodeBlockWriter();
    assertState(true);
    writer.writeLine("testing");
    assertState(false);
    writer.inlineBlock(() => {
      assertState(true);
      writer.newLine();
      assertState(false);
      writer.indent(() => {
        assertState(true);
        writer.write("testing\n");
        assertState(false);
        writer.write("more\n");
        assertState(false);
      });
      assertState(false);
      writer.block(() => {
        assertState(true);
      });
      assertState(false);
    });
    assertState(false);

    function assertState(state: boolean) {
      expect(writer.isOnFirstLineOfBlock()).to.equal(state);
    }
  });
});

describe("#isAtStartOfFirstLineOfBlock", () => {
  function doTest(str: string, expectedValues: boolean[]) {
    runSequentialCheck(str, expectedValues, writer => writer.isAtStartOfFirstLineOfBlock());
  }

  it("should be true only for the first", () => {
    doTest("t \t\n", [true, false, false, false, false]);
  });

  it("should be true when on a new block at the start", () => {
    const writer = new CodeBlockWriter();
    assertState(true);
    writer.writeLine("testing");
    assertState(false);
    writer.inlineBlock(() => {
      assertState(true);
      writer.write(" ");
      assertState(false);
      writer.newLine();
      assertState(false);
      writer.indent(() => {
        assertState(true);
        writer.write("testing\n");
        assertState(false);
        writer.write("more\n");
        assertState(false);
      });
      assertState(false);
      writer.block(() => {
        assertState(true);
      });
      assertState(false);
    });
    assertState(false);

    function assertState(state: boolean) {
      expect(writer.isAtStartOfFirstLineOfBlock()).to.equal(state);
    }
  });
});

describe("#isLastNewLine", () => {
  function doTest(str: string, expectedValues: boolean[], customWriter?: CodeBlockWriter) {
    runSequentialCheck(str, expectedValues, writer => writer.isLastNewLine(), customWriter);
  }

  it("should be true when a new line", () => {
    doTest(" \nt", [false, false, true, false]);
  });

  it("should be true for \\n when specifying \\r\\n", () => {
    const writer = new CodeBlockWriter({ newLine: "\r\n" });
    doTest(" \nt", [false, false, true, false], writer);
  });
});

describe("#isLastBlankLine", () => {
  function doTest(str: string, expectedValues: boolean[], customWriter?: CodeBlockWriter) {
    runSequentialCheck(str, expectedValues, writer => writer.isLastBlankLine(), customWriter);
  }

  it("should be true when a blank line", () => {
    doTest(" \n\nt", [false, false, false, true, false]);
  });

  it("should be true when using \\r\\n", () => {
    doTest(" \n\r\nt", [false, false, false, false, true, false]);
  });
});

describe("#getLastChar", () => {
  function doTest(str: string, expectedValues: (string | undefined)[]) {
    runSequentialCheck(str, expectedValues, writer => writer.getLastChar());
  }

  it("should get the last char", () => {
    doTest(" \nt", [undefined, " ", "\n", "t"]);
  });
});

describe("#_getLastCharWithOffset", () => {
  function doTest(strs: string[], offset: number, expectedValue: string | undefined) {
    const writer = new CodeBlockWriter();
    for (const str of strs) {
      writer.write(str);
    }
    expect(writer._getLastCharCodeWithOffset(offset)).to.equal(expectedValue?.charCodeAt(0));
  }

  it("should return undefined for a negative number", () => {
    doTest(["values"], -1, undefined);
  });

  it("should return undefined for the text length", () => {
    doTest(["1", "2", "3"], 3, undefined);
  });

  it("should get when getting the first index", () => {
    doTest(["2", "1", "0"], 0, "0");
  });

  it("should get when getting the last index", () => {
    doTest(["3", "21", "0"], 3, "3");
  });

  it("should get when getting the last index of a write", () => {
    doTest(["3", "21", "0"], 2, "2");
  });

  it("should get when getting the first index of a write", () => {
    doTest(["3", "21", "0"], 1, "1");
  });
});

describe("indentNumberOfSpaces", () => {
  it("should indent 2 spaces", () => {
    const writer = new CodeBlockWriter({ indentNumberOfSpaces: 2 });
    writer.write("do").block(() => {
      writer.write("something");
    });

    const expected = `do {
  something
}`;

    expect(writer.toString()).to.equal(expected);
  });
});

describe("useTabs", () => {
  it("should use tabs", () => {
    const writer = new CodeBlockWriter({ useTabs: true });
    writer.write("do").block(() => {
      writer.write("do").block(() => {
        writer.write("something");
      });
    });

    const expected = `do {
\tdo {
\t\tsomething
\t}
}`;

    expect(writer.toString()).to.equal(expected);
  });
});

describe("#getOptions", () => {
  it("should have the options that were passed in", () => {
    const writer = new CodeBlockWriter({
      indentNumberOfSpaces: 8,
      newLine: "\r\n",
      useTabs: true,
      useSingleQuote: false,
    });
    expect(writer.getOptions()).to.deep.equal({
      indentNumberOfSpaces: 8,
      newLine: "\r\n",
      useTabs: true,
      useSingleQuote: false,
    });
  });
});
