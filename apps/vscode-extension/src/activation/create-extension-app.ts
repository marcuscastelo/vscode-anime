export type ExtensionAppDependencies = Readonly<{
  log: (message: string) => void
  start: () => readonly Disposable[]
}>

export type Disposable = Readonly<{ dispose: () => void }>

export type ExtensionApp = Readonly<{
  activate: () => void
  dispose: () => void
}>

export const createExtensionApp = (dependencies: ExtensionAppDependencies): ExtensionApp => {
  let active = false
  let disposables: readonly Disposable[] = []

  return {
    activate: () => {
      if (active) return
      active = true
      disposables = dependencies.start()
      dependencies.log('Marucs Anime activated')
    },
    dispose: () => {
      if (!active) return
      active = false
      for (const disposable of [...disposables].reverse()) disposable.dispose()
      disposables = []
      dependencies.log('Marucs Anime deactivated')
    },
  }
}
