import * as sinon from "sinon";
import { suite, it, afterEach, describe, beforeEach } from "mocha";
import { insertNextEpisode } from "../../../commands/insert-next-episode";
import { DocumentMaker } from "../../helpers/text-document";
import { TextEditorMock } from "../../mocks/text-editor-mock";
import { TextEditorEditMock } from "../../mocks/text-editor-edit-mock";
import { Selection, TextDocument, TextEditorEdit } from "vscode";
import ShowStorage from "../../../cache/shows/show-storage";
import { Show } from "../../../cache/shows/cached-shows";
import assert = require("assert");
import { Option } from "rustic";


class ShowHelper {
    public static readonly DEFAULT_SHOW_TITLE = "Anime 1";

    static withLastEpisode(lastEpisode: number | null): Show {
        return new Show(1, {
            title: ShowHelper.DEFAULT_SHOW_TITLE,
            watchEntries: lastEpisode === null ? [] : [{
                data: {
                    episode: lastEpisode,
                    showTitle: ShowHelper.DEFAULT_SHOW_TITLE,
                    startTime: "20:00",
                    endTime: "21:00",
                    partial: false,
                    company: [],
                },
                lineNumber: 2
            }]
        });
    }
}


describe("Insert Next Episode", () => {

    type TestParams = {
        contextLines?: string[];
        extraLines: string[];
        selection?: Selection;
        lastEpisode: number | null;
        expectEdit: boolean;
    };

    type TestVars = {
        document: TextDocument;
        textEditor: TextEditorMock;
        edit: TextEditorEditMock;
        textEditorMock: sinon.SinonMock;
        editMock: sinon.SinonMock;
    };

    function initTest(params: TestParams) {
        const contextLines = params.contextLines ?? [
            "20/01/2022",
            "Anime 1:",
        ];

        const documentLines = [
            ...contextLines,
            ...params.extraLines,
        ];

        const document = DocumentMaker.makeFromLines(documentLines);
        const selection = params.selection ?? new Selection(documentLines.length - 1, 0, documentLines.length - 1, documentLines[documentLines.length - 1].length);

        const textEditor = new TextEditorMock({
            document,
            selection,
            selections: [selection]
        });

        const edit = new TextEditorEditMock();

        const textEditorMock = sinon.mock(textEditor);
        const editMock = sinon.mock(edit);

        const showMock = ShowHelper.withLastEpisode(params.lastEpisode);

        sinon.stub(ShowStorage.prototype, "searchShow").returns(showMock);

        if (params.expectEdit) {
            textEditorMock.expects("edit").once().withArgs(sinon.match.func).callsFake((callback: (edit: TextEditorEdit) => void) => {
                callback(edit);
            });
        } else {
            textEditorMock.expects("edit").never();
        }

        testVars = {
            document,
            textEditor,
            edit,
            textEditorMock,
            editMock,
        };
    }

    let testVars: Option<TestVars> = undefined;

    afterEach(() => {
        assert.notStrictEqual(testVars, undefined);

        const { textEditorMock } = testVars!;

        textEditorMock.verify();

        sinon.restore();
        testVars = undefined;
    });

    describe("When there is the last episode", () => {
        it("Should insert the next episode", () => {
            initTest({
                extraLines: [
                    "20:00 - 20:24 03",
                    "" // Empty line for the cursor
                ],
                lastEpisode: 3,
                expectEdit: true,
            });

            const { editMock, textEditor, edit } = testVars!;

            editMock.expects("insert").once().withArgs(textEditor.selection.start, "04");
            insertNextEpisode(textEditor, edit);
        });
    });

    describe("When there is no last episode", () => {
        it("Should insert the first episode", () => {
            initTest({
                extraLines: [
                    "" // Empty line for the cursor
                ],
                lastEpisode: null,
                expectEdit: true,
            });

            const { editMock, textEditor, edit } = testVars!;

            editMock.expects("insert").once().withArgs(textEditor.selection.start, "01");
            insertNextEpisode(textEditor, edit);
        });
    });

    describe("When the show is not found", () => {
        it("Should show an error message", () => {
            initTest({
                contextLines: [], // No context lines
                extraLines: [
                    "" // Empty line for the cursor
                ],
                lastEpisode: 0,
                expectEdit: false,
            });

            const { editMock, textEditor, edit } = testVars!;
            editMock.expects("insert").once().withArgs(textEditor.selection.start, "01");
            insertNextEpisode(textEditor, edit);
        });
    });

    describe("When the last entry is a partial", () => {
        it("Should insert the next episode based on the last non-partial", () => {
            initTest({
                extraLines: [
                    "20:00 - 20:24 03",
                    "20:25 - 20:44 --",
                    "" // Empty line for the cursor
                ],
                lastEpisode: 3,
                expectEdit: true,
            });

            const { editMock, textEditor, edit } = testVars!;
            editMock.expects("insert").once().withArgs(textEditor.selection.start, "04");
            insertNextEpisode(textEditor, edit);
        });
    });

    describe("When the last entry is a partial and the show has no last episode", () => {
        it("Should show an error message", () => {
            initTest({
                extraLines: [
                    "20:00 - 20:24 --",
                    "" // Empty line for the cursor
                ],
                lastEpisode: 0,
                expectEdit: true,
            });

            const { editMock, textEditor, edit } = testVars!;
            editMock.expects("insert").once().withArgs(textEditor.selection.start, "01");
            insertNextEpisode(textEditor, edit);
        });
    });
});