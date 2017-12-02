import {CommentChar} from "./CommentChar";

export default class CodeBlockWriter {
    private readonly _indentationText: string;
    private readonly _newLine: string;
    private _currentIndentation = 0;
    private _text = "";
    private _newLineOnNextWrite = false;
    private _currentCommentChar: CommentChar | undefined = undefined;
    private _stringCharStack: ("\"" | "'" | "`" | "{")[] = [];

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
        this.baseWriteNewline();
        return this;
    }

    spaceIfLastNotSpace() {
        this.newLineIfNewLineOnNextWrite();
        const lastChar = this.getLastChar();

        if (lastChar !== " ")
            this.writeIndentingNewLines(" ");

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

    isInComment() {
        return this._currentCommentChar !== undefined;
    }

    isInString() {
        return this._stringCharStack.length > 0 && this._stringCharStack[this._stringCharStack.length - 1] !== "{";
    }

    toString() {
        return this.removeConsecutiveNewLineAtEndOfString(this._text);
    }

    private writeIndentingNewLines(str: string) {
        const items = (str || "").split(/\r?\n/);
        items.forEach((s, i) => {
            if (i > 0)
                this.baseWriteNewline();

            if (s.length > 0) {
                if (this.isLastCharANewLine() && !this.isInString())
                    this.writeIndentation();

                this.updateStringStack(s);
                this._text += s;
            }

            if (i > 0 && i === items.length - 1 && s.length === 0)
                this.baseWriteNewline();
        });
    }

    private baseWriteNewline() {
        if (this._currentCommentChar === CommentChar.Line)
            this._currentCommentChar = undefined;
        this._text += this._newLine;
    }

    private updateStringStack(str: string) {
        for (let i = 0; i < str.length; i++) {
            const currentChar = str[i];
            const pastChar = i === 0 ? this.getLastChar() : str[i - 1];
            const lastCharOnStack = this._stringCharStack.length === 0 ? undefined : this._stringCharStack[this._stringCharStack.length - 1];

            if (this._currentCommentChar == null && pastChar === "/" && currentChar === "/")
                this._currentCommentChar = CommentChar.Line;
            else if (this._currentCommentChar == null && pastChar === "/" && currentChar === "*")
                this._currentCommentChar = CommentChar.Star;
            else if (this._currentCommentChar === CommentChar.Star && pastChar === "*" && currentChar === "/")
                this._currentCommentChar = undefined;

            if (this.isInComment())
                continue;
            else if (currentChar === "\"" || currentChar === "'" || currentChar === "`") {
                if (lastCharOnStack === currentChar)
                    this._stringCharStack.pop();
                else if (lastCharOnStack === "{" || lastCharOnStack === undefined)
                    this._stringCharStack.push(currentChar);
            }
            else if (pastChar === "$" && currentChar === "{" && lastCharOnStack === "`")
                this._stringCharStack.push(currentChar);
            else if (currentChar === "}" && lastCharOnStack === "{")
                this._stringCharStack.pop();
        }
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
        if (this._text.length === 0)
            return undefined;

        return this._text[this._text.length - 1];
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
