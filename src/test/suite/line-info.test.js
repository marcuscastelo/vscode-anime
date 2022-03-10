"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const line_info_parser_1 = require("../../list-parser/line-info-parser");
const line_type_1 = require("../../list-parser/line-type");
class LineInfoParseTest {
    constructor() { }
    static get test() { return new LineInfoParseTest(); }
    givenLines(lineStr) {
        this.lineToParse = { text: lineStr };
    }
    parseLines() {
        if (!this.lineToParse)
            throw new Error('Please use givenLines before parseLines');
        this.parsedLine = line_info_parser_1.default.identifyLine(this.lineToParse);
    }
    // --- Success tests: OK ---
    thenAssertLineTypeOk(type, message) {
        assert.strictEqual(this.parsedLine?.type, type, message);
    }
    lineTypeOK(lineText, lineType) {
        test(lineText, () => {
            this.givenLines(lineText);
            this.parseLines();
            this.thenAssertLineTypeOk(lineType);
        });
    }
    showTitleTypeOk() {
        this.lineTypeOK('Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season Part 2:', line_type_1.LineType.ShowTitle);
        this.lineTypeOK('Jujustu Kaisen:', line_type_1.LineType.ShowTitle);
        this.lineTypeOK('Tensei shitara Slime Datta Ken 2nd Season:', line_type_1.LineType.ShowTitle);
        this.lineTypeOK('3-gatsu no lion:', line_type_1.LineType.ShowTitle);
        this.lineTypeOK('Comments are allowed: //See?', line_type_1.LineType.ShowTitle);
    }
    dateTypeOK() {
        this.lineTypeOK('20/06/2000', line_type_1.LineType.Date);
        this.lineTypeOK('02/02/0001', line_type_1.LineType.Date);
        this.lineTypeOK('30/06/2099', line_type_1.LineType.Date);
        this.lineTypeOK('11/09/2001 //Unforgettable date (commenting is allowed on dates)', line_type_1.LineType.Date);
    }
    watchEntryTypeOK() {
        this.lineTypeOK('20:11 - 21:06 07 {Pai, Mãe}', line_type_1.LineType.WatchEntry);
        this.lineTypeOK('19:14 - 19:44 12', line_type_1.LineType.WatchEntry);
        this.lineTypeOK('10:50 - 10:54 01 //Overview', line_type_1.LineType.WatchEntry);
        this.lineTypeOK('04:30 - 04:52 03 {Vitinho, Gabs, Mayara}', line_type_1.LineType.WatchEntry);
        this.lineTypeOK('01:10 - 02:45 01 {Mãe}', line_type_1.LineType.WatchEntry);
        this.lineTypeOK('22:46 - 22:54 -- //@10:00', line_type_1.LineType.WatchEntry);
    }
    tagTypeOK() {
        this.lineTypeOK('[Teste]', line_type_1.LineType.Tag);
        this.lineTypeOK('[Teste(param=3)]', line_type_1.LineType.Tag);
        this.lineTypeOK('[Teste(param= 3)]', line_type_1.LineType.Tag);
        this.lineTypeOK('[Teste(param = 3)]', line_type_1.LineType.Tag);
        this.lineTypeOK('[Teste(param =3)]', line_type_1.LineType.Tag);
        this.lineTypeOK('[NOT-ANIME]', line_type_1.LineType.Tag);
        this.lineTypeOK('[SKIP-LINES(from = 30, to = 100)]', line_type_1.LineType.Tag);
        this.lineTypeOK('[SKIP-EPISODES(reason = "Filler", episodes = 40-45 )]', line_type_1.LineType.Tag);
    }
    // --- Fail tests (it is expected to fail) ---
    thenAssertLineTypeFail(type, message) {
        assert.notStrictEqual(this.parsedLine?.type, type, message);
    }
    lineTypeFail(lineText, lineType) {
        test(lineText, () => {
            this.givenLines(lineText);
            this.parseLines();
            this.thenAssertLineTypeFail(lineType);
        });
    }
    showTitleTypeFail() {
        this.lineTypeFail("Missing semicolon", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("Tags should not be here: [TAG]", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("[TAG] Tags should not be here:", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("Tags should [TAG] not be here:", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("Friends should not be here: {Friend}", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("{Friend} Friends should not be here:", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("Friends should not {Friend} be here:", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("16/11/2008", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("[This is not a anime name:]", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("{This is not a anime name:}", line_type_1.LineType.ShowTitle);
        this.lineTypeFail("(This is not a anime name:)", line_type_1.LineType.ShowTitle);
    }
    dateTypeFail() {
        this.lineTypeFail("60/60/20", line_type_1.LineType.Date);
        this.lineTypeFail("60/60/20", line_type_1.LineType.Date);
    }
    watchEntryTypeFail() {
    }
    tagTypeFail() {
        this.lineTypeFail('(TestTag)', line_type_1.LineType.Tag);
        this.lineTypeFail('[WRONG-BRACKETS]]', line_type_1.LineType.Tag);
        this.lineTypeFail('[[WRONG-BRACKETS2]]', line_type_1.LineType.Tag);
        this.lineTypeFail('[[WRONG-BRACKETS3]', line_type_1.LineType.Tag);
        this.lineTypeFail('WRONG-BRACKETS4]', line_type_1.LineType.Tag);
        this.lineTypeFail('[WRONG-BRACKETS5', line_type_1.LineType.Tag);
        this.lineTypeFail('[]', line_type_1.LineType.Tag);
        this.lineTypeFail('[]Out', line_type_1.LineType.Tag);
        this.lineTypeFail('Out2[]', line_type_1.LineType.Tag);
        this.lineTypeFail('[123]', line_type_1.LineType.Tag);
        this.lineTypeFail('[OldStyle=nono]', line_type_1.LineType.Tag);
        this.lineTypeFail('[OldStyle=0]', line_type_1.LineType.Tag);
        this.lineTypeFail('[Tag(noequal)]', line_type_1.LineType.Tag);
        this.lineTypeFail('[Tag(12)]', line_type_1.LineType.Tag);
        this.lineTypeFail('[Tag(=)]', line_type_1.LineType.Tag);
        this.lineTypeFail('[Tag(=34)]', line_type_1.LineType.Tag);
        this.lineTypeFail('[Tag(a, b)]', line_type_1.LineType.Tag);
        this.lineTypeFail('[Tag(12, 43)]', line_type_1.LineType.Tag);
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
    });
});
//# sourceMappingURL=line-info.test.js.map