import { stringRepeat, escapeForWithinString, getStringFromStrOrFunc } from "./utils/stringUtils";
import { CommentChar } from "./CommentChar";

export interface Options {
    newLine: string;
    indentNumberOfSpaces: number;
    useTabs: boolean;
    useSingleQuote: boolean;
}

export default class CodeBlockWriter {
    private readonly _indentationText: string;
    private readonly _newLine: string;
    private readonly _useTabs: boolean;
    private readonly _quoteChar: string;
    private readonly _indentNumberOfSpaces: number;
    private _currentIndentation = 0;
    private _queuedIndentation: number | undefined;
    private _text = "";
    private _newLineOnNextWrite = false;
    /** @internal */
    private _currentCommentChar: CommentChar | undefined = undefined;
    private _stringCharStack: ("\"" | "'" | "`" | "{")[] = [];
    private _isInRegEx = false;
    private _isOnFirstLineOfBlock = true;

    constructor(opts: Partial<Options> = {}) {
        this._newLine = opts.newLine || "\n";
        this._useTabs = opts.useTabs || false;
        this._indentNumberOfSpaces = opts.indentNumberOfSpaces || 4;
        this._indentationText = getIndentationText(this._useTabs, this._indentNumberOfSpaces);
        this._quoteChar = opts.useSingleQuote ? "'" : `"`;
    }

    /**
     * Gets the options.
     */
    getOptions(): Options {
        return {
            indentNumberOfSpaces: this._indentNumberOfSpaces,
            newLine: this._newLine,
            useTabs: this._useTabs,
            useSingleQuote: this._quoteChar === "'"
        };
    }

    /**
     * Queues the indentation level for the next lines written.
     * @param indentationLevel - Indentation level to queue.
     */
    queueIndentationLevel(indentationLevel: number): this;
    /**
     * Queues the indentation level for the next lines written using the provided indentation text.
     * @param whitespaceText - Gets the indentation level from the indentation text.
     */
    queueIndentationLevel(whitespaceText: string): this;
    queueIndentationLevel(countOrText: string | number) {
        this._queuedIndentation = this._getIndentationLevelFromArg(countOrText);
        return this;
    }

    /**
     * Sets the current indentation level.
     * @param indentationLevel - Indentation level to be at.
     */
    setIndentationLevel(indentationLevel: number): this;
    /**
     * Sets the current indentation using the provided indentation text.
     * @param whitespaceText - Gets the indentation level from the indentation text.
     */
    setIndentationLevel(whitespaceText: string): this;
    /**
     * @internal
     */
    setIndentationLevel(countOrText: string | number): this;
    setIndentationLevel(countOrText: string | number) {
        this._currentIndentation = this._getIndentationLevelFromArg(countOrText);
        return this;
    }

    /**
     * Gets the current indentation level.
     */
    getIndentationLevel() {
        return this._currentIndentation;
    }

    /**
     * Writes a block using braces.
     * @param block - Write using the writer within this block.
     */
    block(block?: () => void) {
        this._newLineIfNewLineOnNextWrite();
        if (this.getLength() > 0 && !this.isLastNewLine())
            this.spaceIfLastNot();
        this.inlineBlock(block);
        this._newLineOnNextWrite = true;
        return this;
    }

    /**
     * Writes an inline block with braces.
     * @param block - Write using the writer within this block.
     */
    inlineBlock(block?: () => void) {
        this._newLineIfNewLineOnNextWrite();
        this.write("{");
        this._indentBlockInternal(block);
        this.newLineIfLastNot().write("}");

        return this;
    }

    /**
     * Indents a block of code.
     * @param block - Block to indent.
     */
    indentBlock(block: () => void): this {
        this._indentBlockInternal(block);
        if (!this.isLastNewLine())
            this._newLineOnNextWrite = true;
        return this;
    }

