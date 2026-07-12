import type { ExtensionContext } from 'vscode'

import { createExtensionApp } from './activation/create-extension-app.js'
import { registerDocumentAnalysis } from './documents/register-document-analysis.js'

export const activate = (context: ExtensionContext): void => {
  const app = createExtensionApp({
    log: (message) => console.info(message),
    start: () => [registerDocumentAnalysis()],
  })
  app.activate()
  context.subscriptions.push({ dispose: app.dispose })
}
