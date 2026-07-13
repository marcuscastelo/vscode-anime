import { commands, type TextEditor, window } from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import { type Clock, formatLocalDate, formatLocalTime } from '../clock/clock.js'
import type { DocumentController } from '../documents/document-controller.js'
import { planTimeInsertion } from './date-time-plans.js'

export const INSERT_DATE_COMMAND = 'marucs-anime.insertDate'
export const INSERT_TIME_COMMAND = 'marucs-anime.insertTime'

const singleCursor = (editor: TextEditor): boolean => {
  const supported = editor.selections.length === 1 && editor.selection.isEmpty
  if (!supported) {
    void window.showInformationMessage(
      "Marucs' Anime commands require one cursor with no selected text.",
    )
  }
  return supported
}

const dateAtLine = (controller: DocumentController, editor: TextEditor): string | undefined => {
  const state = controller.get(editor.document.uri.toString())
  if (state === undefined) return undefined
  return state.result.document.dates
    .filter((date) => date.line <= editor.selection.active.line)
    .at(-1)?.value
}

const insert = async (editor: TextEditor, text: string): Promise<void> => {
  await editor.edit((builder) => builder.insert(editor.selection.active, text))
}

export const registerDateTimeCommands = (
  controller: DocumentController,
  clock: Clock,
): Disposable => {
  const insertTime = async (editor: TextEditor): Promise<void> => {
    if (!singleCursor(editor)) return
    const now = clock.now()
    const line = editor.document.lineAt(editor.selection.active.line)
    if (editor.selection.active.character !== line.text.length) return
    const currentDocumentDate = dateAtLine(controller, editor)
    const plan = planTimeInsertion({
      ...(currentDocumentDate === undefined ? {} : { currentDocumentDate }),
      lineText: line.text,
      time: formatLocalTime(now),
      today: formatLocalDate(now),
    })
    if (plan.tag === 'no-change') return
    if (plan.warning !== undefined) {
      const choice = await window.showWarningMessage(
        plan.warning,
        { modal: true },
        'Insert time anyway',
      )
      if (choice !== 'Insert time anyway') return
    }
    await insert(editor, plan.text)
  }

  const subscriptions = [
    commands.registerTextEditorCommand(INSERT_DATE_COMMAND, (editor, edit) => {
      if (!singleCursor(editor)) return
      edit.insert(editor.selection.active, formatLocalDate(clock.now()))
    }),
    commands.registerTextEditorCommand(INSERT_TIME_COMMAND, (editor) => {
      void insertTime(editor)
    }),
  ]

  return {
    dispose: () => {
      for (const subscription of subscriptions) subscription.dispose()
    },
  }
}
