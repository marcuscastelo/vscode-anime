import { Position, Range, TextDocument, TextLine } from 'vscode';

export class DocumentMaker {
    private lines: TextLine[] = [];
    private currentLine = 0;

    public makeDocument(): TextDocument {
        return <TextDocument & {lines: TextLine[]}>{
            lineAt: (index: number) => this.lines[index],
            lineCount: this.lines.length,
            lines: this.lines,
        };
    }

    public addLine(text: string) {
        let line = <TextLine>{
            range: new Range(new Position(this.currentLine, 0), new Position(this.currentLine, Math.max(0, text.length-1))),
            rangeIncludingLineBreak: new Range(new Position(this.currentLine, 0), new Position(this.currentLine, text.length)),
            lineNumber: this.currentLine++,
            text,
            isEmptyOrWhitespace: text === '',
            firstNonWhitespaceCharacterIndex: text.length - text.trimLeft().length,
        };

        this.lines.push(line);
    }

    public static makeFromLines(lines: string[]) {
        const maker = new DocumentMaker();
        lines.forEach(line => maker.addLine(line));
        return maker.makeDocument();
    }
}