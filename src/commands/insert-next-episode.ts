
import { TextEditor, TextEditorEdit, window } from "vscode";
import ShowStorage from "../cache/anime/anime-data-storage";
import LineContextFinder from "../list-parser/line-context-finder";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import { MAExtension } from '../extension'
import { Show } from "../cache/anime/shows";

export function insertNextEpisode(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) { return; }

	const extension = MAExtension.INSTANCE;
	let animeContext = LineContextFinder.findContext(textEditor.document, textEditor.selection.start.line);

	if (!animeContext.valid) {
		console.error(animeContext.error);
		return;
	}

	let show: Show | undefined;
	let showTry = 1;

	show = extension.showStorage.getShow(animeContext.context.currentShowTitle);
	if (!show) {
		console.log(`[insertNextEpisode] Anime ${animeContext.context.currentShowTitle} not found, rescaning...`);
		extension.rescanDocument();
		show = extension.showStorage.getShow(animeContext.context.currentShowTitle);
		if (!show) {
			window.showErrorMessage(`[insertNextEpisode] Anime ${animeContext.context.currentShowTitle} not found! Couldn't determine next epiode. (Unexpected error) `);
			return;
		}
	}

	let lastEp = show.info.lastWatchEntry.episode;

	let nextEpStr = (lastEp + 1).toString();
	if (nextEpStr.length < 2) { nextEpStr = "0" + nextEpStr; };
	
	edit.insert(textEditor.selection.start, nextEpStr);
}
