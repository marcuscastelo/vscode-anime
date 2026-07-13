import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

type Keybinding = Readonly<{ command: string; key: string; mac: string; when: string }>
type Manifest = Readonly<{
  contributes: Readonly<{
    commands: readonly Readonly<{ command: string }>[]
    grammars: readonly Readonly<{ path: string }>[]
    keybindings: readonly Keybinding[]
    languages: readonly Readonly<{ extensions: readonly string[]; id: string }>[]
  }>
  main: string
}>

const root = new URL('../../', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as Manifest

describe('extension manifest', () => {
  it('declares the generated CommonJS entry point', () => {
    expect(manifest.main).toBe('./dist/extension.cjs')
  })

  it('contributes the ANL language and an existing grammar', () => {
    expect(manifest.contributes.languages).toContainEqual(
      expect.objectContaining({ extensions: ['.anl'], id: 'anime-list' }),
    )
    const grammar = manifest.contributes.grammars[0]?.path
    expect(grammar).toBe('./syntaxes/anime-list.tmLanguage.json')
    expect(existsSync(new URL(grammar ?? '', root))).toBe(true)
  })

  it('contributes commands and platform-specific scoped shortcuts', () => {
    expect(manifest.contributes.commands.map((command) => command.command)).toEqual([
      'marucs-anime.insertDate',
      'marucs-anime.insertTime',
      'marucs-anime.insertNextEpisode',
    ])
    expect(manifest.contributes.keybindings).toEqual([
      {
        command: 'marucs-anime.insertDate',
        key: 'alt+d',
        mac: 'cmd+shift+d',
        when: 'editorTextFocus && editorLangId == anime-list',
      },
      {
        command: 'marucs-anime.insertTime',
        key: 'alt+t',
        mac: 'cmd+shift+t',
        when: 'editorTextFocus && editorLangId == anime-list',
      },
      {
        command: 'marucs-anime.insertNextEpisode',
        key: 'alt+n',
        mac: 'cmd+shift+n',
        when: 'editorTextFocus && editorLangId == anime-list',
      },
    ])
  })
})
