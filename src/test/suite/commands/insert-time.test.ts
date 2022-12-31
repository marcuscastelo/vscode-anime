import * as sinon from "sinon";
import { suite, it, afterEach, describe, beforeEach } from "mocha";
import { TextEditorMock } from "../../mocks/text-editor-mock";
import { TextEditorEditMock } from "../../mocks/text-editor-edit-mock";
import { Selection, TextLine } from "vscode";
import { insertTime } from "../../../commands/insert-time";

import * as checkDateTime from "../../../analysis/check-date-time";
import { Ok } from "rustic";

suite("Insert Time", () => {
    describe("When inserting is happy path (current date is today)", () => {
        let textEditor: TextEditorMock;
        let textEditorEdit: TextEditorEditMock;
        
        beforeEach(() => {
            textEditor = new TextEditorMock();
            textEditorEdit = new TextEditorEditMock();
            textEditor.selections = [new Selection(0,0,0,1)];
            textEditor.selection = textEditor.selections[0];

            sinon.stub(Date.prototype, "toLocaleTimeString").returns("12:34");
            sinon.stub(checkDateTime, 'checkLineInDocumentIsToday').returns(Ok(true));
        });

        afterEach(() => {
            sinon.restore();
        });

        it("Should call TextEditor.insert with time and dash on empty line", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "",
            });
            
            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().withArgs(sinon.match.func).callsFake((callback) => callback(textEditorEdit));

            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").once().withArgs(textEditor.selection.active, "12:34 - ");

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should call TextEditor.insert with time without dash on prefilled line", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "12:00 - ",
            });
            
            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().withArgs(sinon.match.func).callsFake((callback) => callback(textEditorEdit));

            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").once().withArgs(textEditor.selection.active, "12:34 ");

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with ShowTitle lines", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "Show Title: The Second:",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Date lines", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20/06/2000",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Tag lines", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "[TAG]",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing after end time", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing after comments 1", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 //",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing after comments 2", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 //Comment",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Friends 0", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 {",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Friends 1", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 {Friend1,",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Friends 1.1", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 {Friend1}",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Friends 2", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 {Friend1, Friend2,",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });

        it("Should do nothing with Friends 2.2", () => {
            const textDocumentMock = sinon.mock(textEditor.document);
            textDocumentMock.expects("lineAt").once().withArgs(0).returns(<TextLine>{
                lineNumber: 0,
                text: "20:00 - 20:30 {Friend1, Friend2}",
            });

            const textEditorMock = sinon.mock(textEditor);
            textEditorMock.expects("edit").once().never();
            
            const textEditorEditMock = sinon.mock(textEditorEdit);
            textEditorEditMock.expects("insert").never();

            insertTime(textEditor, textEditorEdit);

            textEditorMock.verify();
            textEditorEditMock.verify();
            textDocumentMock.verify();
        });
    });
});