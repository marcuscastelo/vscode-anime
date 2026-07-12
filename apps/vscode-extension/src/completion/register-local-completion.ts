import { CompletionItem, CompletionItemKind, languages, Range } from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import type { DocumentController } from '../documents/document-controller.js'
import { localCompletionsAt } from './local-completion.js'

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

export const registerLocalCompletion = (controller: DocumentController): Disposable => {
  const subscription = languages.registerCompletionItemProvider(
    LANGUAGE_ID,
    {
      provideCompletionItems: (document, position) => {
        const state = controller.get(document.uri.toString())
        if (state === undefined) return []
        const line = document.lineAt(position.line).text
        return localCompletionsAt(state.result.document, line, position.character).map((value) => {
          const item = new CompletionItem(value.label, itemKind(value.kind))
          item.insertText = value.insertText
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
