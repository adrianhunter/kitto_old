import { defineConfig } from 'vite'

import dts from 'vite-plugin-dts'
import pluginKitto from './packages/vite-plugin/mod.ts'

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

const skipPlugins = [
  // 'vite:worker-import-meta-url',
]

export default defineConfig({
  plugins: [
    pluginKitto(),
    dts(),
    // {
    //   name: 'asd',
    //   configResolved(config) {
    //     config.plugins = config.plugins.filter((a) => {
    //       return !skipPlugins.includes(a.name)
    //     })
    //   },
    // },
  ],

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
    lib: {
      entry: [
        './mod.ts',
      ],
      formats: [
        'es',
      ],
    },

    emptyOutDir: false,
    outDir: 'packages',
    minify: false,
    target: 'esnext',

    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external(a, b, c) {
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
      output: {

        entryFileNames(a) {
          if (a.name.startsWith('packages')) {
            const [rootName, pkgName, ...rest] = a.name.split('/')
            const wow = [pkgName, 'dist', ...rest].join('/')
            console.log(wow)
            return `${wow}.js`
          }
          else {
            return 'xxx/dist/mod.js'
          }
        },
        esModule: true,
        preserveModules: true,
      },
    },
  },
})
