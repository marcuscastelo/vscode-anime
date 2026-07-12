import type { ExtensionContext } from 'vscode'

import { createExtensionApp } from './activation/create-extension-app.js'

export const activate = (context: ExtensionContext): void => {
  const app = createExtensionApp({ log: (message) => console.info(message) })
  app.activate()
  context.subscriptions.push({ dispose: app.dispose })
}
