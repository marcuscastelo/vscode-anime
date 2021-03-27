import * as assert from 'assert';

import { TextLine } from "vscode";
import LineInfoParser, { LineInfo } from "../../list-parser/line-info-parser";
import { LineType } from "../../list-parser/line-type";

class LineInfoParseTest {
    private lineToParse?: TextLine;
    private parsedLine?: LineInfo;

    public static get test() { return new LineInfoParseTest(); }
    private constructor() {}

    private givenLines(lineStr: string) {
        this.lineToParse = <TextLine> { text: lineStr };
    }

    private parseLines() {
        if (!this.lineToParse) throw new Error('Please use givenLines before parseLines');
        this.parsedLine = LineInfoParser.parseLineInfo(this.lineToParse);
    }

    private thenAssertLineTypeOk(type: LineType, message?: string) {
        assert.strictEqual(this.parsedLine?.type, type, message);
    }

    private testIndividualLineTypeOk(lineText: string, lineType: LineType) {
        this.givenLines(lineText);
        this.parseLines();
        this.thenAssertLineTypeOk(lineType);
    }

    public testShowTitleTypeOk() {
        this.testIndividualLineTypeOk('Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season Part 2:', LineType.ShowTitle);
        this.testIndividualLineTypeOk('Jujustu Kaisen:', LineType.ShowTitle);
        this.testIndividualLineTypeOk('Tensei shitara Slime Datta Ken 2nd Season:', LineType.ShowTitle);
    }

    public testDateTypeOk() {
        this.testIndividualLineTypeOk('20/06/2000', LineType.Date);
        this.testIndividualLineTypeOk('02/02/0001', LineType.Date);
        this.testIndividualLineTypeOk('30/06/2099', LineType.Date);
    }

    public testWatchEntryLineOk() {
        this.testIndividualLineTypeOk('20:11 - 21:06 07 {Pai, Mãe}', LineType.WatchEntry);
        this.testIndividualLineTypeOk('19:14 - 19:44 12', LineType.WatchEntry);
        this.testIndividualLineTypeOk('10:50 - 10:54 01 //Overview', LineType.WatchEntry);
        this.testIndividualLineTypeOk('04:30 - 04:52 03 {Vitinho, Gabs, Mayara}', LineType.WatchEntry);
        this.testIndividualLineTypeOk('01:10 - 02:45 01 {Mãe}', LineType.WatchEntry);
        this.testIndividualLineTypeOk('22:46 - 22:54 -- //@10:00', LineType.WatchEntry);
    }
}

suite("LineInfoParser Test Suite", () => {
    suite("ShowTitles", () => {
        test('should recognize basic anime titles', () => LineInfoParseTest.test.testShowTitleTypeOk());
        test('should recognize basic dates', () => LineInfoParseTest.test.testDateTypeOk());
        test('should recognize basic watch entries', () => LineInfoParseTest.test.testWatchEntryLineOk());
        test('should recognize basic tags', () => LineInfoParseTest.test.testDateTypeOk());

    })
});