import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const script = fileURLToPath(import.meta.url)
const candidate = resolve(import.meta.dirname, '..')
const { build } = createRequire(resolve(candidate, 'apps/vscode-extension/package.json'))('esbuild')

if (process.argv[2] === '--worker') {
  const root = resolve(process.argv[3])
  const domainPackage = existsSync(resolve(root, 'packages/anl-adapter')) ? 'anl-adapter' : 'core'
  const temp = mkdtempSync(resolve(tmpdir(), 'anime-behavior-'))
  try {
    const app = resolve(root, 'apps/vscode-extension/src')
    const modulePath = resolve(temp, 'worker.mjs')
    await build({
      stdin: {
        contents: `
          export * from ${JSON.stringify(resolve(root, `packages/${domainPackage}/src/index.ts`))};
          export * from ${JSON.stringify(resolve(app, 'providers/document-insight.ts'))};
          export * from ${JSON.stringify(resolve(app, 'completion/local-completion.ts'))};
          export * from ${JSON.stringify(resolve(app, 'commands/next-episode-plan.ts'))};
          export * from ${JSON.stringify(resolve(app, 'commands/date-time-plans.ts'))};
        `,
        resolveDir: root,
        loader: 'ts',
      },
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: modulePath,
    })
    const api = await import(pathToFileURL(modulePath).href)
    const cases = JSON.parse(readFileSync(0, 'utf8'))
    const outputs = cases.map((source) => {
      try {
        const parsed = api.parseAnlDocument(source)
        const document = parsed.document
        return {
          parsed,
          symbols: api.listDocumentSymbolInsights(document),
          definitions: document.shows.map((show) =>
            api.definitionInsightForTitle(document, show.title),
          ),
          next: document.shows.map((show) => api.calculateNextEpisode(document, show.title)),
          lines: source.split('\n').map((text, line) => ({
            next: api.planNextEpisode(document, line),
            hover: api.hoverInsightAtLine(document, line),
            completions: api.localCompletionsAt(document, text, text.length),
          })),
          completions: ['', 'F', '{', '{friend, ', '[', '[RE'].map((text) =>
            api.localCompletionsAt(document, text, text.length),
          ),
          time: ['', '20:00', '20:00 -', '20:00 - ', 'bad'].map((lineText) =>
            api.planTimeInsertion({
              lineText,
              time: '20:20',
              today: '12/10/2026',
              currentDocumentDate: '12/10/2026',
            }),
          ),
        }
      } catch (error) {
        return { error: { name: error.name, message: error.message } }
      }
    })
    process.stdout.write(JSON.stringify(outputs))
  } finally {
    rmSync(temp, { recursive: true })
  }
} else {
  const baseline = process.argv[2]
  if (!baseline) throw new Error('Usage: node scripts/compare-anl-behavior.mjs <baseline-checkout>')
  let seed = 20261012
  const random = (n) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed % n
  }
  const fixtures = resolve(candidate, 'packages/anl-adapter/test/fixtures')
  const cases = [
    '',
    ' ',
    'bad',
    '20:00 - 20:20 01',
    'Frieren:',
    ...readdirSync(fixtures)
      .filter((name) => name.endsWith('.anl'))
      .map((name) => readFileSync(resolve(fixtures, name), 'utf8')),
  ]
  const tokens = [
    '',
    '// comment',
    'Frieren:',
    '進撃の巨人:',
    'Other:',
    '12/10/2026',
    '13/10/2026',
    '31/02/2026',
    '20:00 - 20:20 01',
    '20:20 - 20:40 02 {friend}',
    '23:55 - 00:10 --',
    '25:00 - 20:20 02',
    'bad',
    '[REWATCH]',
    '[NOT-ANIME]',
    '[UNSAFE-ORDER]',
    '[SCRIPT-SKIP(count=2)]',
    '  Frieren: // mention',
    '20:40 - 21:00 03 {other, friend}',
  ]
  for (let i = 0; i < 500; i++) {
    cases.push(
      Array.from({ length: 1 + random(30) }, () => tokens[random(tokens.length)]).join('\n'),
    )
  }
  const run = (root) =>
    JSON.parse(
      execFileSync(process.execPath, [script, '--worker', root], {
        input: JSON.stringify(cases),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      }),
    )
  const before = run(baseline)
  const after = run(candidate)
  const differences = cases.flatMap((source, index) =>
    JSON.stringify(before[index]) === JSON.stringify(after[index])
      ? []
      : [{ index, source, before: before[index], after: after[index] }],
  )
  console.log(JSON.stringify({ seed: 20261012, cases: cases.length, differences }, null, 2))
  if (differences.length) process.exitCode = 1
}
