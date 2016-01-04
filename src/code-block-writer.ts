export default class CodeBlockWriter {
    private _currentIndentation = 0;
    private _text = "";
    private _numberSpaces = 4;
    private _lastWasNewLine = true;
    private _newline: string;

    constructor(opts: { newLine: string } = null) {
        this._newline = (opts && opts.newLine) || "\n";
    }

    block(block: () => void) {
        this.spaceIfLastNotSpace().write("{");
        this._currentIndentation++;
        this.newLine();
        block();
        this._currentIndentation--;
        this.writeLine("}");

        return this;
    }

    writeLine(str: string) {
        this.newLineIfLastNotNewLine();
        this.write(str);
        this.newLine();

        return this;
    }

    newLineIfLastNotNewLine() {
        if (!this._lastWasNewLine) {
            this.newLine();
        }

        return this;
    }

    newLine() {
        if (this.isLastLineNotBlankNewLine()) {
            this.write(this._newline);
        }

        this._lastWasNewLine = true;

        return this;
    }

    spaceIfLastNotSpace() {
        const lastChar = this.getLastChar();

        if (lastChar != null && lastChar !== " " && lastChar !== this._newline) {
            this.write(" ");
        }

        return this;
    }

    write(str: string) {
        if (this._lastWasNewLine) {
            this._lastWasNewLine = false;

            if (str !== this._newline) {
                this.writeIndentation();
            }
        }

        this._text += str;

        return this;
    }

    toString() {
        return this._text;
    }

    private isLastLineNotBlankNewLine() {
        return this.getLastLine() !== this._newline;
    }

    private getLastLine() {
        let lastLine: string;
        const lastNewLineIndex = this._text.lastIndexOf(this._newline);

        if (lastNewLineIndex >= 0) {
            const secondLastNewLineIndex = this._text.lastIndexOf(this._newline, lastNewLineIndex - 1);

            if (secondLastNewLineIndex >= 0) {
                return this._text.substr(secondLastNewLineIndex, lastNewLineIndex - secondLastNewLineIndex);
            }
        }

        return lastLine;
    }

    private getLastChar() {
        let lastChar: string;

        if (this._text.length > 0) {
            lastChar = this._text[this._text.length - 1];
        }

        return lastChar;
    }

    private writeIndentation() {
        this.write(Array(this._getCurrentIndentationNumberSpaces() + 1).join(" "));
    }

    private _getCurrentIndentationNumberSpaces() {
        return this._currentIndentation * this._numberSpaces;
    }
}
