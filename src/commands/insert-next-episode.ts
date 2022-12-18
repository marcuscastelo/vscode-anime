
	import { TextEditor, TextEditorEdit, window } from "vscode";
	import ShowStorage from "../cache/anime/showStorage";
	import LineContextFinder from "../list-parser/line-context-finder";
	import { isEditingSimpleCursor } from "../utils/editor-utils";
	import { MarucsAnime } from '../extension';
	import { Show } from "../cache/anime/shows";
	import { TextEditorCommand } from "./types";

export const insertNextEpisode: TextEditorCommand<void> = (textEditor: TextEditor, edit: TextEditorEdit) => {
	if (!isEditingSimpleCursor(textEditor)) { 
		return; 
	}

	const extension = MarucsAnime.INSTANCE;
	let animeContext = LineContextFinder.findContext(textEditor.document, textEditor.selection.start.line);

	if (!animeContext.ok) {
		console.error(animeContext.error);
		return;
	}

	let show: Show | undefined;

	show = extension.showStorage.getShow(animeContext.result.currentShowLine.params.showTitle);
	if (!show) {
		console.log(`[insertNextEpisode] Anime ${animeContext.result.currentShowLine.params.showTitle} not found, rescaning...`);
		extension.reactToDocumentChange(textEditor.document);
		show = extension.showStorage.getShow(animeContext.result.currentShowLine.params.showTitle);
		if (!show) {
			window.showErrorMessage(`[insertNextEpisode] Anime ${animeContext.result.currentShowLine.params.showTitle} not found! Couldn't determine next epiode. (Unexpected error) `);
			return;
		}
	}

	let lastEp = show.info.lastWatchEntry.episode;

	let nextEpStr = (lastEp + 1).toString();
	if (nextEpStr.length < 2) { nextEpStr = "0" + nextEpStr; };

	edit.insert(textEditor.selection.start, nextEpStr);
};
