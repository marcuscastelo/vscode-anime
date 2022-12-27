
	import { TextEditor, TextEditorEdit, window } from "vscode";
	import ShowStorage from "../cache/shows/showStorage";
	import LineContextFinder from "../list-parser/line-context-finder";
	import { isEditingSimpleCursor } from "../utils/editor-utils";
	import { MarucsAnime } from '../extension';
	import { Show } from "../cache/shows/cached-shows";
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

	const insertEp = (ep: string) => {
		textEditor.edit(edit => {
			edit.insert(textEditor.selection.start, ep.toString());
		});
	};

	let lastEp = show.info.lastWatchEntry?.episode;

	if (lastEp === undefined) {
		window.showWarningMessage(`Anime ${animeContext.result.currentShowLine.params.showTitle} has no last episode! Couldn't determine next epiode.`, {
			modal: true
		}, "Insert Episode 1").then((value) => {
			if (value === "Insert Episode 1") {
				insertEp("01");
			}
		});
		return;
	}

	let nextEpStr = (lastEp + 1).toString();
	if (nextEpStr.length < 2) { nextEpStr = "0" + nextEpStr; };

	insertEp(nextEpStr);
};
