import * as assert from 'assert';


import { TextLine } from "vscode";
import LineIdentifier from "../../list-parser/line-identifier";
import { LineInfo } from '../../list-parser/line-info';
import { LineType } from "../../list-parser/line-type";
import { beforeEach, describe, it, suite } from 'mocha';

class LineIdentifierTest {
    private line?: TextLine;
    private parsedLine?: LineInfo;

    public static get test() { return new LineIdentifierTest(); }
    private constructor() { }

    private givenLine(line: string) {
        this.line = <TextLine>{ text: line };
    }

    private identifyLine() {
        if (!this.line) {
            throw new Error('Please use givenLines before parseLines');
        }
        this.parsedLine = LineIdentifier.identifyLine(this.line);
    }

    // --- Success tests: OK ---
    private thenAssertLineTypeOk(type: LineType, message?: string) {
        if (!this.parsedLine) {
            throw new Error('Please use identifyLine before thenAssertLineTypeOk');
        }

        message = message || `Line type should be ${LineType[type]}, but was ${LineType[this.parsedLine.type]}`;
        assert.strictEqual(this.parsedLine.type, type, message);
    }

    private lineTypeOK(lineText: string, lineType: LineType) {
        test(lineText, () => {
            this.givenLine(lineText);
            this.identifyLine();
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
        this.lineTypeOK('[NOT-ANIME]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME] ', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME] //With comment and space', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME]//With comment and no space', LineType.Tag);
        this.lineTypeOK(' [ NOT-ANIME ] // With spaces all the way', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME(param=3)]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME(param= 3)]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME(param = 3)]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME(param =3)]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME(from = 30, to = 100)]', LineType.Tag);
        this.lineTypeOK('[NOT-ANIME(reason = "Filler", episodes = 40-45 )]', LineType.Tag);
    }

    // --- Fail tests (it is expected to fail) ---
    private thenAssertLineTypeFail(type: LineType, message?: string) {
        if (!this.parsedLine) {
            throw new Error('Please use identifyLine before thenAssertLineTypeOk');
        }

        message = message || `Line type should not be ${type}`;
        assert.notStrictEqual(this.parsedLine.type, type, message);
    }

    private lineTypeFail(lineText: string, lineType: LineType, message?: string) {
        test(lineText, () => {
            this.givenLine(lineText);
            this.identifyLine();
            this.thenAssertLineTypeFail(lineType, message);
        });
    }

    public showTitleTypeFail() {
        this.lineTypeFail("Missing colon", LineType.ShowTitle);
        this.lineTypeFail("Tags should not be here: [NOT-ANIME]", LineType.ShowTitle);
        this.lineTypeFail("[NOT-ANIME] Tags should not be here:", LineType.ShowTitle);
        this.lineTypeFail("Tags should [NOT-ANIME] not be here:", LineType.ShowTitle);
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
        this.lineTypeFail("20:00 - 20:01", LineType.WatchEntry, "Should fail because it is missing the episode number");
        this.lineTypeFail('19:14 19:44 12', LineType.WatchEntry, "Should fail because it is missing the dash");
        this.lineTypeFail('19:14 @ 19:44 12', LineType.WatchEntry, "Should fail because it has @ instead of dash");
        this.lineTypeFail('1914 - 1944 12', LineType.WatchEntry, "Should fail because it is missing the colons");
        this.lineTypeFail('19:14 - 1944 12', LineType.WatchEntry, "Should fail because it is missing the colons");
        this.lineTypeFail('1914 - 19:44 12', LineType.WatchEntry, "Should fail because it is missing the colons");
        this.lineTypeFail('1914 - 19:44 -1', LineType.WatchEntry, "Should fail because the episode number is negative");
        this.lineTypeFail('1914 - 19:44 AAA', LineType.WatchEntry, "Should fail because the episode number is not a number");
        this.lineTypeFail("20:00 - ", LineType.WatchEntry, "Should fail because it is missing the end time");
        this.lineTypeFail("Totally wrong", LineType.WatchEntry);
        this.lineTypeFail("//Just a comment", LineType.WatchEntry);
        this.lineTypeFail("20/06/2000", LineType.WatchEntry);
    }

    public tagTypeFail() {
        this.lineTypeFail('(NOT-ANIME)', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME]]', LineType.Tag);
        this.lineTypeFail('[[NOT-ANIME]]', LineType.Tag);
        this.lineTypeFail('[[NOT-ANIME]', LineType.Tag);
        this.lineTypeFail('NOT-ANIME]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME', LineType.Tag);
        this.lineTypeFail('[]', LineType.Tag);
        this.lineTypeFail('[]NOT-ANIME', LineType.Tag);
        this.lineTypeFail('NOT-ANIME[]', LineType.Tag);
        this.lineTypeFail('[1234]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME=nono]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME=0]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME(noequal)]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME(12)]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME(=)]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME(=34)]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME(a, b)]', LineType.Tag);
        this.lineTypeFail('[NOT-ANIME(12, 43)]', LineType.Tag);
        this.lineTypeFail('[UNKNOWN-TAG]', LineType.Tag); //TODO: This should not fail, since identifier shouldn't know about registered tags
    }
}

suite("Line Identifier Test Suite", () => {
    const suites = LineIdentifierTest.test;
    suite("ShowTitles", () => {
        suite('should recognize correct show titles', () => suites.showTitleTypeOk());
        suite("shouldn't read malformed show titles ", () => suites.showTitleTypeFail());
    });

    suite("Dates", () => {
        suite('should recognize correct dates', () => suites.dateTypeOK());
        suite("shouldn't read malformed dates ", () => suites.dateTypeFail());
    });

    suite("WatchEntries", () => {
        suite('should recognize correct watch entries', () => suites.watchEntryTypeOK());
        suite("shouldn't read malformed watch entries ", () => suites.watchEntryTypeFail());

    });

    suite("Tags", () => {
        suite('should recognize correct tags', () => suites.tagTypeOK());
        suite("shouldn't read malformed tags ", () => suites.tagTypeFail());
    });
});