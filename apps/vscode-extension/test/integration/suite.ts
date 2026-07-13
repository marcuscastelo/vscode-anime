import * as vscode from 'vscode'

const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message)
}

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const waitFor = async (predicate: () => boolean, message: string): Promise<void> => {
  const deadline = Date.now() + 5_000
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error(message)
    await delay(25)
  }
}

const waitForAsync = async (predicate: () => Promise<boolean>, message: string): Promise<void> => {
  const deadline = Date.now() + 5_000
  while (!(await predicate())) {
    if (Date.now() >= deadline) throw new Error(message)
    await delay(25)
  }
}

const open = async (content: string): Promise<vscode.TextEditor> => {
  const document = await vscode.workspace.openTextDocument({ content, language: 'anime-list' })
  return vscode.window.showTextDocument(document)
}

const setCursor = (editor: vscode.TextEditor, line: number, character: number): void => {
  const position = new vscode.Position(line, character)
  editor.selection = new vscode.Selection(position, position)
}

export const run = async (): Promise<void> => {
  const extension = vscode.extensions.getExtension('Marucs.marucs-anime')
  assert(extension !== undefined, 'Development extension was not discovered')
  await extension.activate()
  assert(extension.isActive, 'Extension did not activate')

  const editor = await open(`01/04/2022
Frieren:
20:00 - 20:24 01
`)
  const uri = editor.document.uri
  await waitFor(
    () => vscode.languages.getDiagnostics(uri).length === 0,
    'Initial document did not finish parsing',
  )

  let symbols: vscode.DocumentSymbol[] | undefined
  await waitForAsync(async () => {
    symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      uri,
    )
    return (symbols?.length ?? 0) > 0
  }, 'Document did not finish parsing for symbols')
  assert(symbols?.[0]?.name === 'Frieren', 'Document symbols did not include the show')

  const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    new vscode.Position(2, 0),
  )
  assert((hovers?.length ?? 0) > 0, 'Hover provider returned no result')

  const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeDefinitionProvider',
    uri,
    new vscode.Position(1, 2),
  )
  assert(definitions?.[0]?.range.start.line === 1, 'Definition did not resolve first declaration')

  const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
    'vscode.executeCompletionItemProvider',
    uri,
    new vscode.Position(3, 0),
  )
  assert(
    completions?.items.some((item) =>
      typeof item.label === 'string' ? item.label === 'Frieren' : item.label.label === 'Frieren',
    ),
    'Local completion did not include the show',
  )

  setCursor(editor, 3, 0)
  await vscode.commands.executeCommand('marucs-anime.insertNextEpisode')
  assert(editor.document.lineAt(3).text === '02', 'Next episode command inserted the wrong value')

  const dateEditor = await open('')
  await vscode.commands.executeCommand('marucs-anime.insertDate')
  assert(/^\d{2}\/\d{2}\/\d{4}$/u.test(dateEditor.document.getText()), 'Date command failed')

  const today = dateEditor.document.getText()
  const timeEditor = await open(`${today}\n`)
  await delay(50)
  setCursor(timeEditor, 1, 0)
  await vscode.commands.executeCommand('marucs-anime.insertTime')
  await waitFor(
    () => /^\d{2}:\d{2} - $/u.test(timeEditor.document.lineAt(1).text),
    'Time command failed',
  )

  const invalidEditor = await open('not an anl line')
  await waitFor(
    () => vscode.languages.getDiagnostics(invalidEditor.document.uri).length === 1,
    'Invalid line diagnostic was not published',
  )
}
