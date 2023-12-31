import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import type { PackageJson, TSConfig } from 'pkg-types'
import { definePackageJSON, defineTSConfig, findWorkspaceDir, writePackageJSON, writeTSConfig } from 'pkg-types'
import civet from '@danielx/civet'

import * as jsonc from 'https://deno.land/std@0.197.0/jsonc/parse.ts'

// path from node:path

export async function exec(cmd: string) {
  const args = cmd.split(' ')
  const spawnedCmd = new Deno.Command(args[0], {
    args: args.slice(1),
  })

  const p = spawnedCmd.spawn()

  return await p.output()
}

interface WsFolder {
  path: string
  name?: string
}

interface WorkspaceJson {
  packages?: string | string[]
  folders: WsFolder[]
  settings: any

}

export class Workspace {
  externals: string[] = [
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
  ]

  // path: string
  constructor(
    public packages: string[],
    public projectName: string,
    public root: string,
    public wsFile: string,

    public json: WorkspaceJson,

  ) { }

  async upsertConfigFiles() {
    const rootTsConfig = createRootTsConfig(this)

    const childs = Promise.all(this.json.folders.map(async (a) => {
      if (a.path !== '.')
        return await updateWorkspaceFolder(a, this)
    }))

    await Promise.all(
      [
        childs,
        //         fs.writeFile(`${this.root}/pnpm-workspace.yaml`, `packages:
        //   - ${this.json.packages || 'packages/*'}

        // shared-workspace-lockfile: true
        //                       `),

        writeTSConfig(`${this.root}/tsconfig.json`, rootTsConfig),
        fs.writeFile(this.wsFile, JSON.stringify(this.json, null, 2)),

      ],

    )

    await fs.writeFile(`${this.root}/vite.config.ts`, await createViteDefaultConfig(this))
  }

  static async init() {
    const wsDir = await findWorkspaceDir()

    const projectName = path.basename(wsDir)
    const wsFile = `${wsDir}/${projectName}.code-workspace`
    const wsRaw = await fs.readFile(wsFile, 'utf-8')

    let dirSearch: string[] = []
    const json = jsonc.parse(wsRaw) as unknown as WorkspaceJson

    if (typeof json.packages === 'string')
      dirSearch.push(json.packages)

    else if (Array.isArray(json.packages) && typeof json.packages[0] === 'string')

      dirSearch = json.packages

    else
      throw new Error('xxx')

    const ws = new Workspace(dirSearch, projectName, wsDir, wsFile, json)

    const folders: string[] = []

    await Promise.all(dirSearch.map(async (p) => {
      if (p.endsWith('/*'))
        p = p.slice(0, p.length - 2)

      const r = await fs.readdir(p, {
        withFileTypes: true,
      })

      r.forEach((r) => {
        if (r.isDirectory())
          folders.push(`${p}/${r.name}`)
      })

      // return
    }))

    folders.push('.')

    // fs.readdir()

    // ws.folders = [

    // ]

    ws.json.folders = folders.flatMap((a) => {
      return {
        path: a,
      }
    })

    return ws

    // const ws = jsonc.parse(wsRaw) as unknown as Workspace
  }

  // folders: { path: string, name?: string }[]
}

export function createRootTsConfig(ws: Workspace) {
  const references = []

  ws.json.folders.forEach((a) => {
    if (a.path === '.')
      return

    references.push({
      path: `${a.path}/tsconfig.json`,
    })
  })
  return defineTSConfig(
    {
      files: [
      ],
      // @ts-expect-error asd
      references,
    })
}
export function createTsConfig(maybeDefault: TSConfig = {}) {
  return defineTSConfig({

    compilerOptions: {
      lib: [
        'ESNext',
        'DOM',
      ],
      module: 'esnext',
      target: 'esnext',
      composite: true,
      resolveJsonModule: true,
      moduleResolution: 'Bundler',
      experimentalDecorators: true,
      emitDeclarationOnly: true,
      allowImportingTsExtensions: true,
      allowArbitraryExtensions: true,
      outDir: 'dist',
      isolatedModules: true,
      downlevelIteration: true,
      jsx: 'preserve',
      declarationMap: true,
      declaration: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      forceConsistentCasingInFileNames: true,
      allowJs: true,
    },
    // @ts-expect-error asd
    reflection: false,
    include: [
      'auto-imports.d.ts',
      'auto-imports-scrypt.d.ts',
      '../../auto-imports-scrypt.d.ts',
      '../../auto-imports.d.ts',

      '*.ts',
      '**/*.ts',
      '*.tsx',
      '**/*.tsx',
      '*.mjs',
      '**/*.mjs',
      '*.js',
      '**/*.js',
      '../../global.d.ts',
    ],
    exclude: [
      'dist',
      'node_modules',
    ],
    ...maybeDefault,

    // compilerOptions: {
    //   outDir: 'dist',
    // },
    // include: ['**/*.ts', 'pkg.ts'],
    // exclude: ['dist', 'node_modules'],
  })
}

