export default class CodeBlockWriter {
    private _currentIndentation = 0;
    private _text = "";
    private _numberSpaces = 4;
    private _lastWasNewLine = false;

    block(block: () => void) {
        this.write(" {");
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
        this.write("\n");
        this._lastWasNewLine = true;

        return this;
    }

    write(str: string) {
        if (this._lastWasNewLine) {
            this._lastWasNewLine = false;

            if (str !== "\n") {
                this.write(Array(this._getCurrentIndentationNumberSpaces()).join(" "));
            }
        }

        this._text += str;

        return this;
    }

    toString() {
        return this._text;
    }

    private _getCurrentIndentationNumberSpaces() {
        return this._currentIndentation * this._numberSpaces;
    }
}
