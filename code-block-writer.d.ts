declare class CodeBlockWriter {
    private _currentIndentation;
    private _text;
    private _numberSpaces;
    private _lastWasNewLine;
    constructor(opts?: { newLine: string });
    block(block: () => void): CodeBlockWriter;
    getLength(): number;
    writeLine(str: string): CodeBlockWriter;
    newLineIfLastCharNotNewLine(): CodeBlockWriter;
    newLine(): CodeBlockWriter;
    spaceIfLastNotSpace(): CodeBlockWriter;
    write(str: string): CodeBlockWriter;
    toString(): string;
    private _getCurrentIndentationNumberSpaces();
}

declare module "code-block-writer" {
    export = CodeBlockWriter;
}
