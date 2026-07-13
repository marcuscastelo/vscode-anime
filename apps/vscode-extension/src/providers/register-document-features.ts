import {
  DocumentSymbol,
  Location,
  languages,
  MarkdownString,
  type Position,
  Range,
  SymbolKind,
  type TextDocument,
} from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import type { DocumentController } from '../documents/document-controller.js'
import {
  definitionInsightForTitle,
  hoverInsightAtLine,
  listDocumentSymbolInsights,
} from './document-insight.js'

const LANGUAGE_ID = 'anime-list'

const rangeAt = (line: number, start: number, end: number): Range =>
  new Range(line, start, line, end)

const titleAtPosition = (document: TextDocument, position: Position): string => {
  const text = document.lineAt(position.line).text
  const commentStart = text.indexOf('//')
  const withoutComment = commentStart === -1 ? text : text.slice(0, commentStart)
  return withoutComment.trim().replace(/:$/u, '').trim()
}

export const registerDocumentFeatures = (controller: DocumentController): Disposable => {
  const subscriptions = [
    languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
      provideDocumentSymbols: (document) => {
        const state = controller.get(document.uri.toString())
        if (state === undefined) return []
        return listDocumentSymbolInsights(state.result.document).map((symbol) => {
          const range = rangeAt(symbol.line, symbol.span.start.column, symbol.span.end.column)
          return new DocumentSymbol(symbol.name, '', SymbolKind.Class, range, range)
        })
      },
    }),
    languages.registerDefinitionProvider(LANGUAGE_ID, {
      provideDefinition: (document, position) => {
        const state = controller.get(document.uri.toString())
        if (state === undefined) return undefined
        const insight = definitionInsightForTitle(
          state.result.document,
          titleAtPosition(document, position),
        )
        return insight === undefined
          ? undefined
          : new Location(
              document.uri,
              rangeAt(insight.line, insight.span.start.column, insight.span.end.column),
            )
      },
    }),
    languages.registerHoverProvider(LANGUAGE_ID, {
      provideHover: (document, position) => {
        const state = controller.get(document.uri.toString())
        if (state === undefined) return undefined
        const insight = hoverInsightAtLine(state.result.document, position.line)
        if (insight === undefined) return undefined
        const markdown = new MarkdownString()
        markdown.appendMarkdown(`**${insight.title}**\n\n`)
        markdown.appendMarkdown(`Latest completed episode: ${insight.latestEpisode ?? 'none'}\n\n`)
        markdown.appendMarkdown(`Completed entries: ${insight.completedEpisodes}`)
        if (insight.people.length > 0) {
          markdown.appendMarkdown(`\n\nWatched with: ${insight.people.join(', ')}`)
        }
        return { contents: [markdown] }
      },
    }),
  ]

  return {
    dispose: () => {
      for (const subscription of subscriptions) subscription.dispose()
    },
  }
}
