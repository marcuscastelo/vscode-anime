import { 
    CompletionItemProvider, 
    ExtensionContext,
} from "vscode";

import { languages } from "vscode";

export default class TagCompletionProvider implements CompletionItemProvider {
    public static register(context: ExtensionContext) {
        const provider = new TagCompletionProvider(context);
        return languages.registerCompletionItemProvider(this.viewType, provider);
    }

    private static viewType = "anime-list"; // TODO: make global constant

    constructor(private readonly context: ExtensionContext) { }

    private determineCompletionType(text: string, cursorIndex: number): CompletionType {
        let surroundingInfo: SurroundingTokenInfo;
        const ifValidElseNoCompletion =
            (completionType: CompletionType) =>
                surroundingInfo.validState ? completionType : CompletionType.NoCompletion;

        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '{', '}');
        if (surroundingInfo.insideTokensRange) {
            return ifValidElseNoCompletion(CompletionType.Friend);
        }
}