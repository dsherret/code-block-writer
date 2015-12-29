declare module "code-block-writer" {
    class CodeBlockWriter {
        private _currentIndentation;
        private _text;
        private _numberSpaces;
        private _lastWasNewLine;
        constructor(opts?: { newLine: string });
        block(block: () => void): CodeBlockWriter;
        writeLine(str: string): CodeBlockWriter;
        newLineIfLastNotNewLine(): CodeBlockWriter;
        newLine(): CodeBlockWriter;
        write(str: string): CodeBlockWriter;
        toString(): string;
        private _getCurrentIndentationNumberSpaces();
    }
    export default CodeBlockWriter;
}
