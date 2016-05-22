export default class CodeBlockWriter {
    constructor(opts?: { newLine: string });
    block(block: () => void): CodeBlockWriter;
    inlineBlock(block: () => void): CodeBlockWriter;
    conditionalWrite(condition: boolean, str: string): CodeBlockWriter;
    getLength(): number;
    writeLine(str: string): CodeBlockWriter;
    newLineIfLastCharNotNewLine(): CodeBlockWriter;
    newLine(): CodeBlockWriter;
    spaceIfLastNotSpace(): CodeBlockWriter;
    write(str: string): CodeBlockWriter;
    toString(): string;
}