    private _indentBlockInternal(block?: () => void) {
        this._currentIndentation++;
        if (this.getLastChar() != null)
            this.newLineIfLastNot();
        this._isOnFirstLineOfBlock = true;
        if (block != null)
            block();
        this._isOnFirstLineOfBlock = false;
        this._currentIndentation = Math.max(0, this._currentIndentation - 1);
    }

    /**
     * Conditionally writes a line of text.
     * @param condition - Condition to evaluate.
     * @param textFunc - A function that returns a string to write if the condition is true.
     */
    conditionalWriteLine(condition: boolean | undefined, textFunc: () => string): this;
    /**
     * Conditionally writes a line of text.
     * @param condition - Condition to evaluate.
     * @param text - Text to write if the condition is true.
     */
    conditionalWriteLine(condition: boolean | undefined, text: string): this;
    conditionalWriteLine(condition: boolean | undefined, strOrFunc: string | (() => string)) {
        if (condition)
            this.writeLine(getStringFromStrOrFunc(strOrFunc));

        return this;
    }

    /**
     * Writes a line of text.
     * @param text - String to write.
     */
    writeLine(text: string) {
        this._newLineIfNewLineOnNextWrite();
        if (this._text.length > 0)
            this.newLineIfLastNot();
        this._writeIndentingNewLines(text);
        this.newLine();

        return this;
    }

    /**
     * Writes a newline if the last line was not a newline.
     */
    newLineIfLastNot() {
        this._newLineIfNewLineOnNextWrite();

        if (!this.isLastNewLine())
            this.newLine();

        return this;
    }

    /**
     * Writes a blank line if the last written text was not a blank line.
     */
    blankLineIfLastNot() {
        if (!this.isLastBlankLine())
            this.blankLine();
        return this;
    }

    /**
     * Writes a blank line if the condition is true.
     * @param condition - Condition to evaluate.
     */
    conditionalBlankLine(condition: boolean | undefined) {
        if (condition)
            this.blankLine();
        return this;
    }

    /**
     * Writes a blank line.
     */
    blankLine() {
        return this.newLineIfLastNot().newLine();
    }

    /**
     * Indents the code one level for the current line.
     */
    indent() {
        this._newLineIfNewLineOnNextWrite();
        return this.write(this._indentationText);
    }

    /**
     * Writes a newline if the condition is true.
     * @param condition - Condition to evaluate.
     */
    conditionalNewLine(condition: boolean | undefined) {
        if (condition)
            this.newLine();
        return this;
    }

    /**
     * Writes a newline.
     */
    newLine() {
        this._newLineOnNextWrite = false;
        this._baseWriteNewline();
        return this;
    }