export function createPkgJson(name: string) {
  return definePackageJSON({
    name,
    type: 'module',
    files: [
      'dist',
    ],
    dependencies: {},
  })
}

export async function updateProject() {
  const ws = await Workspace.init()

  await ws.upsertConfigFiles()
}

export async function updateWorkspaceFolder(p: WsFolder, ws: Workspace) {
  const dirname = p.name || path.basename(p.path)

  let defaultConfig: PackageJson = {
    name: `@${ws.projectName}/${dirname}`,
    exports: {
      '.': './dist/mod.js',
      './*.js': './dist/*.js',
      './package.json': './package.json',

    },
    scripts: {
      'dev': 'vite',
      'build': 'vite build',
      'build:watch': 'vite build -w',

      'check': 'tsc -b',
    },
    dependencies: {
    },
    files: [
      'dist',
    ],
    type: 'module',

  }

  try {
    // Deno.readTextFile(``)
    const pkgPath = `${ws.root}/${p.path}/pkg.civet`

    const src = await fs.readFile(pkgPath, 'utf-8')

    let jsCode = civet.compile(src, {
      js: true,
    })

    // if (jsCode)

    jsCode = jsCode.replace('export default Pkg(', 'export default (')

    const wow = await import(

      URL.createObjectURL(new Blob([
        jsCode,
      ], { type: 'application/javascript' }))
    )

    defaultConfig = definePackageJSON({
      ...defaultConfig,
      ...wow.default,

    })
  }
  catch (e) {
    try {
      const wow = await import(`${ws.root}/${p.path}/pkg.ts`)

      defaultConfig = definePackageJSON({
        ...defaultConfig,
        ...wow.default,

      })
    }
    catch (e) {

    }

    // console.error(e)
  }

  ws.externals.push(...[...Object.keys(defaultConfig.dependencies || {}), ...Object.keys(defaultConfig.devDependencies || {}), ...Object.keys(defaultConfig.peerDependencies || {})])

  Promise.all([

    writePackageJSON(`${p.path}/package.json`, defaultConfig),

    writeTSConfig(`${p.path}/tsconfig.json`, createTsConfig(defaultConfig.tsconfig)),

  ])
}

export async function emitViteDevConfig() {
  await fs.writeFile(`${process.cwd()}/vite.config.ts`, await createViteDefaultDevConfig())
}

export async function createViteDefaultDevConfig() {
  return await fs.readFile(new URL('./tmpls/vite.pkg.confit.ts', import.meta.url).pathname)
}

export async function createViteDefaultConfig(ws?: Workspace) {
  const viteEntries = []

  ws.json.folders.forEach((a) => {
    if (a.path === '.')
      return

    viteEntries.push(`${a.path}/mod.ts`)
  })

  const viteConfigFile = await fs.readFile(new URL('./tmpls/vite.proj.config.ts', import.meta.url).pathname, 'utf-8')

  // const viteConfig = {

  //   build: {
  //     lib: {
  //       entry: viteEntries,
  //       formats: ['es'],
  //     },

  //     rollupOptions: {
  //       external: ws.externals,

  //       output: {

  //       },
  //     },
  //   },
  // }

  return viteConfigFile
}

// import * as x from ""

export async function installPackage() {

}
