import { parseAnlDocument } from '@marucs-anime/core'
import { describe, expect, it, vi } from 'vitest'

import {
  createDocumentController,
  type Scheduler,
} from '../../src/documents/document-controller.js'

const createManualScheduler = () => {
  const callbacks = new Map<number, () => void>()
  let nextHandle = 0
  const scheduler: Scheduler = {
    cancel: (handle) => {
      callbacks.delete(handle as number)
    },
    schedule: (callback) => {
      const handle = nextHandle++
      callbacks.set(handle, callback)
      return handle
    },
  }
  return {
    flush: () => {
      for (const [handle, callback] of [...callbacks]) {
        callbacks.delete(handle)
        callback()
      }
    },
    scheduler,
  }
}

describe('document controller', () => {
  it('parses initial documents synchronously', () => {
    const manual = createManualScheduler()
    const onParsed = vi.fn()
    const controller = createDocumentController({
      onParsed,
      parse: parseAnlDocument,
      scheduler: manual.scheduler,
    })
    controller.update({ text: '01/01/2022', uri: 'file:///a.anl', version: 1 })
    expect(controller.get('file:///a.anl')).toBeDefined()
    expect(onParsed).toHaveBeenCalledTimes(1)
  })

  it('keeps only the latest scheduled version', () => {
    const manual = createManualScheduler()
    const onParsed = vi.fn()
    const controller = createDocumentController({
      onParsed,
      parse: parseAnlDocument,
      scheduler: manual.scheduler,
    })

    controller.update({ text: '01/01/2022', uri: 'file:///a.anl', version: 1 }, 100)
    controller.update({ text: '02/01/2022', uri: 'file:///a.anl', version: 2 }, 100)
    manual.flush()

    expect(onParsed).toHaveBeenCalledTimes(1)
    expect(controller.get('file:///a.anl')?.version).toBe(2)
  })

  it('isolates documents and removes closed state', () => {
    const manual = createManualScheduler()
    const controller = createDocumentController({
      onParsed: () => undefined,
      parse: parseAnlDocument,
      scheduler: manual.scheduler,
    })
    controller.update({ text: '01/01/2022', uri: 'file:///a.anl', version: 1 })
    controller.update({ text: '02/01/2022', uri: 'file:///b.anl', version: 1 })
    manual.flush()

    expect(controller.get('file:///a.anl')?.result.document.dates[0]?.value).toBe('01/01/2022')
    expect(controller.get('file:///b.anl')?.result.document.dates[0]?.value).toBe('02/01/2022')
    controller.close('file:///a.anl')
    expect(controller.get('file:///a.anl')).toBeUndefined()
    expect(controller.get('file:///b.anl')).toBeDefined()
  })

  it('cancels every pending parse on dispose', () => {
    const manual = createManualScheduler()
    const onParsed = vi.fn()
    const controller = createDocumentController({
      onParsed,
      parse: parseAnlDocument,
      scheduler: manual.scheduler,
    })
    controller.update({ text: '', uri: 'file:///a.anl', version: 1 }, 100)
    controller.dispose()
    manual.flush()
    expect(onParsed).not.toHaveBeenCalled()
  })
})
