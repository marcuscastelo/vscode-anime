
import { TextEditor, TextEditorEdit } from "vscode";
import AnimeDataStorage from "../cache/anime/anime-data-storage";
import { getContext } from "../extension";
import MAListContextUtils from "../list-parser/maListContext";
import { isEditingSimpleCursor } from "../utils/editor-utils";

export function insertNextEpisode(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) { return; }

	let animeStorage = getContext().workspaceState.get<AnimeDataStorage>("marucs-anime:storage");

	let animeContext = MAListContextUtils.getContext(textEditor.document, textEditor.selection.start.line);

	if (!animeContext.valid || !animeContext.context) {
		return;
	}

	let anime = animeStorage?.getAnime(animeContext.context.currentShowTitle);

	let lastEp = anime?.getBasicInfo().lastWatchedEpisode ?? 0;

	let nextEpStr = (lastEp + 1).toString();
	if (nextEpStr.length < 2) { nextEpStr = "0" + nextEpStr; };
	edit.insert(textEditor.selection.start, nextEpStr);
}
