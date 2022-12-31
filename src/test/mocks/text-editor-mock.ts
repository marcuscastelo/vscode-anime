import { DecorationOptions, EndOfLine, Position, Range, Selection, SnippetString, TextDocument, TextEditor, TextEditorDecorationType, TextEditorEdit, TextEditorOptions, TextEditorRevealType, TextLine, Uri, ViewColumn } from "vscode";
import { TextDocumentMock } from "./text-document-mock";

export class TextEditorMock implements TextEditor {
    document: TextDocument;
    selection: Selection;
    selections: Selection[];
    visibleRanges: Range[];
    options!: TextEditorOptions;
    viewColumn: ViewColumn | undefined;

    constructor(overrides?: Partial<TextEditorMock>) {
        this.document = new TextDocumentMock();
        this.selection = new Selection(new Position(0, 0), new Position(0, 1));
        this.selections = [this.selection];
        this.visibleRanges = [new Range(new Position(0, 0), new Position(0, 1))];
        //TODO: TextEditorOptionsMock

        Object.assign(this, overrides);
    }

    edit(callback: (editBuilder: TextEditorEdit) => void, options?: { undoStopBefore: boolean; undoStopAfter: boolean; } | undefined): Thenable<boolean> {
        throw new Error("Method not implemented.");
    }
    insertSnippet(snippet: SnippetString, location?: Range | Position | readonly Position[] | readonly Range[] | undefined, options?: { undoStopBefore: boolean; undoStopAfter: boolean; } | undefined): Thenable<boolean> {
        throw new Error("Method not implemented.");
    }
    setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: readonly Range[] | readonly DecorationOptions[]): void {
        throw new Error("Method not implemented.");
    }
    revealRange(range: Range, revealType?: TextEditorRevealType | undefined): void {
        throw new Error("Method not implemented.");
    }
    show(column?: ViewColumn | undefined): void {
        throw new Error("Method not implemented.");
    }
    hide(): void {
        throw new Error("Method not implemented.");
    }
}