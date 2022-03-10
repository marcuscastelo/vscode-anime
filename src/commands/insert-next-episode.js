"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNextEpisode = void 0;
const vscode_1 = require("vscode");
const line_context_finder_1 = require("../list-parser/line-context-finder");
const editor_utils_1 = require("../utils/editor-utils");
const extension_1 = require("../extension");
const insertNextEpisode = (textEditor, edit) => {
    if (!(0, editor_utils_1.isEditingSimpleCursor)(textEditor)) {
        return;
    }
    const extension = extension_1.MAExtension.INSTANCE;
    let animeContext = line_context_finder_1.default.findContext(textEditor.document, textEditor.selection.start.line);
    if (!animeContext.valid) {
        console.error(animeContext.error);
        return;
    }
    let show;
    show = extension.showStorage.getShow(animeContext.context.currentShowTitle);
    if (!show) {
        console.log(`[insertNextEpisode] Anime ${animeContext.context.currentShowTitle} not found, rescaning...`);
        extension.rescanDocument(textEditor.document);
        show = extension.showStorage.getShow(animeContext.context.currentShowTitle);
        if (!show) {
            vscode_1.window.showErrorMessage(`[insertNextEpisode] Anime ${animeContext.context.currentShowTitle} not found! Couldn't determine next epiode. (Unexpected error) `);
            return;
        }
    }
    let lastEp = show.info.lastWatchEntry.episode;
    let nextEpStr = (lastEp + 1).toString();
    if (nextEpStr.length < 2) {
        nextEpStr = "0" + nextEpStr;
    }
    ;
    edit.insert(textEditor.selection.start, nextEpStr);
};
exports.insertNextEpisode = insertNextEpisode;
//# sourceMappingURL=insert-next-episode.js.map