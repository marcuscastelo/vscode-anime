"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const shows_1 = require("../cache/anime/shows");
const extension_1 = require("../extension");
const line_context_finder_1 = require("../list-parser/line-context-finder");
const mal_1 = require("../services/mal");
const line_info_parser_1 = require("../list-parser/line-info-parser");
const line_type_1 = require("../list-parser/line-type");
async function searchMAL(animeTitle) {
    let foundAnimes = await mal_1.MAL.searchAnime(animeTitle);
    return foundAnimes.length > 0 ? foundAnimes[0] : undefined;
}
function getAnimeID(animeTitle) {
}
class ShowHoverProvider {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const provider = new ShowHoverProvider(context);
        return vscode_1.languages.registerHoverProvider(this.viewType, provider);
    }
    async provideHover(document, position, token) {
        const extension = extension_1.MAExtension.INSTANCE;
        if (!vscode_1.window.activeTextEditor) {
            return;
        }
        let { type: lineType } = line_info_parser_1.default.identifyLine(vscode_1.window.activeTextEditor.document.lineAt(position.line));
        if (lineType !== line_type_1.LineType.ShowTitle) {
            return;
        }
        let lineContext = line_context_finder_1.default.findContext(vscode_1.window.activeTextEditor.document, position.line);
        if (!lineContext.valid) {
            return;
        }
        let showTitle = lineContext.context.currentShowTitle;
        let show = extension.showStorage.getShow(showTitle);
        let mdString;
        if (show instanceof shows_1.Anime) {
            let showInfo = show.info;
            let malInfo = await show.getMALInfo();
            mdString = new vscode_1.MarkdownString(`### ${showTitle}: ` +
                `\n ![anime image](${malInfo.image_url})` +
                `\n- Last episode: ${showInfo.lastWatchEntry.episode}/${malInfo.episodes}` +
                `\n- URL: ${malInfo.url}`);
        }
        else {
            mdString = new vscode_1.MarkdownString(`### ${showTitle}:` +
                `\n NOT-ANIME`);
        }
        return new vscode_1.Hover(mdString);
    }
}
exports.default = ShowHoverProvider;
ShowHoverProvider.viewType = 'anime-list';
;
//# sourceMappingURL=anime-hover-provider.js.map