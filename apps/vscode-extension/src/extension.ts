import type { ExtensionContext } from 'vscode'

import { createExtensionApp } from './activation/create-extension-app.js'
import { registerDocumentAnalysis } from './documents/register-document-analysis.js'
import { registerDocumentFeatures } from './providers/register-document-features.js'

export const activate = (context: ExtensionContext): void => {
  const analysis = registerDocumentAnalysis()
  const app = createExtensionApp({
    log: (message) => console.info(message),
    start: () => [analysis, registerDocumentFeatures(analysis.controller)],
  })
  app.activate()
  context.subscriptions.push({ dispose: app.dispose })
}
