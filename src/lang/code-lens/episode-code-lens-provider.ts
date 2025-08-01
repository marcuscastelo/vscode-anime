import { isOk } from 'rustic';
import {
	type CancellationToken,
	CodeLens,
	type CodeLensProvider,
	type ExtensionContext,
	languages,
	Range,
	type TextDocument,
} from 'vscode';
import * as vscode from 'vscode';

import { LANGUAGE_ID } from '../../constants';
import { MarucsAnime } from '../../extension';
import LineContextFinder from '../../list-parser/line-context-finder';
import { MAL } from '../../services/mal';

export default class EpisodeLensProvider implements CodeLensProvider {
	public static register(context: ExtensionContext) {
		const provider = new EpisodeLensProvider(context);
		return languages.registerCodeLensProvider(this.viewType, provider);
	}

	private static readonly viewType = LANGUAGE_ID;

	constructor(private readonly context: ExtensionContext) {}

	private async generateEpisodesLens(
		document: TextDocument,
		line: number,
		lazy = false
	): Promise<CodeLens> {
		const contextSearchResult = LineContextFinder.findContext(document, line);
		const range = new Range(line, 0, line + 1, 10);

		if (lazy) {
			return new CodeLens(range);
		}

		if (!isOk(contextSearchResult)) {
			console.warn('generateEpisodesLens had invalid context');
			return new CodeLens(range, {
				title: `${contextSearchResult.data.message}`,
				command: '',
			});
		}

		const currShowTitle = contextSearchResult.data.currentShowLine.params.showTitle;
		const show = MarucsAnime.INSTANCE.showRegistry.searchShow(currShowTitle);
		if (!show) {
			console.warn(`generateEpisodesLens had invalid show '${currShowTitle}'`);
			return new CodeLens(range, {
				title: `${currShowTitle} not found in MAL`,
				command: '',
			});
		}

		const lastWatchedEpisode = show.lastCompleteWatchEntry?.data.episode ?? 0;

		const bestAnimeMatch = await MAL.searchBestAnime(currShowTitle);
		if (!bestAnimeMatch) {
			console.warn(`generateEpisodesLens had invalid MAL data for '${currShowTitle}'`);
			return new CodeLens(range, {
				title: `${currShowTitle} not found in MAL`,
				command: '',
			});
		}

		const episodes = bestAnimeMatch.episodes;

		return new CodeLens(range, {
			title: `Watched ${lastWatchedEpisode}/${episodes}`,
			command: '',
		});
	}

	async provideCodeLenses(document: TextDocument, _token: CancellationToken): Promise<CodeLens[]> {
		// console.log("provideCodeLenses");

		if (document !== vscode.window.activeTextEditor?.document) {
			console.warn('provideCodeLenses had weird document');
			return [];
		}

		const lenses: CodeLens[] = [];

		for (let i = document.lineCount - 1; i > 0; i--) {
			const line = document.lineAt(i);
			if (!line.text.endsWith(':')) {
				continue; // Only check lines with a colon (show title lines)
			}

			const lazyCodeLenses = await this.generateEpisodesLens(document, i, true);
			lenses.push(lazyCodeLenses);

			if (lenses.length > 1750) {
				break; // Only check the last 10 lines (for now) //TODO: use resolveCodeLens
			}
		}

		// console.log(`Found ${lenses.length} episode lenses`);
		return lenses;
	}

	public async resolveCodeLens?(codeLens: CodeLens, _token: CancellationToken): Promise<CodeLens> {
		// console.log("resolveCodeLens");
		const line = codeLens.range.start.line;
		const document = vscode.window.activeTextEditor?.document;
		if (!document) {
			console.warn('resolveCodeLens had weird document');
			return codeLens;
		}

		const newCodeLens = await this.generateEpisodesLens(document, line, false);
		return newCodeLens;
	}
}
