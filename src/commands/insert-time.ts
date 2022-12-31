
import { isErr } from "rustic";
import { Selection, TextDocument, TextEditor, TextEditorEdit, window } from "vscode";
import { checkLineInDocumentIsToday } from "../analysis/check-date-time";
import LineContextFinder from "../list-parser/line-context-finder";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { TextEditorCommand } from "./types";

function insertTimeCallback(textEditor: TextEditor, currTime: string) {
	textEditor.edit(
		editBuilder => editBuilder.insert(textEditor.selection.active, currTime)
	);
}

export function getTimeString() {
	return (new Date(Date.now())).toLocaleTimeString('pt-BR', {
		hour: `2-digit`,
		minute: `2-digit`
	});
}

export const insertTime: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) {
		return;
	}

	let currTime = getTimeString();

	let currentLineText = textEditor.document.lineAt(textEditor.selection.start.line).text;

	let emptyLine = currentLineText.match(/^\s*$/g) !== null;
	let halfWay = currentLineText.match(/^\s*(\d{2}:\d{2})\s*\-?\s*$/g) !== null;
	let hasDash = currentLineText.indexOf('-');

	if (!emptyLine && !halfWay) {
		return;
	}

	if (halfWay) {
		if (!hasDash) {
			currTime = ' - ' + currTime.trim();
		} 
		currTime += ' ';
	}
	else if (emptyLine) { 
		currTime += currentLineText.endsWith(' ') ? '- ' : ' - ';
	}

	const checkResult = checkLineInDocumentIsToday(textEditor.document, textEditor.selection.start.line);

	if (isErr(checkResult)) {
		window.showErrorMessage(checkResult.data.message);
		return;
	}

	const isSameDate = checkResult.data;

	if (!isSameDate) {
		window.showWarningMessage(`The date of the last declared date line is not today. Are you sure you want to insert the time?`, {
			modal: true
		}, 'Insert time').then((value) => {
			if (value === 'Insert time') {
				insertTimeCallback(textEditor, currTime);
			}
		});
		return;
	}

	insertTimeCallback(textEditor, currTime);	
};