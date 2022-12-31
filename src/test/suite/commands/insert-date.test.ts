import { insertDate } from "../../../commands/insert-date";
import * as sinon from "sinon";
import { suite, it, afterEach } from "mocha";
import { TextEditorMock } from "../../mocks/text-editor-mock";
import { TextEditorEditMock } from "../../mocks/text-editor-edit-mock";
import { Selection } from "vscode";

suite("Insert Date", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("Should call TextEditor.insert with date", () => {
        const textEditor = new TextEditorMock();
        const textEditorEdit = new TextEditorEditMock();
        textEditor.selections = [new Selection(0,0,0,1)];
        textEditor.selection = textEditor.selections[0];

        sinon.stub(Date.prototype, "toLocaleDateString").returns("2020-01-01");

        const textEditorEditMock = sinon.mock(textEditorEdit);

        textEditorEditMock.expects("insert").once().withArgs(textEditor.selection.active, "2020-01-01");

        insertDate(textEditor, textEditorEdit);

        textEditorEditMock.verify();
    });
});