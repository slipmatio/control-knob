/// <reference types="vitest" />
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { version as pkgVersion } from './package.json'

process.env.VITE_APP_VERSION = pkgVersion
if (process.env.NODE_ENV === 'production') {
  process.env.VITE_APP_BUILD_EPOCH = new Date().getTime().toString()
}

export default defineConfig({
  plugins: [
    vue({
      script: {
        refSugar: true,
      },
    }),
    dts({
      staticImport: true,
      // copyDtsFiles: false,
      // skipDiagnostics: false,
      // logDiagnostics: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    environment: 'happy-dom',
    include: ['tests/{component,unit}/**/*.{test,spec}.ts'],
  },

  build: {
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: './src/lib.ts',
      name: 'ControlKnob',
      fileName: (format) => `index.${format}.js`,
    },

    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
