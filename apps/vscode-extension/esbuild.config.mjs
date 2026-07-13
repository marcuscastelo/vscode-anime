import { build } from 'esbuild'

await build({
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  format: 'cjs',
  logLevel: 'info',
  minify: false,
  outfile: 'dist/extension.cjs',
  platform: 'node',
  sourcemap: true,
  target: 'node18',
})
