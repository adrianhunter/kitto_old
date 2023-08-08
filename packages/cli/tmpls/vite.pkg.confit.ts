
import { defineConfig } from 'vite'

import kittoPlugin from '@kitto/vite-plugin'

const externals = [
  'node:assert',
  'node:async_hooks',
  'node:buffer',
  'node:child_process',
  'node:cluster',
  'node:console',
  'node:constants',
  'node:crypto',
  'node:dgram',
  'node:dns',
  'node:domain',
  'node:events',
  'node:fs',
  'node:fs/promises',
  'node:http',
  'node:http2',
  'node:https',
  'node:inspector',
  'node:module',
  'node:net',
  'node:os',
  'node:path',
  'node:perf_hooks',
  'node:process',
  'node:punycode',
  'node:querystring',
  'node:readline',
  'node:repl',
  'node:stream',
  'node:string_decoder',
  'node:sys',
  'node:timers',
  'node:tls',
  'node:trace_events',
  'node:tty',
  'node:url',
  'node:util',
  'node:v8',
  'node:vm',
  'node:wasi',
  'node:worker_threads',
  'node:zlib',
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
  '@rollup/pluginutils',
  '@phenomnomnominal/tsquery',
  '@types/node',
  'scrypt-ts-transpiler',
  'ts-morph',
  'unplugin-auto-import',
  'vite-plugin-inspect',
  'vite-plugin-node-polyfills',
  'vite-tsconfig-paths',
  'typescript',
  'scrypt-ts',
  'scrypt-ts-transpiler',
  'scryptlib',
  'vite',
  'citty',
  'consola',
  'pkg-types',
]

export default defineConfig({
  plugins: [
    kittoPlugin(),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',

    rollupOptions: {

      external: externals,

      output: {

        // preserveModules: true,
        esModule: true,

        format: 'esm',
      },
    },
  },

  build: {

    rollupOptions: {

      external(a, b, c) {
        if (a === 'better-sqlite3')
          return false

        if (externals.includes(a))
          return true
        if (a.includes('node_modules/.pnpm'))
          return true
        if (a.startsWith('npm:'))
          return true

        if (!a.startsWith('.') && !a.startsWith('/'))
          return true
        return false
      },
    },
  },

  resolve: {

    alias: {
      'better-sqlite3': 'http://localhost:5173/better-sqlite3.mjs',

      '/sw.js': '/Users/X/Documents/GitHub/kitto/packages/examples/node_modules/@kitto/app/dist/sw.js',
    },
  },
  optimizeDeps: {

    // include: ["@deepkit/type-compiler" , "@deepkit/vite"],

    needsInterop: [
    ],

    esbuildOptions: {

      target: 'esnext',
    },
    exclude: [
      // "@deepkit/sqlite", "@deepkit/orm",

      '@sqlite.org/sqlite-wasm'],
  },
})
