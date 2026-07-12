export type TimeInsertionPlan =
  | Readonly<{ reason: 'unsupported-line'; tag: 'no-change' }>
  | Readonly<{ text: string; tag: 'insert'; warning?: string }>

export const planTimeInsertion = (
  input: Readonly<{
    currentDocumentDate?: string
    lineText: string
    time: string
    today: string
  }>,
): TimeInsertionPlan => {
  const empty = /^\s*$/u.test(input.lineText)
  const startOnly = /^\s*\d{2}:\d{2}\s*$/u.test(input.lineText)
  const startAndDash = /^\s*\d{2}:\d{2}\s*-\s*$/u.test(input.lineText)
  if (!empty && !startOnly && !startAndDash) {
    return { reason: 'unsupported-line', tag: 'no-change' }
  }

  const text = empty ? `${input.time} - ` : startOnly ? ` - ${input.time} ` : ` ${input.time} `
  const warning =
    input.currentDocumentDate === input.today
      ? undefined
      : `The current ANL date is ${input.currentDocumentDate ?? 'not defined'}; today is ${input.today}.`
  return { tag: 'insert', text, ...(warning === undefined ? {} : { warning }) }
}
