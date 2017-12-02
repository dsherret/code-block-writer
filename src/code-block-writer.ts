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

    /**
     * Writes a block using braces.
     * @param block - Write using the writer within this block.
     */
    block(block: () => void) {
        this.newLineIfNewLineOnNextWrite();
        this.spaceIfLastNotSpace();
        this.inlineBlock(block);
        this._newLineOnNextWrite = true;
        return this;
    }

    /**
     * Writes an inline block with braces.
     * @param block - Write using the writer within this block.
     */
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

    /**
     * Conditionally writes a line of text.
     * @param condition - Condition to evaluate.
     * @param str - String to write if the condition is true.
     */
    conditionalWriteLine(condition: boolean, str: string) {
        if (condition)
            this.writeLine(str);

        return this;
    }

    /**
     * Writes a line of text.
     * @param str - String to write.
     */
    writeLine(str: string) {
        this.newLineIfNewLineOnNextWrite();
        if (this._text.length > 0)
            this.newLineIfLastNotNewLine();
        this.writeIndentingNewLines(str);
        this.newLine();

        return this;
    }

    /**
     * Writes a newline if the last line was not a newline.
     */
    newLineIfLastNotNewLine() {
        this.newLineIfNewLineOnNextWrite();

        if (!this.isLastCharANewLine())
            this.newLine();

        return this;
    }

    /**
     * Writes a blank line.
     */
    blankLine() {
        return this.newLineIfLastNotNewLine().newLine();
    }

    /**
     * Indents the code one level for the current line.
     */
    indent() {
        this.newLineIfNewLineOnNextWrite();
        return this.write(this._indentationText);
    }

    /**
     * Writes a newline if the condition is true.
     * @param condition - Condition to evaluate.
     */
    conditionalNewLine(condition: boolean) {
        if (condition)
            this.newLine();

        return this;
    }

    /**
     * Writes a newline.
     */
    newLine() {
        this._newLineOnNextWrite = false;
        this.baseWriteNewline();
        return this;
    }

    /**
     * Writes a space if the last character was not a space.
     */
    spaceIfLastNotSpace() {
        this.newLineIfNewLineOnNextWrite();
        const lastChar = this.getLastChar();

        if (lastChar !== " ")
            this.writeIndentingNewLines(" ");

        return this;
    }

    /**
     * Writes the provided text if the condition is true.
     * @param condition - Condition to evaluate.
     * @param str - Text to write.
     */
    conditionalWrite(condition: boolean, str: string) {
        if (condition)
            this.write(str);

        return this;
    }

    /**
     * Writes the provided text.
     * @param str - Text to write.
     */
    write(str: string) {
        this.newLineIfNewLineOnNextWrite();
        this.writeIndentingNewLines(str);
        return this;
    }

    /**
     * Gets the length of the string in the writer.
     */
    getLength() {
        return this._text.length;
    }

    /**
     * Gets if the writer is currently in a comment.
     */
    isInComment() {
        return this._currentCommentChar !== undefined;
    }

    /**
     * Gets if the writer is currently in a string.
     */
    isInString() {
        return this._stringCharStack.length > 0 && this._stringCharStack[this._stringCharStack.length - 1] !== "{";
    }

    /**
     * Gets the writer's text.
     */
    toString() {
        return this._text;
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
