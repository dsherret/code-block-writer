var CodeBlockWriter = (function () {
    function CodeBlockWriter() {
        this._currentIndentation = 0;
        this._text = "";
        this._numberSpaces = 4;
        this._lastWasNewLine = false;
    }
    CodeBlockWriter.prototype.block = function (block) {
        this.write(" {");
        this._currentIndentation++;
        this.newLine();
        block();
        this._currentIndentation--;
        this.writeLine("}");
        return this;
    };
    CodeBlockWriter.prototype.writeLine = function (str) {
        this.newLineIfLastNotNewLine();
        this.write(str);
        this.newLine();
        return this;
    };
    CodeBlockWriter.prototype.newLineIfLastNotNewLine = function () {
        if (!this._lastWasNewLine) {
            this.newLine();
        }
        return this;
    };
    CodeBlockWriter.prototype.newLine = function () {
        this.write("\n");
        this._lastWasNewLine = true;
        return this;
    };
    CodeBlockWriter.prototype.write = function (str) {
        if (this._lastWasNewLine) {
            this._lastWasNewLine = false;
            this.write(Array(this._getCurrentIndentationNumberSpaces()).join(" "));
        }
        this._text += str;
        return this;
    };
    CodeBlockWriter.prototype.toString = function () {
        return this._text;
    };
    CodeBlockWriter.prototype._getCurrentIndentationNumberSpaces = function () {
        return this._currentIndentation * this._numberSpaces;
    };
    return CodeBlockWriter;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CodeBlockWriter;