    /**
     * Writes a quote character.
     */
    quote(): this;
    /**
     * Writes text surrounded in quotes.
     * @param text - Text to write.
     */
    quote(text: string): this;
    quote(text?: string) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(text == null ? this._quoteChar : this._quoteChar + escapeForWithinString(text, this._quoteChar) + this._quoteChar);
        return this;
    }

    /**
     * Writes a space if the last character was not a space.
     */
    spaceIfLastNot() {
        this._newLineIfNewLineOnNextWrite();

        if (!this.isLastSpace())
            this._writeIndentingNewLines(" ");

        return this;
    }

    /**
     * Writes a space.
     * @param times - Number of times to write a space.
     */
    space(times = 1) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(stringRepeat(" ", times));
        return this;
    }

    /**
     * Writes a tab if the last character was not a tab.
     */
    tabIfLastNot() {
        this._newLineIfNewLineOnNextWrite();

        if (!this.isLastTab())
            this._writeIndentingNewLines("\t");

        return this;
    }

    /**
     * Writes a tab.
     * @param times - Number of times to write a tab.
     */
    tab(times = 1) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(stringRepeat("\t", times));
        return this;
    }

    /**
     * Conditionally writes text.
     * @param condition - Condition to evaluate.
     * @param textFunc - A function that returns a string to write if the condition is true.
     */
    conditionalWrite(condition: boolean | undefined, textFunc: () => string): this;
    /**
     * Conditionally writes text.
     * @param condition - Condition to evaluate.
     * @param text - Text to write if the condition is true.
     */
    conditionalWrite(condition: boolean | undefined, text: string): this;
    conditionalWrite(condition: boolean | undefined, textOrFunc: string | (() => string)) {
        if (condition)
            this.write(getStringFromStrOrFunc(textOrFunc));

        return this;
    }

    /**
     * Writes the provided text.
     * @param text - Text to write.
     */
    write(text: string) {
        this._newLineIfNewLineOnNextWrite();
        this._writeIndentingNewLines(text);
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
     * Gets if the writer is currently at the start of the first line of the text, block, or indentation block.
     */
    isAtStartOfFirstLineOfBlock() {
        return this.isOnFirstLineOfBlock() && (this.isLastNewLine() || this.getLastChar() == null);
    }

    /**
     * Gets if the writer is currently on the first line of the text, block, or indentation block.
     */
    isOnFirstLineOfBlock() {
        return this._isOnFirstLineOfBlock;
    }

    /**
     * Gets if the writer is currently in a string.
     */
    isInString() {
        return this._stringCharStack.length > 0 && this._stringCharStack[this._stringCharStack.length - 1] !== "{";
    }

    /**
     * Gets if the last chars written were for a newline.
     */
    isLastNewLine() {
        return this._text.indexOf(this._newLine, this._text.length - this._newLine.length) !== -1 || this._text[this._text.length - 1] === "\n";
    }

    /**
     * Gets if the last chars written were for a blank line.
     */
    isLastBlankLine() {
        let foundCount = 0;
        for (let i = this._text.length - 1; i >= 0; i--) {
            const currentChar = this._text[i];
            if (currentChar === "\n") {
                foundCount++;
                if (foundCount === 2)
                    return true;
            }
            else if (currentChar !== "\r")
                return false;
        }
        return false;
    }

    /**
     * Gets if the last char written was a space.
     */
    isLastSpace() {
        return this.getLastChar() === " ";
    }

    /**
     * Gets if the last char written was a tab.
     */
    isLastTab() {
        return this.getLastChar() === "\t";
    }

    /**
     * Gets the last char written.
     */
    getLastChar() {
        if (this._text.length === 0)
            return undefined;

        return this._text[this._text.length - 1];
    }

    /**
     * Gets the writer's text.
     */
    toString() {
        return this._text;
    }

    private static readonly _newLineRegEx = /\r?\n/;
    private _writeIndentingNewLines(text: string) {
        text = text || "";
        if (text.length === 0) {
            writeIndividual.call(this, "");
            return;
        }

        const items = text.split(CodeBlockWriter._newLineRegEx);
        items.forEach((s, i) => {
            if (i > 0)
                this._baseWriteNewline();

            if (s.length === 0)
                return;

            writeIndividual.call(this, s);
        });

        function writeIndividual(this: CodeBlockWriter, s: string) {
            if (!this.isInString()) {
                const isAtStartOfLine = this.isLastNewLine() || this._text.length === 0;
                if (isAtStartOfLine)
                    this._writeIndentation();
            }

            this._updateInternalState(s);
            this._text += s;
            this.dequeueQueuedIndentation();
        }
    }

    private _baseWriteNewline() {
        if (this._currentCommentChar === CommentChar.Line)
            this._currentCommentChar = undefined;
        this._text += this._newLine;
        this._isOnFirstLineOfBlock = false;
        this.dequeueQueuedIndentation();
    }

    private dequeueQueuedIndentation() {
        if (this._queuedIndentation == null)
            return;

        this._currentIndentation = this._queuedIndentation;
        this._queuedIndentation = undefined;
    }

    private _updateInternalState(str: string) {
        for (let i = 0; i < str.length; i++) {
            const currentChar = str[i];
            const pastChar = i === 0 ? this._text[this._text.length - 1] : str[i - 1];
            const pastPastChar = i === 0 ? this._text[this._text.length - 2] : str[i - 2];

            // handle regex
            if (this._isInRegEx) {
                if (pastChar === "/" && pastPastChar !== "\\" || pastChar === "\n")
                    this._isInRegEx = false;
                else
                    continue;
            }
            else if (!this.isInString() && !this.isInComment() && isRegExStart(currentChar, pastChar, pastPastChar)) {
                this._isInRegEx = true;
                continue;
            }

            // handle comments
            if (this._currentCommentChar == null && pastChar === "/" && currentChar === "/")
                this._currentCommentChar = CommentChar.Line;
            else if (this._currentCommentChar == null && pastChar === "/" && currentChar === "*")
                this._currentCommentChar = CommentChar.Star;
            else if (this._currentCommentChar === CommentChar.Star && pastChar === "*" && currentChar === "/")
                this._currentCommentChar = undefined;

            if (this.isInComment())
                continue;

            // handle strings
            const lastStringCharOnStack = this._stringCharStack.length === 0 ? undefined : this._stringCharStack[this._stringCharStack.length - 1];
            if (currentChar === "\"" || currentChar === "'" || currentChar === "`") {
                if (lastStringCharOnStack === currentChar)
                    this._stringCharStack.pop();
                else if (lastStringCharOnStack === "{" || lastStringCharOnStack === undefined)
                    this._stringCharStack.push(currentChar);
            }
            else if (pastChar === "$" && currentChar === "{" && lastStringCharOnStack === "`")
                this._stringCharStack.push(currentChar);
            else if (currentChar === "}" && lastStringCharOnStack === "{")
                this._stringCharStack.pop();
        }

        function isRegExStart(currentChar: string, pastChar: string, pastPastChar: string) {
            return pastChar === "/"
                && currentChar !== "/"
                && currentChar !== "*"
                && pastPastChar !== "*"
                && pastPastChar !== "/";
        }
    }

    private _writeIndentation() {
        const flooredIndentation = Math.floor(this._currentIndentation);
        for (let i = 0; i < flooredIndentation; i++)
            this._text += this._indentationText;

        const overflow = this._currentIndentation - flooredIndentation;
        if (this._useTabs) {
            if (overflow > 0.5)
                this._text += this._indentationText;
        }
        else {
            const portion = Math.round(this._indentationText.length * overflow);
            for (let i = 0; i < portion; i++)
                this._text += this._indentationText[i];
        }
    }

    private _newLineIfNewLineOnNextWrite() {
        if (!this._newLineOnNextWrite)
            return;
        this._newLineOnNextWrite = false;
        this.newLine();
    }

    private static readonly _spacesOrTabsRegEx = /^[ \t]*$/;
    private _getIndentationLevelFromArg(countOrText: string | number) {
        if (typeof countOrText === "number") {
            if (countOrText < 0)
                throw new Error("Passed in indentation level should be greater than or equal to 0.");
            return countOrText;
        }
        else if (typeof countOrText === "string") {
            if (!CodeBlockWriter._spacesOrTabsRegEx.test(countOrText))
                throw new Error("Provided string must be empty or only contain spaces or tabs.");

            const { spacesCount, tabsCount } = getSpacesAndTabsCount(countOrText);
            return tabsCount + spacesCount / this._indentNumberOfSpaces;
        }
        else
            throw new Error("Argument provided must be a string or number.");
    }
}

function getIndentationText(useTabs: boolean, numberSpaces: number) {
    if (useTabs)
        return "\t";
    return Array(numberSpaces + 1).join(" ");
}

function getSpacesAndTabsCount(str: string) {
    let spacesCount = 0;
    let tabsCount = 0;

    for (const char of str) {
        if (char === "\t")
            tabsCount++;
        else if (char === " ")
            spacesCount++;
    }

    return { spacesCount, tabsCount };
}
