export type ExtensionAppDependencies = Readonly<{
  log: (message: string) => void
}>

export type ExtensionApp = Readonly<{
  activate: () => void
  dispose: () => void
}>

export const createExtensionApp = (dependencies: ExtensionAppDependencies): ExtensionApp => {
  let active = false

  return {
    activate: () => {
      if (active) return
      active = true
      dependencies.log('Marucs Anime activated')
    },
    dispose: () => {
      if (!active) return
      active = false
      dependencies.log('Marucs Anime deactivated')
    },
  }
}
