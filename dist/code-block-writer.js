var CodeBlockWriter = (function () {
    function CodeBlockWriter(opts) {
        if (opts === void 0) { opts = null; }
        this._currentIndentation = 0;
        this._text = "";
        this._numberSpaces = 4;
        this._isAtStartOfBlock = false;
        this._newLine = (opts && opts.newLine) || "\n";
    }
    CodeBlockWriter.prototype.block = function (block) {
        this.spaceIfLastNotSpace().write("{");
        this._currentIndentation++;
        this.newLine();
        this._isAtStartOfBlock = true;
        block();
        this.removeLastIfNewLine();
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
        if (!this.isLastCharANewLine()) {
            this.newLine();
        }
        return this;
    };
    CodeBlockWriter.prototype.newLine = function () {
        var willCreateAConsecutiveBlankLine = this.isLastLineBlankLine() && this.isCurrentLineBlank();
        if (!willCreateAConsecutiveBlankLine && !this._isAtStartOfBlock && this._text.length !== 0) {
            this.write(this._newLine);
        }
        return this;
    };
    CodeBlockWriter.prototype.spaceIfLastNotSpace = function () {
        var lastChar = this.getLastChar();
        if (lastChar != null && lastChar !== " " && !this.isLastCharANewLine()) {
            this.write(" ");
        }
        return this;
    };
    CodeBlockWriter.prototype.write = function (str) {
        this._isAtStartOfBlock = false;
        if (str != null && str.length > 0) {
            if (str !== this._newLine && this.isLastCharANewLine()) {
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
        return this.removeConsecutiveNewLineAtEndOfString(this._text);
    };
    CodeBlockWriter.prototype.removeConsecutiveNewLineAtEndOfString = function (text) {
        var consecutiveNewline = this._newLine + this._newLine;
        if (text.lastIndexOf(consecutiveNewline) === text.length - consecutiveNewline.length) {
            text = text.substr(0, text.length - this._newLine.length);
        }
        return text;
    };
    CodeBlockWriter.prototype.removeLastIfNewLine = function () {
        if (this.isLastLineBlankLine() && this.isCurrentLineBlank()) {
            this._text = this._text.substr(0, this._text.length - this._newLine.length);
        }
    };
    CodeBlockWriter.prototype.isCurrentLineBlank = function () {
        return this.getCurrentLine().length === 0;
    };
    CodeBlockWriter.prototype.isLastLineBlankLine = function () {
        return this.getLastLine() === this._newLine;
    };
    CodeBlockWriter.prototype.getCurrentLine = function () {
        var lastNewLineIndex = this._text.lastIndexOf(this._newLine);
        if (lastNewLineIndex >= 0) {
            return this._text.substr(lastNewLineIndex + this._newLine.length);
        }
        else {
            return "";
        }
    };
    CodeBlockWriter.prototype.getLastLine = function () {
        var lastLine;
        var lastNewLineIndex = this._text.lastIndexOf(this._newLine);
        if (lastNewLineIndex >= 0) {
            var secondLastNewLineIndex = this._text.lastIndexOf(this._newLine, lastNewLineIndex - 1);
            if (secondLastNewLineIndex >= 0) {
                lastLine = this._text.substr(secondLastNewLineIndex, lastNewLineIndex - secondLastNewLineIndex);
            }
        }
        return lastLine;
    };
    CodeBlockWriter.prototype.isLastCharANewLine = function () {
        return this._text.indexOf(this._newLine, this._text.length - this._newLine.length) !== -1;
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
