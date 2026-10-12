import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { downloadDirToExecutablePath } from '@vscode/test-electron/out/util.js'
import { describe, expect, it } from 'vitest'

describe('VS Code macOS bundle compatibility', () => {
  it.each(['Code', 'Electron'])('resolves the bundle executable declared as %s', async (name) => {
    const root = await mkdtemp(join(tmpdir(), 'anime-mac-bundle-'))
    const contents = join(root, 'Visual Studio Code.app', 'Contents')
    const executable = join(contents, 'MacOS', name)
    try {
      await mkdir(join(contents, 'MacOS'), { recursive: true })
      await writeFile(
        join(contents, 'Info.plist'),
        `<plist><dict><key>CFBundleExecutable</key><string>${name}</string></dict></plist>`,
      )
      await writeFile(executable, '')
      for (const platform of ['darwin-arm64', 'darwin'] as const) {
        const resolved = downloadDirToExecutablePath(root, platform)
        expect(resolved).toBe(executable)
        await expect(access(resolved)).resolves.toBeUndefined()
      }
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
