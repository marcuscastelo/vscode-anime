
import { TextEditor, TextEditorEdit } from "vscode";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { TextEditorCommand } from "./types";

export const insertTime: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) return;

	let currTime = (new Date(Date.now())).toLocaleTimeString(undefined, {
		hour: `2-digit`,
		minute: `2-digit`
	});

	let currentLineText = textEditor.document.lineAt(textEditor.selection.start.line).text;


	let emptyLine = currentLineText.match(/^\s*$/g) !== null;
	let halfWay = currentLineText.match(/^\s*(\d{2}:\d{2})\s*\-?\s*$/g) !== null;
	let hasDash = currentLineText.indexOf('-');

	if (!emptyLine && !halfWay) return;

	if (halfWay) {
		if (!hasDash) currTime = ' - ' + currTime.trim();
		currTime += ' ';
	}
	else if (emptyLine) currTime += currentLineText.endsWith(' ') ? '- ' : ' - ';
	edit.insert(textEditor.selection.active, currTime);
}