import * as assert from 'assert';
import ShowStorage from '../../cache/anime/anime-data-storage';
import MADiagnosticController from '../../lang/maDiagnosticCollection';
import LineProcessor from '../../list-parser/line-processor';
import ListContext from '../../list-parser/anime-context';
import { Position, Range, TextDocument, TextLine } from 'vscode';
import DocumentReader from '../../utils/document-reader';

class DocumentMaker {
    private lines: TextLine[] = [];
    private currentLine = 0;

    public makeDocument() {
        return <TextDocument>{
            lineAt: (index: number) => this.lines[index],
            lineCount: this.lines.length,
        };
    }

    public addLine(text: string) {
        let line = <TextLine>{
            range: new Range(new Position(this.currentLine, 0), new Position(this.currentLine, text.length-1)),
            rangeIncludingLineBreak: new Range(new Position(this.currentLine, 0), new Position(this.currentLine, text.length)),
            lineNumber: this.currentLine++,
            text,
            isEmptyOrWhitespace: text === '',
            firstNonWhitespaceCharacterIndex: text.length - text.trimLeft().length,
        };

        this.lines.push(line);
    }
}

class LineProcessorTest {
    private processor: LineProcessor;
    private storage: ShowStorage;

    public static get test() { return new LineProcessorTest(); }
    private constructor() {
        this.storage = new ShowStorage();
        let dummyDiagnosticController = {} as MADiagnosticController;

        this.processor = new LineProcessor(this.storage, dummyDiagnosticController);
    }

    public simpleTest() {
        const date = '27/03/2021'
        const showTitle = 'Anime1';

        let documentMaker = new DocumentMaker();
        documentMaker.addLine(date);
        documentMaker.addLine(`${showTitle}:`);
        documentMaker.addLine('21:32 - 21:33 01');
        documentMaker.addLine('22:32 - 22:33 02 {Fulano}');
        let document = documentMaker.makeDocument();

        this.processor.processAllLines(document);

        console.log('finished!');

        suite("Date + Anime + 2 Episodes + Friends", () => {
            
            let show = this.storage.getShow(showTitle);
            let processorContext = ((this.processor as any).lineContext as ListContext);

            //TODO: check if context is right after reading all lines
            test('Stored show correctly in storage', () => assert.strictEqual(show?.info.title, showTitle));
            // test('Correct date', () => assert.strictEqual(processorContext.currDate, date));
        })

    }
}

suite("LineProcessor Test Suite", () => {
    LineProcessorTest.test.simpleTest();
});