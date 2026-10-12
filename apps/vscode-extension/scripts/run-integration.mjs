import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runTests } from '@vscode/test-electron'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Unix domain sockets have short path limits; macOS TMPDIR may already be very long.
const temporary = await mkdtemp(resolve(process.platform === 'win32' ? tmpdir() : '/tmp', 'anl-'))
try {
  await runTests({
    extensionDevelopmentPath: root,
    extensionTestsPath: resolve(root, 'dist-test/suite.cjs'),
    extensionTestsEnv: { ELECTRON_RUN_AS_NODE: undefined },
    launchArgs: [
      '--disable-extensions',
      `--user-data-dir=${resolve(temporary, 'user-data')}`,
      `--extensions-dir=${resolve(temporary, 'extensions')}`,
    ],
  })
} finally {
  await rm(temporary, { recursive: true, force: true })
}
