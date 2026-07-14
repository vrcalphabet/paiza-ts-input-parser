import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { main: 'src/main.ts' },
  minify: {
    mangle: {
      toplevel: false,
    },
  },
  format: 'esm',
  outDir: 'dist',
  clean: true,
  // watch: true,
  deps: {
    skipNodeModulesBundle: true,
  },
  banner: `//! https://github.com/vrcalphabet/paiza-ts-input-parser`,
})
