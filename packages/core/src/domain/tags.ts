export type TagTarget = 'script' | 'show' | 'watch-entry' | 'watch-session'

export type TagDefinition = Readonly<{
  name: string
  parameters: readonly string[]
  target: TagTarget
}>

const simple = (names: readonly string[], target: TagTarget): readonly TagDefinition[] =>
  names.map((name) => ({ name, parameters: [], target }))

export const DEFAULT_TAGS: readonly TagDefinition[] = [
  ...simple(['NOT-ANIME', 'NOT-IN-MAL', 'MANGA', 'WEBTOON', 'COURSE', 'DORAMA'], 'show'),
  ...simple(['勉強', 'REWATCH'], 'watch-session'),
  ...simple(['UNSAFE-ORDER'], 'watch-entry'),
  { name: 'SCRIPT-SKIP', parameters: ['count'], target: 'script' },
]

export const findTagDefinition = (name: string): TagDefinition | undefined =>
  DEFAULT_TAGS.find((tag) => tag.name === name)
