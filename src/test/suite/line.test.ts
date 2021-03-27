import * as assert from 'assert';


import { TextLine } from "vscode";
import LineInfoParser, { LineInfo } from "../../list-parser/line-info-parser";
import { LineType } from "../../list-parser/line-type";

class LineInfoParseTest {
    private lineToParse?: TextLine;
    private parsedLine?: LineInfo;

    public static get test() { return new LineInfoParseTest(); }
    private constructor() { }

    private givenLines(lineStr: string) {
        this.lineToParse = <TextLine>{ text: lineStr };
    }

    private parseLines() {
        if (!this.lineToParse) throw new Error('Please use givenLines before parseLines');
        this.parsedLine = LineInfoParser.parseLineInfo(this.lineToParse);
    }

    // --- Success tests: OK ---
    private thenAssertLineTypeOk(type: LineType, message?: string) {
        assert.strictEqual(this.parsedLine?.type, type, message);
    }

    private lineTypeOK(lineText: string, lineType: LineType) {
        test(lineText, () => {
            this.givenLines(lineText);
            this.parseLines();
            this.thenAssertLineTypeOk(lineType);
        });
    }

    public showTitleTypeOk() {
        this.lineTypeOK('Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season Part 2:', LineType.ShowTitle);
        this.lineTypeOK('Jujustu Kaisen:', LineType.ShowTitle);
        this.lineTypeOK('Tensei shitara Slime Datta Ken 2nd Season:', LineType.ShowTitle);
        this.lineTypeOK('3-gatsu no lion:', LineType.ShowTitle);
        this.lineTypeOK('Comments are allowed: //See?', LineType.ShowTitle);
    }

    public dateTypeOK() {
        this.lineTypeOK('20/06/2000', LineType.Date);
        this.lineTypeOK('02/02/0001', LineType.Date);
        this.lineTypeOK('30/06/2099', LineType.Date);
        this.lineTypeOK('11/09/2001 //Unforgettable date (commenting is allowed on dates)', LineType.Date);
    }

    public watchEntryTypeOK() {
        this.lineTypeOK('20:11 - 21:06 07 {Pai, Mãe}', LineType.WatchEntry);
        this.lineTypeOK('19:14 - 19:44 12', LineType.WatchEntry);
        this.lineTypeOK('10:50 - 10:54 01 //Overview', LineType.WatchEntry);
        this.lineTypeOK('04:30 - 04:52 03 {Vitinho, Gabs, Mayara}', LineType.WatchEntry);
        this.lineTypeOK('01:10 - 02:45 01 {Mãe}', LineType.WatchEntry);
        this.lineTypeOK('22:46 - 22:54 -- //@10:00', LineType.WatchEntry);
    }

    public tagTypeOK() {
        this.lineTypeOK('[Teste]', LineType.Tag);
        this.lineTypeOK('[Teste(param=3)]', LineType.Tag);
        this.lineTypeOK('[Teste(param= 3)]', LineType.Tag);
        this.lineTypeOK('[Teste(param = 3)]', LineType.Tag);
        this.lineTypeOK('[Teste(param =3)]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME]', LineType.Tag);
        this.lineTypeOK('[SKIP-LINES(from = 30, to = 100)]', LineType.Tag);
        this.lineTypeOK('[SKIP-EPISODES(reason = "Filler", episodes = 40-45 )]', LineType.Tag);
    }

    // --- Fail tests (it is expected to fail) ---
    private thenAssertLineTypeFail(type: LineType, message?: string) {
        assert.notStrictEqual(this.parsedLine?.type, type, message);
    }

    private lineTypeFail(lineText: string, lineType: LineType) {
        test(lineText, () => {
            this.givenLines(lineText);
            this.parseLines();
            this.thenAssertLineTypeFail(lineType);
        });
    }

    public showTitleTypeFail() {
        this.lineTypeFail("Missing semicolon", LineType.ShowTitle);
        this.lineTypeFail("Tags should not be here: [TAG]", LineType.ShowTitle);
        this.lineTypeFail("[TAG] Tags should not be here:", LineType.ShowTitle);
        this.lineTypeFail("Tags should [TAG] not be here:", LineType.ShowTitle);
        this.lineTypeFail("Friends should not be here: {Friend}", LineType.ShowTitle);
        this.lineTypeFail("{Friend} Friends should not be here:", LineType.ShowTitle);
        this.lineTypeFail("Friends should not {Friend} be here:", LineType.ShowTitle);
        this.lineTypeFail("16/11/2008", LineType.ShowTitle);
        this.lineTypeFail("[This is not a anime name:]", LineType.ShowTitle);
        this.lineTypeFail("{This is not a anime name:}", LineType.ShowTitle);
        this.lineTypeFail("(This is not a anime name:)", LineType.ShowTitle);
    }

    public dateTypeFail() {
        this.lineTypeFail("60/60/20", LineType.Date);
        this.lineTypeFail("60/60/20", LineType.Date);
    }

    public watchEntryTypeFail() {

    }

    public tagTypeFail() {
        this.lineTypeFail('(TestTag)', LineType.Tag);
        this.lineTypeFail('[WRONG-BRACKETS]]', LineType.Tag);
        this.lineTypeFail('[[WRONG-BRACKETS2]]', LineType.Tag);
        this.lineTypeFail('[[WRONG-BRACKETS3]', LineType.Tag);
        this.lineTypeFail('WRONG-BRACKETS4]', LineType.Tag);
        this.lineTypeFail('[WRONG-BRACKETS5', LineType.Tag);
        this.lineTypeFail('[]', LineType.Tag);
        this.lineTypeFail('[]Out', LineType.Tag);
        this.lineTypeFail('Out2[]', LineType.Tag);
        this.lineTypeFail('[123]', LineType.Tag);
        this.lineTypeFail('[OldStyle=nono]', LineType.Tag);
        this.lineTypeFail('[OldStyle=0]', LineType.Tag);
        this.lineTypeFail('[Tag(noequal)]', LineType.Tag);
        this.lineTypeFail('[Tag(12)]', LineType.Tag);
        this.lineTypeFail('[Tag(=)]', LineType.Tag);
        this.lineTypeFail('[Tag(=34)]', LineType.Tag);
        this.lineTypeFail('[Tag(a, b)]', LineType.Tag);
        this.lineTypeFail('[Tag(12, 43)]', LineType.Tag);
    }
}

suite("LineInfoParser Test Suite", () => {
    suite("ShowTitles", () => {
        //Expected to Success
        suite('should recognize correct show titles', () => LineInfoParseTest.test.showTitleTypeOk());
        suite('should recognize correct dates', () => LineInfoParseTest.test.dateTypeOK());
        suite('should recognize correct watch entries', () => LineInfoParseTest.test.watchEntryTypeOK());
        suite('should recognize correct tags', () => LineInfoParseTest.test.tagTypeOK());

        //Expected to Fail
        suite("shouldn't read malformed show titles ", () => LineInfoParseTest.test.showTitleTypeFail());
        suite("shouldn't read malformed dates ", () => LineInfoParseTest.test.dateTypeFail());
        suite("shouldn't read malformed watch entries ", () => LineInfoParseTest.test.watchEntryTypeFail());
        suite("shouldn't read malformed tags ", () => LineInfoParseTest.test.tagTypeFail());

    })
});