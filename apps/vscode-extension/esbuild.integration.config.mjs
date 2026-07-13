import { build } from 'esbuild'

await build({
  bundle: true,
  entryPoints: ['test/integration/suite.ts'],
  external: ['vscode'],
  format: 'cjs',
  logLevel: 'info',
  minify: false,
  outfile: 'dist-test/suite.cjs',
  platform: 'node',
  sourcemap: false,
  target: 'node18',
})
