"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const extension_1 = require("../extension");
var CompletionType;
(function (CompletionType) {
    CompletionType[CompletionType["ShowTitle"] = 1] = "ShowTitle";
    CompletionType[CompletionType["Friend"] = 2] = "Friend";
    CompletionType[CompletionType["Tag"] = 3] = "Tag";
    CompletionType[CompletionType["Episode"] = 4] = "Episode";
    CompletionType[CompletionType["NoCompletion"] = 5] = "NoCompletion";
})(CompletionType || (CompletionType = {}));
class ShowCompletionItemProvider {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        const provider = new ShowCompletionItemProvider(context);
        return vscode_1.languages.registerCompletionItemProvider(this.viewType, provider);
    }
    determineCompletionType(text, cursorIndex) {
        let surroundingInfo;
        const ifValidElseNoCompletion = (completionType) => surroundingInfo.validState ? completionType : CompletionType.NoCompletion;
        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '{', '}');
        if (surroundingInfo.insideTokensRange)
            return ifValidElseNoCompletion(CompletionType.Friend);
        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '[', ']');
        if (surroundingInfo.insideTokensRange)
            return ifValidElseNoCompletion(CompletionType.Tag);
        return CompletionType.ShowTitle;
    }
    getSurroundingTokenInfo(text, cursorIndex, startToken, endToken) {
        const countOccurrencesOf = (char) => text.match(`\\${char}`)?.length ?? 0;
        const startTokenFirstIdx = text.indexOf(startToken);
        const endTokenFirstIdx = text.indexOf(endToken);
        const startTokenCount = countOccurrencesOf(startToken);
        const endTokenCount = countOccurrencesOf(endToken);
        const validState = endTokenCount === 0 && startTokenCount === 1;
        const insideTokensRange = startTokenCount > 0 && (cursorIndex > startTokenFirstIdx && (cursorIndex < endTokenFirstIdx || endTokenCount === 0));
        return {
            validState,
            insideTokensRange,
        };
    }
    getCompletionOptionsFromStorage(storage, completionType) {
        switch (completionType) {
            case CompletionType.Friend: return storage.listFriends();
            case CompletionType.ShowTitle: return storage.listShows();
            default:
                console.error('Not Implemented completion: ', completionType.toString());
                return [];
        }
    }
    filterCompletionOptions(alreadyTypedText, completionOptions, ignoreCase = true, ignoreWhiteSpaces = true) {
        const filterFn = (option) => {
            if (ignoreCase) {
                option = option.toLowerCase();
                alreadyTypedText = alreadyTypedText.toLowerCase();
            }
            if (ignoreWhiteSpaces) {
                option = option.trim();
                alreadyTypedText = alreadyTypedText.trim();
            }
            return option.startsWith(alreadyTypedText);
        };
        return completionOptions.filter(filterFn);
    }
    convertOptions(options, completionType) {
        const getCompletionKind = () => {
            const kinds = {
                [CompletionType.Friend]: vscode_1.CompletionItemKind.User,
                [CompletionType.ShowTitle]: vscode_1.CompletionItemKind.Class,
                [CompletionType.Tag]: vscode_1.CompletionItemKind.Property,
                [CompletionType.Episode]: vscode_1.CompletionItemKind.Constant,
                [CompletionType.NoCompletion]: vscode_1.CompletionItemKind.Text,
            };
            return kinds[completionType] ?? vscode_1.CompletionItemKind.Text;
        };
        const getInsertTextFn = () => {
            const funcs = {
                [CompletionType.Friend]: (label) => label + ',',
                [CompletionType.ShowTitle]: (label) => label + ':',
                [CompletionType.Tag]: (label) => label + ']',
                [CompletionType.Episode]: (label) => label + ' ',
                [CompletionType.NoCompletion]: (_) => '',
            };
            return funcs[completionType];
        };
        const conversionFn = (option) => ({
            label: option,
            kind: getCompletionKind(),
            insertText: getInsertTextFn()(option),
        });
        return options.map(conversionFn);
    }
    getAlreadyTypedText(lineText, charPosition, completionType) {
        let match;
        const re = /[{,]/g;
        let attStart = -1;
        while ((match = re.exec(lineText)) !== null) {
            attStart = match.index;
        }
        if (attStart < 0 || attStart >= lineText.length)
            return '';
        return lineText.substring(attStart + 1, charPosition);
    }
    provideCompletionItems(document, position, token, completionContext) {
        const extension = extension_1.MAExtension.INSTANCE;
        const text = document.lineAt(position.line).text;
        const horizPosition = position.character;
        const completionType = this.determineCompletionType(text, horizPosition);
        const completionOptions = this.getCompletionOptionsFromStorage(extension.showStorage, completionType);
        const alreadyTypedText = this.getAlreadyTypedText(text, horizPosition, completionType);
        const filteredOptions = this.filterCompletionOptions(alreadyTypedText, completionOptions);
        const completions = this.convertOptions(filteredOptions, completionType);
        console.log();
        console.log({
            completionType,
            completionOptions,
            filteredOptions
        });
        console.log({
            text,
            alreadyTypedText,
        });
        console.log();
        if (completions.length === 0)
            return [{}];
        return completions;
    }
}
exports.default = ShowCompletionItemProvider;
ShowCompletionItemProvider.viewType = "anime-list";
//# sourceMappingURL=anime-completion-provider.js.map