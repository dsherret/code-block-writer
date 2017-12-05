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

Outputs:

```text
class MyClass extends OtherClass {
   @MyDecorator(1, 2)
   myMethod(myParam: any) {
       return this.post('myArgument');
   }
}
```

## Methods

* `block(block: () => void)` - Indents all the code written within and surrounds it in braces.
* `inlineBlock(block: () => void)` - Same as block, but doesn't add a space before the first brace and doesn't add a newline at the end.
* `getLength()` - Get the current number of characters.
* `writeLine(str: string)` - Writes some text and adds a newline.
* `newLineIfLastNotNewLine()` - Writes a newline if what was written last wasn't a newline.
* `newLine()` - Writes a newline.
* `blankLine()` - Writes a blank line. Does not allow consecutive blank lines.
* `quote()` - Writes a quote character.
* `quote(text: string)` - Writes text surrounded in quotes.
* `indent()` - Indents the current line.
* `spaceIfLastNotSpace()` - Writes a space if the last was not a space.
* `write(str: string)` - Writes some text.
* `conditionalNewLine(condition: boolean)` - Writes a newline if the condition is matched.
* `conditionalWrite(condition: boolean, str: string)` - Writes if the condition is matched.
* `conditionalWriteLine(condition: boolean, str: string)` - Writes some text and adds a newline if the condition is matched.
* `setIndentationLevel(indentationLevel: number)` - Sets the current indentation level.
* `isInComment()` - Gets if the writer is currently in a comment.
* `isInString()` - Gets if the writer is currently in a string.
* `toString()` - Gets the string.
