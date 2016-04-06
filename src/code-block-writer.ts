export default class CodeBlockWriter {
    private _currentIndentation = 0;
    private _text = "";
    private _numberSpaces = 4;
    private _newLine: string;
    private _isAtStartOfBlock = false;

    constructor(opts: { newLine: string } = null) {
        this._newLine = (opts && opts.newLine) || "\n";
    }

    block(block: () => void) {
        this.spaceIfLastNotSpace().write("{");
        this._currentIndentation++;
        this.newLine();
        this._isAtStartOfBlock = true;
        block();
        this.removeLastIfNewLine();
        this._currentIndentation--;
        this.writeLine("}");

        return this;
    }

    writeLine(str: string) {
        this.newLineIfLastCharNotNewLine();
        this.writeIndentingNewLines(str);
        this.newLine();

        return this;
    }

    newLineIfLastCharNotNewLine() {
        if (!this.isLastCharANewLine()) {
            this.newLine();
        }

        return this;
    }

    newLine() {
        const willCreateAConsecutiveBlankLine = this.isLastLineBlankLine() && this.isCurrentLineBlank();

        if (!willCreateAConsecutiveBlankLine && !this._isAtStartOfBlock && this._text.length !== 0) {
            this.baseWrite(this._newLine);
        }

        return this;
    }

    spaceIfLastNotSpace() {
        const lastChar = this.getLastChar();

        if (lastChar != null && lastChar !== " " && !this.isLastCharANewLine()) {
            this.baseWrite(" ");
        }

        return this;
    }

    write(str: string) {
        this.writeIndentingNewLines(str);
        return this;
    }

    getLength() {
        return this._text.length;
    }

    toString() {
        return this.removeConsecutiveNewLineAtEndOfString(this._text);
    }

    private writeIndentingNewLines(str: string) {
        (str || "").split(/\r?\n/).forEach((s, i) => {
            if (i > 0) {
                this.newLine();
            }
            this.baseWrite(s);
        });
    }

    private baseWrite(str: string) {
        this._isAtStartOfBlock = false;

        if (str != null && str.length > 0) {
            if (str !== this._newLine && this.isLastCharANewLine()) {
                this.writeIndentation();
            }

            this._text += str;
        }

        return this;
    }

    private removeConsecutiveNewLineAtEndOfString(text: string) {
        const consecutiveNewline = this._newLine + this._newLine;

        if (text.lastIndexOf(consecutiveNewline) === text.length - consecutiveNewline.length) {
            text = text.substr(0, text.length - this._newLine.length);
        }

        return text;
    }

    private removeLastIfNewLine() {
        if (this.isLastLineBlankLine() && this.isCurrentLineBlank()) {
            this._text = this._text.substr(0, this._text.length - this._newLine.length);
        }
    }

    private isCurrentLineBlank() {
        return this.getCurrentLine().length === 0;
    }

    private isLastLineBlankLine() {
        return this.getLastLine() === this._newLine;
    }

    private getCurrentLine() {
        const lastNewLineIndex = this._text.lastIndexOf(this._newLine);

        if (lastNewLineIndex >= 0) {
            return this._text.substr(lastNewLineIndex + this._newLine.length);
        }
        else {
            return "";
        }
    }

    private getLastLine() {
        let lastLine: string;
        const lastNewLineIndex = this._text.lastIndexOf(this._newLine);

        if (lastNewLineIndex >= 0) {
            const secondLastNewLineIndex = this._text.lastIndexOf(this._newLine, lastNewLineIndex - 1);

            if (secondLastNewLineIndex >= 0) {
                lastLine = this._text.substr(secondLastNewLineIndex, lastNewLineIndex - secondLastNewLineIndex);
            }
        }

        return lastLine;
    }

    private isLastCharANewLine() {
        return this._text.indexOf(this._newLine, this._text.length - this._newLine.length) !== -1;
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
