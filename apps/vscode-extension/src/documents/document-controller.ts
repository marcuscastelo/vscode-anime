import type { ParseAnlResult } from '@marucs-anime/core'

export type DocumentSnapshot = Readonly<{ text: string; uri: string; version: number }>

export type ParsedDocumentState = DocumentSnapshot & Readonly<{ result: ParseAnlResult }>

export type Scheduler = Readonly<{
  cancel: (handle: unknown) => void
  schedule: (callback: () => void, delayMs: number) => unknown
}>

export type DocumentController = Readonly<{
  close: (uri: string) => void
  dispose: () => void
  get: (uri: string) => ParsedDocumentState | undefined
  update: (snapshot: DocumentSnapshot, delayMs?: number) => void
}>

export type DocumentControllerDependencies = Readonly<{
  onParsed: (state: ParsedDocumentState) => void
  parse: (source: string) => ParseAnlResult
  scheduler: Scheduler
}>

export const systemScheduler: Scheduler = {
  cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  schedule: (callback, delayMs) => setTimeout(callback, delayMs),
}

export const createDocumentController = (
  dependencies: DocumentControllerDependencies,
): DocumentController => {
  const states = new Map<string, ParsedDocumentState>()
  const pending = new Map<string, unknown>()

  const cancelPending = (uri: string): void => {
    const handle = pending.get(uri)
    if (handle !== undefined) dependencies.scheduler.cancel(handle)
    pending.delete(uri)
  }

  const close = (uri: string): void => {
    cancelPending(uri)
    states.delete(uri)
  }

  return {
    close,
    dispose: () => {
      for (const uri of pending.keys()) cancelPending(uri)
      states.clear()
    },
    get: (uri) => states.get(uri),
    update: (snapshot, delayMs = 0) => {
      cancelPending(snapshot.uri)
      const handle = dependencies.scheduler.schedule(() => {
        pending.delete(snapshot.uri)
        const state = { ...snapshot, result: dependencies.parse(snapshot.text) }
        states.set(snapshot.uri, state)
        dependencies.onParsed(state)
      }, delayMs)
      pending.set(snapshot.uri, handle)
    },
  }
}
