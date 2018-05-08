code-block-writer
=================

[![npm version](https://badge.fury.io/js/code-block-writer.svg)](https://badge.fury.io/js/code-block-writer)
[![Build Status](https://travis-ci.org/dsherret/code-block-writer.svg)](https://travis-ci.org/dsherret/code-block-writer)
[![Coverage Status](https://coveralls.io/repos/dsherret/code-block-writer/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/code-block-writer?branch=master)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A simple code writer that assists with formatting and visualizing blocks of JavaScript or TypeScript code.

```
npm install --save code-block-writer
```

## Example

```typescript
import CodeBlockWriter from "code-block-writer";

const writer = new CodeBlockWriter({
    // optional options
    newLine: "\r\n",         // default: "\n"
    indentNumberOfSpaces: 2, // default: 4
    useTabs: false,          // default: false
    useSingleQuote: true     // default: false
});
const className = "MyClass";

writer.write(`class ${className} extends OtherClass`).block(() => {
    writer.writeLine(`@MyDecorator(1, 2)`);
    writer.write(`myMethod(myParam: any)`).block(() => {
        writer.write("return this.post(").quote("myArgument").write(");");
    });
});

console.log(writer.toString());
```

Outputs (using "\r\n" for newlines):

```text
class MyClass extends OtherClass {
  @MyDecorator(1, 2)
  myMethod(myParam: any) {
    return this.post('myArgument');
  }
}
```

## Methods

* `block(block?: () => void)` - Indents all the code written within and surrounds it in braces.
* `inlineBlock(block?: () => void)` - Same as block, but doesn't add a space before the first brace and doesn't add a newline at the end.
* `getLength()` - Get the current number of characters.
* `writeLine(str: string)` - Writes some text and adds a newline.
* `newLine()` - Writes a newline.
* `newLineIfLastNot()` - Writes a newline if what was written last wasn't a newline.
* `blankLine()` - Writes a blank line. Does not allow consecutive blank lines.
* `blankLineIfLastNot()` - Writes a blank line if what was written last wasn't a blank line.
* `quote()` - Writes a quote character.
* `quote(text: string)` - Writes text surrounded in quotes.
* `indent()` - Indents the current line.
* `indentBlock(block?: () => void)` - Indents a block of code.
* `space(times?: number)` - Writes a space. Optionally writes multiple spaces if providing a number.
* `spaceIfLastNot()` - Writes a space if the last was not a space.
* `tab(times?: number)` - Writes a tab. Optionally writes multiple tabs if providing a number.
* `tabIfLastNot()` - Writes a tab if the last was not a tab.
* `write(text: string)` - Writes some text.
* `conditionalNewLine(condition: boolean)` - Writes a newline if the condition is matched.
* `conditionalBlankLine(condition: boolean)` - Writes a blank line if the condition is matched.
* `conditionalWrite(condition: boolean, text: string)` - Writes if the condition is matched.
* `conditionalWrite(condition: boolean, textFunc: () => string)` - Writes if the condition is matched.
* `conditionalWriteLine(condition: boolean, text: string)` - Writes some text and adds a newline if the condition is matched.
* `conditionalWriteLine(condition: boolean, textFunc: () => string)` - Writes some text and adds a newline if the condition is matched.
* `setIndentationLevel(indentationLevel: number)` - Sets the current indentation level.
* `getIndentationLevel()` - Gets the current indentation level.
* `queueIndentationLevel(indentationLevel: number)` - Queues an indentation level to be used once a new line is written.
* `isInComment()` - Gets if the writer is currently in a comment.
* `isAtStartOfFirstLineOfBlock()` - Gets if the writer is currently at the start of the first line of the text, block, or indentation block.
* `isOnFirstLineOfBlock()` - Gets if the writer is currently on the first line of the text, block, or indentation block.
* `isInString()` - Gets if the writer is currently in a string.
* `isLastNewLine()` - Gets if the writer last wrote a newline.
* `isLastBlankLine()` - Gets if the writer last wrote a blank line.
* `isLastSpace()` - Gets if the writer last wrote a space.
* `isLastTab()` - Gets if the writer last wrote a tab.
* `getLastChar()` - Gets the last character written.
* `getOptions()` - Gets the writer options.
* `toString()` - Gets the string.
