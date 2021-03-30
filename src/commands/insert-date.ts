import { TextEditor, TextEditorEdit } from "vscode";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { TextEditorCommand } from "./types";

export const insertDate: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) return;

	let currDate = (new Date(Date.now())).toLocaleDateString();

	edit.insert(textEditor.selection.active, currDate);
}

