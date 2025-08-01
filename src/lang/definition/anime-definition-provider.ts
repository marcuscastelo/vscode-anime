import { isErr } from 'rustic';
import {
	type CancellationToken,
	type Definition,
	type DefinitionLink,
	type DefinitionProvider,
	type ExtensionContext,
	languages,
	type Position,
	type ProviderResult,
	Range,
	type TextDocument,
} from 'vscode';

import { LANGUAGE_ID } from '../../constants';
import { MarucsAnime } from '../../extension';
import LineContextFinder from '../../list-parser/line-context-finder';

export default class ShowDefinitionProvider implements DefinitionProvider {
	public static register(context: ExtensionContext) {
		const provider = new ShowDefinitionProvider(context);
		return languages.registerDefinitionProvider(this.viewType, provider);
	}

	private static readonly viewType = LANGUAGE_ID;

	constructor(private readonly context: ExtensionContext) {}

	provideDefinition(
		document: TextDocument,
		position: Position,
		_token: CancellationToken
	): ProviderResult<Definition | DefinitionLink[]> {
		const contextRes = LineContextFinder.findContext(document, position.line);
		if (isErr(contextRes)) {
			return;
		}

		if (position.line === contextRes.data.currentDateLine.line.lineNumber) {
			return; // We don't want to highlight the date line
		}

		const currentShowLine = contextRes.data.currentShowLine.line.lineNumber;
		const show = MarucsAnime.INSTANCE.showRegistry.searchShow(
			contextRes.data.currentShowLine.params.showTitle
		);
		if (!show) {
			return;
		}

		let targetLines = [];
		const originalLine = position.line;

		if (show.firstMentionedLine === position.line) {
			const searchText = document.lineAt(currentShowLine).text;
			const allMentions = document
				.getText()
				.split(/\r?\n/)
				.map((line, index) => ({ line, index }))
				.filter(line => line.line.includes(searchText));
			targetLines = allMentions.map(line => line.index).filter(line => line !== position.line);
		} else if (currentShowLine === position.line) {
			targetLines = [show.firstMentionedLine];
		} else {
			targetLines = [currentShowLine];
		}

		const selectionRange = new Range(originalLine, 0, originalLine, 100);
		return targetLines.map(line => ({
			originSelectionRange: selectionRange,
			targetUri: document.uri,
			targetRange: new Range(line, 0, line, 100),
		}));
	}
}
