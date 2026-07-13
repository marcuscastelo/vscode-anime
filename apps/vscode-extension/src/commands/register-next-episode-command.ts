import { commands, window } from 'vscode'

import type { Disposable } from '../activation/create-extension-app.js'
import type { DocumentController } from '../documents/document-controller.js'
import { planNextEpisode } from './next-episode-plan.js'

export const INSERT_NEXT_EPISODE_COMMAND = 'marucs-anime.insertNextEpisode'

export const registerNextEpisodeCommand = (controller: DocumentController): Disposable => {
  const subscription = commands.registerTextEditorCommand(
    INSERT_NEXT_EPISODE_COMMAND,
    (editor, edit) => {
      if (editor.selections.length !== 1 || !editor.selection.isEmpty) {
        void window.showInformationMessage(
          "Marucs' Anime commands require one cursor with no selected text.",
        )
        return
      }
      const state = controller.get(editor.document.uri.toString())
      if (state === undefined) return
      const plan = planNextEpisode(state.result.document, editor.selection.active.line)
      if (plan.tag === 'no-change') {
        void window.showInformationMessage('No anime is selected at the current line.')
        return
      }
      edit.insert(editor.selection.active, plan.text)
    },
  )
  return {
    dispose: () => {
      subscription.dispose()
    },
  }
}
