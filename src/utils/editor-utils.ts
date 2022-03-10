import { TextEditor } from "vscode";

export function isEditingSimpleCursor(textEditor: TextEditor) {
	return textEditor.selections.length === 1 && textEditor.selection.isSingleLine;
}