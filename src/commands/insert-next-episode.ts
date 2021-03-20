
import { TextEditor, TextEditorEdit } from "vscode";
import AnimeDataStorage from "../anime-data-storage";
import { getContext } from "../extension";
import findContext from "../list-parser/anime-context-finder";
import { isEditingSimpleCursor } from "../utils/editor-utils";

export function insertNextEpisode(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) return;

	let animeStorage = getContext().workspaceState.get<AnimeDataStorage>("marucs-anime:storage");

	let animeContext = findContext(textEditor, textEditor.selection.start.line);

	let anime = animeStorage?.getAnime(animeContext.currAnimeName);

	let nextEpStr = ((anime?.lastEp ?? 0) + 1).toString();
	if (nextEpStr.length < 2) nextEpStr = "0" + nextEpStr;
	edit.insert(textEditor.selection.start, nextEpStr);
}
