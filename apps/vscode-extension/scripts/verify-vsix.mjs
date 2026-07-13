import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const [input] = process.argv.slice(2)
if (input === undefined) throw new Error('Usage: verify-vsix.mjs <path-to-vsix>')
const vsix = resolve(input)
if (!existsSync(vsix)) throw new Error(`VSIX not found: ${vsix}`)

const unzip = (args) => {
  const result = spawnSync('unzip', args, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || `unzip failed: ${args.join(' ')}`)
  return result.stdout
}

const files = unzip(['-Z1', vsix]).trim().split('\n')
const required = [
  'extension/package.json',
  'extension/dist/extension.cjs',
  'extension/syntaxes/anime-list.tmLanguage.json',
  'extension/readme.md',
]
for (const file of required) {
  if (!files.includes(file)) throw new Error(`VSIX is missing required file: ${file}`)
}

const forbidden = [/^extension\/src\//u, /^extension\/test\//u, /coverage/u, /\.map$/u]
for (const file of files) {
  if (forbidden.some((pattern) => pattern.test(file))) {
    throw new Error(`VSIX contains forbidden file: ${file}`)
  }
}

const manifest = JSON.parse(unzip(['-p', vsix, 'extension/package.json']))
const entryPoint = `extension/${String(manifest.main).replace(/^\.\//u, '')}`
if (!files.includes(entryPoint)) throw new Error(`Manifest entry point is missing: ${entryPoint}`)

console.info(`Verified ${files.length} VSIX entries and main ${manifest.main}`)
