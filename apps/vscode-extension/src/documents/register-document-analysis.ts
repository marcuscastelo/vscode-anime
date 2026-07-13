import { parseAnlDocument } from '@marucs-anime/core'
import {
  Diagnostic,
  DiagnosticSeverity,
  languages,
  Range,
  type TextDocument,
  Uri,
  workspace,
} from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import { toEditorDiagnostic } from '../diagnostics/editor-diagnostic.js'
import {
  createDocumentController,
  type DocumentController,
  systemScheduler,
} from './document-controller.js'

const LANGUAGE_ID = 'anime-list'
const CHANGE_DEBOUNCE_MS = 100

const isAnlDocument = (document: TextDocument): boolean => document.languageId === LANGUAGE_ID

export type DocumentAnalysis = Disposable & Readonly<{ controller: DocumentController }>

export const registerDocumentAnalysis = (): DocumentAnalysis => {
  const collection = languages.createDiagnosticCollection('marucs-anime')
  const controller = createDocumentController({
    onParsed: (state) => {
      const diagnostics = state.result.diagnostics.map(toEditorDiagnostic).map((value) => {
        const item = new Diagnostic(
          new Range(
            value.range.start.line,
            value.range.start.character,
            value.range.end.line,
            value.range.end.character,
          ),
          value.message,
          value.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
        )
        item.code = value.code
        return item
      })
      collection.set(Uri.parse(state.uri), diagnostics)
    },
    parse: parseAnlDocument,
    scheduler: systemScheduler,
  })

  const update = (document: TextDocument, delayMs = 0): void => {
    if (!isAnlDocument(document)) return
    controller.update(
      { text: document.getText(), uri: document.uri.toString(), version: document.version },
      delayMs,
    )
  }

  const subscriptions = [
    workspace.onDidOpenTextDocument((document) => update(document)),
    workspace.onDidChangeTextDocument((event) => update(event.document, CHANGE_DEBOUNCE_MS)),
    workspace.onDidCloseTextDocument((document) => {
      const uri = document.uri.toString()
      controller.close(uri)
      collection.delete(document.uri)
    }),
  ]
  for (const document of workspace.textDocuments) update(document)

  return {
    controller,
    dispose: () => {
      for (const subscription of subscriptions) subscription.dispose()
      controller.dispose()
      collection.dispose()
    },
  }
}
