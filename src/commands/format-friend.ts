import { Range, TextEditor, TextEditorEdit } from "vscode";
import { WATCH_REG } from "../list-parser/line-type";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { TextEditorCommand } from "./types";

export const formatFriendText = (lineText: string) => {
    let newText = lineText.trim();
    newText = newText.replace(",}", "}");
    newText = newText.endsWith(",") ? newText.slice(0, -1) + '}' : newText;
    newText = newText.match(/}/g) === null ? newText + '}' : newText;

    return newText;
};

export const formatFriend: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) {
		return;
	}

    const currLine = textEditor.selection.active.line;
    const currLineText = textEditor.document.lineAt(currLine).text;

    const hasExactlyOneOpeningCurlyBracket = currLineText.match(/{/g)?.length === 1;

    if (!hasExactlyOneOpeningCurlyBracket) {
        return;
    }

    let newText = formatFriendText(currLineText);

    edit.replace(new Range(currLine, 0, currLine, currLineText.length), newText);
};
