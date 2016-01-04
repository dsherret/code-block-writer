var CodeBlockWriter = (function () {
    function CodeBlockWriter(opts) {
        if (opts === void 0) { opts = null; }
        this._currentIndentation = 0;
        this._text = "";
        this._numberSpaces = 4;
        this._isAtStartOfBlock = false;
        this._newline = (opts && opts.newLine) || "\n";
    }
    CodeBlockWriter.prototype.block = function (block) {
        this.spaceIfLastNotSpace().write("{");
        this._currentIndentation++;
        this.newLine();
        this._isAtStartOfBlock = true;
        block();
        this._currentIndentation--;
        this.writeLine("}");
        return this;
    };
    CodeBlockWriter.prototype.writeLine = function (str) {
        this.newLineIfLastCharNotNewLine();
        this.write(str);
        this.newLine();
        return this;
    };
    CodeBlockWriter.prototype.newLineIfLastCharNotNewLine = function () {
        if (this.getLastChar() !== this._newline) {
            this.newLine();
        }
        return this;
    };
    CodeBlockWriter.prototype.newLine = function () {
        if (this.isLastLineNotBlankNewLine() && !this._isAtStartOfBlock && this._text.length !== 0) {
            this.write(this._newline);
        }
        return this;
    };
    CodeBlockWriter.prototype.spaceIfLastNotSpace = function () {
        var lastChar = this.getLastChar();
        if (lastChar != null && lastChar !== " " && lastChar !== this._newline) {
            this.write(" ");
        }
        return this;
    };
    CodeBlockWriter.prototype.write = function (str) {
        this._isAtStartOfBlock = false;
        if (str != null && str.length > 0) {
            if (str !== this._newline && this.getLastChar() === this._newline) {
                this.writeIndentation();
            }
            this._text += str;
        }
        return this;
    };
    CodeBlockWriter.prototype.getLength = function () {
        return this._text.length;
    };
    CodeBlockWriter.prototype.toString = function () {
        return this._text;
    };
    CodeBlockWriter.prototype.isLastLineNotBlankNewLine = function () {
        return this.getLastLine() !== this._newline;
    };
    CodeBlockWriter.prototype.getLastLine = function () {
        var lastLine;
        var lastNewLineIndex = this._text.lastIndexOf(this._newline);
        if (lastNewLineIndex >= 0) {
            var secondLastNewLineIndex = this._text.lastIndexOf(this._newline, lastNewLineIndex - 1);
            if (secondLastNewLineIndex >= 0) {
                return this._text.substr(secondLastNewLineIndex, lastNewLineIndex - secondLastNewLineIndex);
            }
        }
        return lastLine;
    };
    CodeBlockWriter.prototype.getLastChar = function () {
        var lastChar;
        if (this._text.length > 0) {
            lastChar = this._text[this._text.length - 1];
        }
        return lastChar;
    };
    CodeBlockWriter.prototype.writeIndentation = function () {
        this._text += Array(this._getCurrentIndentationNumberSpaces() + 1).join(" ");
    };
    CodeBlockWriter.prototype._getCurrentIndentationNumberSpaces = function () {
        return this._currentIndentation * this._numberSpaces;
    };
    return CodeBlockWriter;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CodeBlockWriter;

//# sourceMappingURL=code-block-writer.js.map
