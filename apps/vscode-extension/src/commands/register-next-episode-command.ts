import { commands, type TextEditor, window } from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import type { DocumentController } from '../documents/document-controller.js'
import { planNextEpisode } from './next-episode-plan.js'

export const INSERT_NEXT_EPISODE_COMMAND = 'marucs-anime.insertNextEpisode'

const insertNextEpisode = async (
  editor: TextEditor,
  controller: DocumentController,
): Promise<void> => {
  if (editor.selections.length !== 1 || !editor.selection.isEmpty) return
  const state = controller.get(editor.document.uri.toString())
  if (state === undefined) return
  const plan = planNextEpisode(state.result.document, editor.selection.active.line)
  if (plan.tag === 'no-change') {
    await window.showInformationMessage('No anime is selected at the current line.')
    return
  }
  await editor.edit((builder) => builder.insert(editor.selection.active, plan.text))
}

export const registerNextEpisodeCommand = (controller: DocumentController): Disposable => {
  const subscription = commands.registerTextEditorCommand(INSERT_NEXT_EPISODE_COMMAND, (editor) => {
    void insertNextEpisode(editor, controller)
  })
  return {
    dispose: () => {
      subscription.dispose()
    },
  }
}
