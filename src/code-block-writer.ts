export default class CodeBlockWriter {
    private _currentIndentation = 0;
    private _text = "";
    private _numberSpaces = 4;
    private _newline: string;
    private _isAtStartOfBlock = false;

    constructor(opts: { newLine: string } = null) {
        this._newline = (opts && opts.newLine) || "\n";
    }

    block(block: () => void) {
        this.spaceIfLastNotSpace().write("{");
        this._currentIndentation++;
        this.newLine();
        this._isAtStartOfBlock = true;
        block();
        this._currentIndentation--;
        this.writeLine("}");

        return this;
    }

    writeLine(str: string) {
        this.newLineIfLastCharNotNewLine();
        this.write(str);
        this.newLine();

        return this;
    }

    newLineIfLastCharNotNewLine() {
        if (this.getLastChar() !== this._newline) {
            this.newLine();
        }

        return this;
    }

    newLine() {
        if (this.isLastLineNotBlankNewLine() && !this._isAtStartOfBlock && this._text.length !== 0) {
            this.write(this._newline);
        }

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
        this._isAtStartOfBlock = false;

        if (str != null && str.length > 0) {
            if (str !== this._newline && this.getLastChar() === this._newline) {
                this.writeIndentation();
            }

            this._text += str;
        }

        return this;
    }

    getLength() {
        return this._text.length;
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
        this._text += Array(this._getCurrentIndentationNumberSpaces() + 1).join(" ");
    }

    private _getCurrentIndentationNumberSpaces() {
        return this._currentIndentation * this._numberSpaces;
    }
}
