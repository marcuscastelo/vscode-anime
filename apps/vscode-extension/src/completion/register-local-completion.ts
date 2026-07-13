import { CompletionItem, CompletionItemKind, languages, Range } from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import type { AnimeCatalog } from '../catalog/anime-catalog.js'
import type { DocumentController } from '../documents/document-controller.js'
import { completionSortText, localCompletionsAt, showQueryAt } from './local-completion.js'

const LANGUAGE_ID = 'anime-list'

const itemKind = (kind: 'person' | 'show' | 'tag'): CompletionItemKind => {
  switch (kind) {
    case 'person':
      return CompletionItemKind.User
    case 'show':
      return CompletionItemKind.Class
    case 'tag':
      return CompletionItemKind.Property
  }
}

export const registerLocalCompletion = (
  documentController: DocumentController,
  catalog: AnimeCatalog,
): Disposable => {
  const subscription = languages.registerCompletionItemProvider(
    LANGUAGE_ID,
    {
      provideCompletionItems: async (document, position, token) => {
        const state = documentController.get(document.uri.toString())
        if (state === undefined) return []
        const line = document.lineAt(position.line).text
        const local = localCompletionsAt(state.result.document, line, position.character)
        const query = showQueryAt(line, position.character)
        const abort = new AbortController()
        const cancellation = token.onCancellationRequested(() => abort.abort('cancelled'))
        const remote = query === undefined ? undefined : await catalog.search(query, abort.signal)
        cancellation.dispose()
        const existing = new Set(local.map((item) => item.label.toLocaleLowerCase()))
        const combined = [
          ...local,
          ...(remote?.tag === 'success'
            ? remote.results
                .filter((result) => !existing.has(result.title.toLocaleLowerCase()))
                .map((result) => ({
                  insertText: `${result.title}:`,
                  kind: 'show' as const,
                  label: result.title,
                  replaceFrom: 0,
                }))
            : []),
        ]
        return combined.map((value, index) => {
          const item = new CompletionItem(value.label, itemKind(value.kind))
          item.insertText = value.insertText
          item.sortText = completionSortText(index)
          item.range = new Range(
            position.line,
            value.replaceFrom,
            position.line,
            position.character,
          )
          return item
        })
      },
    },
    '{',
    '[',
    ',',
  )
  return {
    dispose: () => {
      subscription.dispose()
    },
  }
}
