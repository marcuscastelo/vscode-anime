
import { isErr } from "rustic";
import { Selection, TextDocument, TextEditor, TextEditorEdit, window } from "vscode";
import LineContextFinder from "../list-parser/line-context-finder";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { TextEditorCommand } from "./types";

function checkLineContextDateIsToday(document: TextDocument, line: number): [boolean, string] {
	const contextRes = LineContextFinder.findContext(document, line);
	if (isErr(contextRes)) {
		console.error(contextRes.data);
		return [false, contextRes.data.message];
	}

	const context = contextRes.data;
	const contextDate = context.currentDateLine.params.date;

	let currDate = (new Date(Date.now())).toLocaleDateString('pt-BR');

	if (contextDate !== currDate) {
		return [false, `The date of the current line is not today. Today: ${currDate}, line date: ${contextDate}`];
	}

	return [true, 'Ok'];
}

function insertTimeCallback(textEditor: TextEditor, currTime: string) {
	textEditor.edit(
		editBuilder => editBuilder.insert(textEditor.selection.active, currTime)
	);
}

export const insertTime: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) {
		return;
	}

	let currTime = (new Date(Date.now())).toLocaleTimeString('pt-BR', {
		hour: `2-digit`,
		minute: `2-digit`
	});

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

	const [isSameDate, error] = checkLineContextDateIsToday(textEditor.document, textEditor.selection.start.line);
	if (!isSameDate) {
		window.showWarningMessage(error, {
			modal: true
		}, 'Insert time anyways').then((value) => {
			if (value === 'Insert time anyways') {
				insertTimeCallback(textEditor, currTime);
			}
		});
		return;
	}

	insertTimeCallback(textEditor, currTime);	
};