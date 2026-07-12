import type { ExtensionContext } from 'vscode'

import { createExtensionApp } from './activation/create-extension-app.js'
import { abortableWait, createAnimeCatalog } from './catalog/anime-catalog.js'
import { createJikanTransport } from './catalog/jikan-transport.js'
import { systemClock } from './clock/clock.js'
import { registerDateTimeCommands } from './commands/register-date-time-commands.js'
import { registerLocalCompletion } from './completion/register-local-completion.js'
import { registerDocumentAnalysis } from './documents/register-document-analysis.js'
import { registerDocumentFeatures } from './providers/register-document-features.js'

export const activate = (context: ExtensionContext): void => {
  const analysis = registerDocumentAnalysis()
  const catalog = createAnimeCatalog({
    now: () => Date.now(),
    transport: createJikanTransport(),
    wait: abortableWait,
  })
  const app = createExtensionApp({
    log: (message) => console.info(message),
    start: () => [
      analysis,
      registerDocumentFeatures(analysis.controller),
      registerLocalCompletion(analysis.controller, catalog),
      registerDateTimeCommands(analysis.controller, systemClock),
    ],
  })
  app.activate()
  context.subscriptions.push({ dispose: app.dispose })
}
