import { TextEditor, TextEditorEdit } from "vscode";
import { isEditingSimpleCursor } from "../utils/editor-utils";

export function insertDate(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) return;

	let currDate = (new Date(Date.now())).toLocaleDateString();

	edit.insert(textEditor.selection.active, currDate);
}

