
import { TextEditor, TextEditorEdit, window } from "vscode";
import AnimeDataStorage from "../cache/anime/anime-data-storage";
import MAListContextUtils from "../list-parser/maListContext";
import { isEditingSimpleCursor } from "../utils/editor-utils";
import {MAExtension} from '../extension'

export function insertNextEpisode(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) { return; }

	MAExtension.INSTANCE.animeStorage;
	let animeContext = MAListContextUtils.getContext(textEditor.document, textEditor.selection.start.line);

	if (!animeContext.valid) {
		console.error(animeContext.error);
		return;
	}

	let anime = MAExtension.INSTANCE.animeStorage.getAnime(animeContext.context.currentShowTitle);

	if (!anime) {
		console.log(`[insertNextEpisode] Anime ${animeContext.context.currentShowTitle} not found, rescaning...`);
		MAExtension.INSTANCE.rescanDocument();
		anime = MAExtension.INSTANCE.animeStorage.getAnime(animeContext.context.currentShowTitle);
		if (!anime) {
			window.showErrorMessage(`[insertNextEpisode] Anime ${animeContext.context.currentShowTitle} not found! Couldn't determine next epiode. (Unexpected error) `);
			return;
		}
	}

	let lastEp = anime.getBasicInfo().lastWatchedEpisode;

	let nextEpStr = (lastEp + 1).toString();
	if (nextEpStr.length < 2) { nextEpStr = "0" + nextEpStr; };
	edit.insert(textEditor.selection.start, nextEpStr);
}
