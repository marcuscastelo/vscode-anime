import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runTests } from '@vscode/test-electron'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

await runTests({
  extensionDevelopmentPath: root,
  extensionTestsPath: resolve(root, 'dist-test/suite.cjs'),
  launchArgs: [
    '--disable-extensions',
    '--user-data-dir=/tmp/marucs-anime-vscode-user-data',
    '--extensions-dir=/tmp/marucs-anime-vscode-extensions',
  ],
})
