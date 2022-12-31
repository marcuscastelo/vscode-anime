import { DecorationOptions, EndOfLine, Position, Range, Selection, SnippetString, TextDocument, TextEditor, TextEditorDecorationType, TextEditorEdit, TextEditorOptions, TextEditorRevealType, TextLine, Uri, ViewColumn } from "vscode";

export class TextDocumentMock implements TextDocument {
    uri: Uri = Uri.parse('mock uri');
    fileName: string = 'mock file name';
    isUntitled: boolean = false;
    languageId: string = 'mock language id';
    version: number = 0;
    isDirty: boolean = false;
    isClosed: boolean = false;
    save(): Thenable<boolean> {
        throw new Error("Method not implemented.");
    }
    eol: EndOfLine = EndOfLine.LF;
    lineCount: number = 100000;
    lineAt(line: number): TextLine;
    lineAt(position: Position): TextLine;
    lineAt(position: unknown): import("vscode").TextLine {
        throw new Error("Method not implemented.");
    }
    offsetAt(position: Position): number {
        throw new Error("Method not implemented.");
    }
    positionAt(offset: number): Position {
        throw new Error("Method not implemented.");
    }
    getText(range?: Range | undefined): string {
        throw new Error("Method not implemented.");
    }
    getWordRangeAtPosition(position: Position, regex?: RegExp | undefined): Range | undefined {
        throw new Error("Method not implemented.");
    }
    validateRange(range: Range): Range {
        throw new Error("Method not implemented.");
    }
    validatePosition(position: Position): Position {
        throw new Error("Method not implemented.");
    }
}