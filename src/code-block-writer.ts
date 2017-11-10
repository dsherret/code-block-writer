export default class CodeBlockWriter {
    private readonly _indentationText: string;
    private readonly _newLine: string;
    private _currentIndentation = 0;
    private _text = "";
    private _isAtStartOfBlock = false;
    private _newLineOnNextWrite = false;

    constructor(opts?: { newLine?: string; indentNumberOfSpaces?: number; useTabs?: boolean; }) {
        this._newLine = (opts && opts.newLine) || "\n";
        this._indentationText = getIndentationText((opts && opts.useTabs) || false, (opts && opts.indentNumberOfSpaces) || 4);
    }

    block(block: () => void) {
        this.newLineIfNewLineOnNextWrite();
        this.spaceIfLastNotSpace();
        this.inlineBlock(block);
        this._newLineOnNextWrite = true;
        return this;
    }

    inlineBlock(block: () => void) {
        this.newLineIfNewLineOnNextWrite();
        this.write("{");
        this._currentIndentation++;
        this.newLine();
        this._isAtStartOfBlock = true;
        block();
        this._currentIndentation--;
        this.newLineIfLastNotNewLine().write("}");

        return this;
    }

    conditionalWriteLine(condition: boolean, str: string) {
        if (condition)
            this.writeLine(str);

        return this;
    }

    writeLine(str: string) {
        this.newLineIfNewLineOnNextWrite();
        if (this._text.length > 0)
            this.newLineIfLastNotNewLine();
        this.writeIndentingNewLines(str);
        this.newLine();

        return this;
    }

    newLineIfLastNotNewLine() {
        this.newLineIfNewLineOnNextWrite();

        if (!this.isLastCharANewLine())
            this.newLine();

        return this;
    }

    blankLine() {
        return this.newLineIfLastNotNewLine().newLine();
    }

    indent() {
        this.newLineIfNewLineOnNextWrite();
        return this.write(this._indentationText);
    }

    conditionalNewLine(condition: boolean) {
        if (condition)
            this.newLine();

        return this;
    }

    newLine() {
        this._newLineOnNextWrite = false;
        this.baseWrite(this._newLine);
        return this;
    }

    spaceIfLastNotSpace() {
        this.newLineIfNewLineOnNextWrite();
        const lastChar = this.getLastChar();

        if (lastChar !== " ")
            this.baseWrite(" ");

        return this;
    }

    conditionalWrite(condition: boolean, str: string) {
        if (condition)
            this.write(str);

        return this;
    }

    write(str: string) {
        this.newLineIfNewLineOnNextWrite();
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
        const items = (str || "").split(/\r?\n/);
        items.forEach((s, i) => {
            // don't use .newLine() here because we want to write out all the newlines the user requested
            if (i > 0)
                this.baseWrite(this._newLine);

            this.baseWrite(s);

            if (i > 0 && i === items.length - 1 && s.length === 0)
                this.baseWrite(this._newLine);
        });
    }

    private baseWrite(str: string) {
        this._isAtStartOfBlock = false;

        if (str == null || str.length === 0)
            return this;

        if (str !== this._newLine && this.isLastCharANewLine())
            this.writeIndentation();

        this._text += str;

        return this;
    }

    private removeConsecutiveNewLineAtEndOfString(text: string) {
        const consecutiveNewline = this._newLine + this._newLine;
        const lastIndexOfConsecutiveNewLines = text.lastIndexOf(consecutiveNewline);

        if (lastIndexOfConsecutiveNewLines >= 0 && lastIndexOfConsecutiveNewLines === text.length - consecutiveNewline.length)
            text = text.substr(0, text.length - this._newLine.length);

        return text;
    }

    private isLastCharANewLine() {
        return this._text.indexOf(this._newLine, this._text.length - this._newLine.length) !== -1;
    }

    private getLastChar() {
        let lastChar: string | null = null;

        if (this._text.length > 0)
            lastChar = this._text[this._text.length - 1];

        return lastChar;
    }

    private writeIndentation() {
        this._text += Array(this._currentIndentation + 1).join(this._indentationText);
    }

    private newLineIfNewLineOnNextWrite() {
        if (!this._newLineOnNextWrite)
            return;
        this._newLineOnNextWrite = false;
        this.newLine();
    }
}

function getIndentationText(useTabs: boolean, numberSpaces: number) {
    if (useTabs)
        return "\t";
    return Array(numberSpaces + 1).join(" ");
}
