import { DecorationOptions, EndOfLine, Position, Range, Selection, SnippetString, TextDocument, TextEditor, TextEditorDecorationType, TextEditorEdit, TextEditorOptions, TextEditorRevealType, TextLine, Uri, ViewColumn } from "vscode";

export class TextEditorEditMock implements TextEditorEdit {
    insert(location: Position, value: string): void {
        throw new Error("Method not implemented.");
    }
    delete(location: Range): void {
        throw new Error("Method not implemented.");
    }
    replace(location: Range, value: string): void {
        throw new Error("Method not implemented.");
    }
    setEndOfLine(eol: EndOfLine): void {
        throw new Error("Method not implemented.");
    }
}