import { access, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const { runTests } = vi.hoisted(() => ({ runTests: vi.fn() }))
vi.mock('@vscode/test-electron', () => ({ runTests }))

describe('isolated Extension Host runner', () => {
  it.skipIf(process.platform === 'win32')(
    'opens IPC with a long TMPDIR and cleans up its profile',
    async () => {
      const root = await mkdtemp(join(tmpdir(), 'anl-runner-test-'))
      const longTemporary = join(root, 'x'.repeat(80))
      let profile = ''
      try {
        await mkdir(longTemporary)
        vi.stubEnv('TMPDIR', longTemporary)
        runTests.mockImplementation(
          async (options: {
            launchArgs: string[]
            extensionTestsEnv: Record<string, string | undefined>
          }) => {
            expect(options.extensionTestsEnv).toHaveProperty('ELECTRON_RUN_AS_NODE', undefined)
            profile =
              options.launchArgs
                .find((arg) => arg.startsWith('--user-data-dir='))
                ?.slice('--user-data-dir='.length) ?? ''
            expect(profile).not.toBe('')
            const socket = join(profile, '1.14-main.sock')
            expect(Buffer.byteLength(socket)).toBeLessThanOrEqual(103)
            await mkdir(profile)
            const server = createServer()
            try {
              await new Promise<void>((resolve, reject) => {
                server.once('error', reject)
                server.listen(socket, resolve)
              })
            } finally {
              if (server.listening)
                await new Promise<void>((resolve, reject) =>
                  server.close((error) => (error === undefined ? resolve() : reject(error))),
                )
            }
          },
        )
        const runner = new URL('../../scripts/run-integration.mjs', import.meta.url).href
        await import(runner)
        expect(runTests).toHaveBeenCalledOnce()
        await expect(access(profile)).rejects.toMatchObject({ code: 'ENOENT' })
      } finally {
        vi.unstubAllEnvs()
        await rm(root, { recursive: true, force: true })
      }
    },
  )
})
