import { escapeForWithinString, getStringFromStrOrFunc } from "./utils/stringUtils";
import { CommentChar } from "./CommentChar";

/**
 * Options for the writer.
 */
export interface Options {
    /**
     * Newline character.
     * @remarks Defaults to \n.
     */
    newLine: "\n" | "\r\n";
    /**
     * Number of spaces to indent when `useTabs` is false.
     * @remarks Defaults to 4.
     */
    indentNumberOfSpaces: number;
    /**
     * Whether to use tabs (true) or spaces (false).
     * @remarks Defaults to false.
     */
    useTabs: boolean;
    /**
     * Whether to use a single quote (true) or double quote (false).
     * @remarks Defaults to false.
     */
    useSingleQuote: boolean;
}

/**
 * Code writer that assists with formatting and visualizing blocks of JavaScript or TypeScript code.
 */
export default class CodeBlockWriter {
    /** @internal */
    private readonly _indentationText: string;
    /** @internal */
    private readonly _newLine: "\n" | "\r\n";
    /** @internal */
    private readonly _useTabs: boolean;
    /** @internal */
    private readonly _quoteChar: string;
    /** @internal */
    private readonly _indentNumberOfSpaces: number;
    /** @internal */
    private _currentIndentation = 0;
    /** @internal */
    private _queuedIndentation: number | undefined;
    /** @internal */
    private _length = 0;
    /** @internal */
    private _newLineOnNextWrite = false;
    /** @internal */
    private _currentCommentChar: CommentChar | undefined = undefined;
    /** @internal */
    private _stringCharStack: ("\"" | "'" | "`" | "{")[] = [];
    /** @internal */
    private _isInRegEx = false;
    /** @internal */
    private _isOnFirstLineOfBlock = true;
    // An array of strings is used rather than a single string because it was
    // found to be ~11x faster when printing a 10K line file (~11s to ~1s).
    /** @internal */
    private _texts: string[] = [];

    /**
     * Constructor.
     * @param opts - Options for the writer.
     */
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
    /** @internal */
    queueIndentationLevel(countOrText: string | number): this;
    queueIndentationLevel(countOrText: string | number) {
        this._queuedIndentation = this._getIndentationLevelFromArg(countOrText);
        return this;
    }

    /** @internal */
    withQueuedIndentationLevel(countOrText: string | number, action: () => void) {
        const previousState = this._getIndentationState();
        this.queueIndentationLevel(countOrText);
        try {
            action();
        } finally {
            this._setIndentationState(previousState);
        }
        return this;
    }

