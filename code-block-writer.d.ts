export default class CodeBlockWriter {
    constructor(opts?: { newLine?: string; indentNumberOfSpaces?: number; useTabs?: boolean; });
    blankLine(): CodeBlockWriter;
    block(block: () => void): CodeBlockWriter;
    inlineBlock(block: () => void): CodeBlockWriter;
    conditionalNewLine(condition: boolean): CodeBlockWriter;
    conditionalWrite(condition: boolean, str: string): CodeBlockWriter;
    conditionalWriteLine(condition: boolean, str: string): CodeBlockWriter;
    getLength(): number;
    writeLine(str: string): CodeBlockWriter;
    newLineIfLastNotNewLine(): CodeBlockWriter;
    newLine(): CodeBlockWriter;
    spaceIfLastNotSpace(): CodeBlockWriter;
    indent(): CodeBlockWriter;
    write(str: string): CodeBlockWriter;
    toString(): string;
}
