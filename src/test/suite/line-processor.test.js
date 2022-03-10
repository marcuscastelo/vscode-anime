"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const showStorage_1 = require("../../cache/anime/showStorage");
const line_processor_1 = require("../../list-parser/line-processor");
const vscode_1 = require("vscode");
class DocumentMaker {
    constructor() {
        this.lines = [];
        this.currentLine = 0;
    }
    makeDocument() {
        return {
            lineAt: (index) => this.lines[index],
            lineCount: this.lines.length,
        };
    }
    addLine(text) {
        let line = {
            range: new vscode_1.Range(new vscode_1.Position(this.currentLine, 0), new vscode_1.Position(this.currentLine, text.length - 1)),
            rangeIncludingLineBreak: new vscode_1.Range(new vscode_1.Position(this.currentLine, 0), new vscode_1.Position(this.currentLine, text.length)),
            lineNumber: this.currentLine++,
            text,
            isEmptyOrWhitespace: text === '',
            firstNonWhitespaceCharacterIndex: text.length - text.trimLeft().length,
        };
        this.lines.push(line);
    }
}
class LineProcessorTest {
    constructor() {
        this.storage = new showStorage_1.default();
        let dummyDiagnosticController = {};
        this.processor = new line_processor_1.default(this.storage, dummyDiagnosticController);
    }
    static get test() { return new LineProcessorTest(); }
    simpleTest() {
        const date = '27/03/2021';
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
            let processorContext = this.processor.lineContext;
            //TODO: check if context is right after reading all lines
            test('Stored show correctly in storage', () => assert.strictEqual(show?.info.title, showTitle));
            // test('Correct date', () => assert.strictEqual(processorContext.currDate, date));
        });
    }
}
suite("LineProcessor Test Suite", () => {
    LineProcessorTest.test.simpleTest();
});
//# sourceMappingURL=line-processor.test.js.map