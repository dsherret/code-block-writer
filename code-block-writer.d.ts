export default class CodeBlockWriter {
    constructor(opts?: { newLine: string });
    block(block: () => void): CodeBlockWriter;
    getLength(): number;
    writeLine(str: string): CodeBlockWriter;
    newLineIfLastCharNotNewLine(): CodeBlockWriter;
    newLine(): CodeBlockWriter;
    spaceIfLastNotSpace(): CodeBlockWriter;
    write(str: string): CodeBlockWriter;
    toString(): string;
}
