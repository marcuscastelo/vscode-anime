
import { TextEditor, TextEditorEdit, window } from "vscode";
import ShowStorage from "../cache/anime/showStorage";
import LineContextFinder from "../list-parser/line-context-finder";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { MarucsAnime } from '../extension';
import { Show } from "../cache/anime/shows";
import { TextEditorCommand } from "./types";
import { equip, isErr, isOk, Option, OptionEquipped } from "rustic";

export const insertNextEpisode: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) {
		return;
	}

	const extension = MarucsAnime.INSTANCE;
	let searchResult = LineContextFinder.findContext(textEditor.document, textEditor.selection.start.line);

	if (isErr(searchResult)) {
		console.error(searchResult.data);
		return;
	}

	const context = searchResult.data;

	function firstAttempt(): Option<Show> {
		return extension.showStorage.searchShow(context.currentShowLine.params.showTitle);
	}

	function secondAttempt(): Option<Show> {
		extension.reactToDocumentChange(extension.context!, textEditor.document);
		return extension.showStorage.searchShow(context.currentShowLine.params.showTitle);
	}

	const show = equip(firstAttempt())
		.orElse(() => {
			console.log(`[insertNextEpisode] Anime ${context.currentShowLine.params.showTitle} not found, rescaning...`);
			return secondAttempt();
		});

	if (show.isNone()) {
		window.showErrorMessage(`[insertNextEpisode] Anime ${context.currentShowLine.params.showTitle} not found! Couldn't determine next epiode. (Unexpected error) `);
		return;
	}

	let lastEp = show.unwrap().info.lastCompleteWatchEntry?.data.episode ?? 0;

	let nextEpStr = (lastEp + 1).toString();
	if (nextEpStr.length < 2) { nextEpStr = "0" + nextEpStr; };

	edit.insert(textEditor.selection.start, nextEpStr);
};
