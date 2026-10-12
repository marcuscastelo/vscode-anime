import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { preProcessFile } from 'typescript'
import { describe, expect, it } from 'vitest'
import { nextEpisode } from '../src/index.js'

describe('watching core boundary', () => {
  it('has no imports outside its domain package, including indirect source dependencies', () => {
    const root = resolve(import.meta.dirname, '../src')
    for (const file of readdirSync(root, { recursive: true })) {
      if (typeof file !== 'string' || !file.endsWith('.ts')) continue
      const source = readFileSync(resolve(root, file), 'utf8')
      for (const dependency of preProcessFile(source).importedFiles) {
        expect(dependency.fileName.startsWith('.'), file).toBe(true)
        expect(resolve(root, file, '..', dependency.fileName).startsWith(`${root}/`), file).toBe(
          true,
        )
      }
    }
    expect(nextEpisode([])).toBe(1)
  })
})