    /**
     * Writes the text within the provided action with hanging indentation.
     * @param action - Action to perform with hanging indentation.
     */
    withHangingIndentation(action: () => void) {
        return this.withQueuedIndentationLevel(this.getIndentationLevel() + 1, action);
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
    /** @internal */
    setIndentationLevel(countOrText: string | number): this;
    setIndentationLevel(countOrText: string | number) {
        this._currentIndentation = this._getIndentationLevelFromArg(countOrText);
        return this;
    }

    /**
     * Sets the indentation level within the provided action and restores the writer's indentation
     * state afterwards.
     * @remarks Restores the writer's state after the action.
     * @param indentationLevel - Indentation level to set.
     * @param action - Action to perform with the indentation.
     */
    withIndentationLevel(indentationLevel: number, action: () => void): this;
    /**
     * Sets the identation level with the provided indentation text within the provided action
     * and restores the writer's indentation state afterwards.
     * @param whitespaceText - Gets the indentation level from the indentation text.
     * @param action - Action to perform with the indentation.
     */
    withIndentationLevel(whitespaceText: string, action: () => void): this;
    withIndentationLevel(countOrText: string | number, action: () => void) {
        const previousState = this._getIndentationState();
        this.setIndentationLevel(countOrText);
        try {
            action();
        } finally {
            this._setIndentationState(previousState);
        }
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

    /** @internal */
    private _indentBlockInternal(block?: () => void) {
        if (this.getLastChar() != null)
            this.newLineIfLastNot();
        this._currentIndentation++;
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
        if (this.getLastChar() != null)
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
    indent(times = 1) {
        this._newLineIfNewLineOnNextWrite();
        return this.write(this._indentationText.repeat(times));
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
        this._writeIndentingNewLines(" ".repeat(times));
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
        this._writeIndentingNewLines("\t".repeat(times));
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
     * Writes text to exit a comment if in a comment.
     */
    closeComment() {
        const commentChar = this._currentCommentChar;

        switch (commentChar) {
            case CommentChar.Line:
                this.newLine();
                break;
            case CommentChar.Star:
                if (!this.isLastNewLine())
                    this.spaceIfLastNot();
                this.write("*/");
                break;
            default:
                const assertUndefined: undefined = commentChar;
                break;
        }

        return this;
    }

    /**
     * Gets the length of the string in the writer.
     */
    getLength() {
        return this._length;
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
        const lastChar = this.getLastChar();
        return lastChar === "\n" || lastChar === "\r";
    }

    /**
     * Gets if the last chars written were for a blank line.
     */
    isLastBlankLine() {
        let foundCount = 0;

        // todo: consider extracting out iterating over past characters, but don't use
        // an iterator because it will be slow.
        for (let i = this._texts.length - 1; i >= 0; i--) {
            const currentText = this._texts[i];
            for (let j = currentText.length - 1; j >= 0; j--) {
                const currentChar = currentText[j];
                if (currentChar === "\n") {
                    foundCount++;
                    if (foundCount === 2)
                        return true;
                }
                else if (currentChar !== "\r")
                    return false;
            }
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
        return this._getLastCharWithOffset(0);
    }

    /** @internal */
    private _getLastCharWithOffset(offset: number) {
        for (let i = this._texts.length - 1; i >= 0; i--) {
            const currentText = this._texts[i];
            for (let j = currentText.length - 1; j >= 0; j--) {
                if (offset === 0)
                    return currentText[j];
                offset--;
            }
        }
        return undefined;
    }

    /**
     * Gets the writer's text.
     */
    toString() {
        if (this._texts.length > 1) {
            const text = this._texts.join("");
            this._texts.length = 0;
            this._texts.push(text);
        }

        return this._texts[0] || "";
    }

    /** @internal */
    private static readonly _newLineRegEx = /\r?\n/;
    /** @internal */
    private _writeIndentingNewLines(text: string) {
        text = text || "";
        if (text.length === 0) {
            writeIndividual(this, "");
            return;
        }

        const items = text.split(CodeBlockWriter._newLineRegEx);
        items.forEach((s, i) => {
            if (i > 0)
                this._baseWriteNewline();

            if (s.length === 0)
                return;

            writeIndividual(this, s);
        });

        function writeIndividual(writer: CodeBlockWriter, s: string) {
            if (!writer.isInString()) {
                const isAtStartOfLine = writer.isLastNewLine() || writer.getLastChar() == null;
                if (isAtStartOfLine)
                    writer._writeIndentation();
            }

            writer._updateInternalState(s);
            writer._internalWrite(s);
        }
    }

    /** @internal */
    private _baseWriteNewline() {
        if (this._currentCommentChar === CommentChar.Line)
            this._currentCommentChar = undefined;
        this._internalWrite(this._newLine);
        this._isOnFirstLineOfBlock = false;
        this.dequeueQueuedIndentation();
    }

    /** @internal */
    private dequeueQueuedIndentation() {
        if (this._queuedIndentation == null)
            return;

        this._currentIndentation = this._queuedIndentation;
        this._queuedIndentation = undefined;
    }

    /** @internal */
    private static readonly _isCharToHandle = new Set<string>(["/", "\\", "\n", "\r", "*", "\"", "'", "`", "{", "}"]);
    /** @internal */
    private _updateInternalState(str: string) {
        for (let i = 0; i < str.length; i++) {
            const currentChar = str[i];

            // This is a performance optimization to short circuit all the checks below. If the current char
            // is not in this set then it won't change any internal state so no need to continue and do
            // so many other checks (this made it 3x faster in one scenario I tested).
            if (!CodeBlockWriter._isCharToHandle.has(currentChar))
                continue;

            const pastChar = i === 0 ? this.getLastChar() : str[i - 1];
            const pastPastChar = i === 0 ? this._getLastCharWithOffset(1) : i === 1 ? this.getLastChar() : str[i - 2];

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
            if (pastChar !== "\\" && (currentChar === "\"" || currentChar === "'" || currentChar === "`")) {
                if (lastStringCharOnStack === currentChar)
                    this._stringCharStack.pop();
                else if (lastStringCharOnStack === "{" || lastStringCharOnStack === undefined)
                    this._stringCharStack.push(currentChar);
            }
            else if (pastPastChar !== "\\" && pastChar === "$" && currentChar === "{" && lastStringCharOnStack === "`")
                this._stringCharStack.push(currentChar);
            else if (currentChar === "}" && lastStringCharOnStack === "{")
                this._stringCharStack.pop();
        }
    }

    /** @internal */
    private _writeIndentation() {
        const flooredIndentation = Math.floor(this._currentIndentation);
        this._internalWrite(this._indentationText.repeat(flooredIndentation));

        const overflow = this._currentIndentation - flooredIndentation;
        if (this._useTabs) {
            if (overflow > 0.5)
                this._internalWrite(this._indentationText);
        }
        else {
            const portion = Math.round(this._indentationText.length * overflow);

            // build up the string first, then append it for performance reasons
            let text = "";
            for (let i = 0; i < portion; i++)
                text += this._indentationText[i];
            this._internalWrite(text);
        }
    }

    /** @internal */
    private _newLineIfNewLineOnNextWrite() {
        if (!this._newLineOnNextWrite)
            return;
        this._newLineOnNextWrite = false;
        this.newLine();
    }

    /** @internal */
    private _internalWrite(text: string) {
        if (text.length === 0)
            return;

        this._texts.push(text);
        this._length += text.length;
    }

    /** @internal */
    private static readonly _spacesOrTabsRegEx = /^[ \t]*$/;
    /** @internal */
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

    /** @internal */
    private _setIndentationState(state: IndentationLevelState) {
        this._currentIndentation = state.current;
        this._queuedIndentation = state.queued;
    }

    /** @internal */
    private _getIndentationState(): IndentationLevelState {
        return {
            current: this._currentIndentation,
            queued: this._queuedIndentation
        };
    }
}

interface IndentationLevelState {
    current: number;
    queued: number | undefined;
}

function isRegExStart(currentChar: string, pastChar: string | undefined, pastPastChar: string | undefined) {
    return pastChar === "/"
        && currentChar !== "/"
        && currentChar !== "*"
        && pastPastChar !== "*"
        && pastPastChar !== "/";
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
        if (char === " ")
            spacesCount++;
        else if (char === "\t")
            tabsCount++;
    }

    return { spacesCount, tabsCount };
}
