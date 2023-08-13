/* eslint-disable optimal-modules/no-named-exports */
// import { type ConfigEnv, type InlineConfig, type Logger, type PackageCache, type Plugin, type PluginHookUtils, type ResolvedConfig, type ResolvedServerOptions, type ServerOptions, type UserConfig } from 'vite'


import { createLogger } from "./logger.ts"
import { CLIENT_ENTRY, ENV_ENTRY, ESBUILD_MODULES_TARGET, FS_PREFIX, NULL_BYTE_PLACEHOLDER, VALID_ID_PREFIX } from './constants.ts'

type HookHandler<T> = any
const VOLUME_RE = /^[A-Z]:/i
import path from "node:path"
import os from "node:os"



export const isWindows = os.platform() === 'win32'

import colors from 'npm:picocolors'
const windowsSlashRE = /\\/g
export function slash(p: string): string {
  return p.replace(windowsSlashRE, '/')
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

export function createPluginHookUtils(
  plugins: readonly Plugin[],
): PluginHookUtils {
  // sort plugins per hook
  const sortedPluginsCache = new Map<keyof Plugin, Plugin[]>()
  function getSortedPlugins(hookName: keyof Plugin): Plugin[] {
    if (sortedPluginsCache.has(hookName))
      return sortedPluginsCache.get(hookName)!
    const sorted = getSortedPluginsByHook(hookName, plugins)
    sortedPluginsCache.set(hookName, sorted)
    return sorted
  }
  function getSortedPluginHooks<K extends keyof Plugin>(
    hookName: K,
  ): NonNullable<HookHandler<Plugin[K]>>[] {
    const plugins = getSortedPlugins(hookName)
    return plugins
      .map((p) => {
        const hook = p[hookName]!
        return typeof hook === 'object' && 'handler' in hook
          ? hook.handler
          : hook
      })
      .filter(Boolean)
  }

  return {
    getSortedPlugins,
    getSortedPluginHooks,
  }
}

export function getSortedPluginsByHook(
  hookName: keyof Plugin,
  plugins: readonly Plugin[],
): Plugin[] {
  const pre: Plugin[] = []
  const normal: Plugin[] = []
  const post: Plugin[] = []
  for (const plugin of plugins) {
    const hook = plugin[hookName]
    if (hook) {
      if (typeof hook === 'object') {
        if (hook.order === 'pre') {
          pre.push(plugin)
          continue
        }
        if (hook.order === 'post') {
          post.push(plugin)
          continue
        }
      }
      normal.push(plugin)
    }
  }
  return [...pre, ...normal, ...post]
}
export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}
export const externalRE = /^(https?:)?\/\//
export const isExternalUrl = (url: string): boolean => externalRE.test(url)

export function arraify<T>(target: T | T[]): T[] {
  return Array.isArray(target) ? target : [target]
}
/**
 * Undo {@link wrapId}'s `/@id/` and null byte replacements.
 */
export function unwrapId(id: string): string {
  return id.startsWith(VALID_ID_PREFIX)
    ? id.slice(VALID_ID_PREFIX.length).replace(NULL_BYTE_PLACEHOLDER, '\0')
    : id
}
const splitRE = /\r?\n/
const postfixRE = /[?#].*$/s
export function cleanUrl(url: string): string {
  return url.replace(postfixRE, '')
}
export function numberToPos(
  source: string,
  offset: number | { line: number; column: number },
): { line: number; column: number } {
  if (typeof offset !== 'number')
    return offset
  if (offset > source.length) {
    throw new Error(
      `offset is longer than source length! offset ${offset} > length ${source.length}`,
    )
  }
  const lines = source.split(splitRE)
  let counted = 0
  let line = 0
  let column = 0
  for (; line < lines.length; line++) {
    const lineLength = lines[line].length + 1
    if (counted + lineLength >= offset) {
      column = offset - counted + 1
      break
    }
    counted += lineLength
  }
  return { line: line + 1, column }
}
const range: number = 2
export function generateCodeFrame(
  source: string,
  start: number | { line: number; column: number } = 0,
  end?: number,
): string {
  start = posToNumber(source, start)
  end = end || start
  const lines = source.split(splitRE)
  let count = 0
  const res: string[] = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length)
          continue
        const line = j + 1
        res.push(
          `${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]
          }`,
        )
        const lineLength = lines[j].length
        if (j === i) {
          // push underline
          const pad = Math.max(start - (count - lineLength) + 1, 0)
          const length = Math.max(
            1,
            end > count ? lineLength - pad : end - start,
          )
          res.push(`   |  ${' '.repeat(pad)}${'^'.repeat(length)}`)
        }
        else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1)
            res.push(`   |  ${'^'.repeat(length)}`)
          }
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}

export function posToNumber(
  source: string,
  pos: number | { line: number; column: number },
): number {
  if (typeof pos === 'number')
    return pos
  const lines = source.split(splitRE)
  const { line, column } = pos
  let start = 0
  for (let i = 0; i < line - 1 && i < lines.length; i++)
    start += lines[i].length + 1

  return start + column
}



import process from "node:process"
import { LogLevel } from 'npm:scrypt-ts@^1.3.1'
import pluginKitto from './pluginKitto.ts'

export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
): Promise<ResolvedConfig> {
  let config = inlineConfig
  let configFileDependencies: string[] = []
  let mode = inlineConfig.mode || defaultMode
  const isNodeEnvSet = !!process.env.NODE_ENV
  const packageCache: PackageCache = new Map()

  // some dependencies e.g. @vue/compiler-* relies on NODE_ENV for getting
  // production-specific behavior, so set it early on
  if (!isNodeEnvSet) {
    process.env.NODE_ENV = defaultNodeEnv
  }

  const configEnv = {
    mode,
    command,
    ssrBuild: !!config.build?.ssr,
  }

  let { configFile } = config
  // if (configFile !== false) {
  //   const loadResult = await loadConfigFromFile(
  //     configEnv,
  //     configFile,
  //     config.root,
  //     config.logLevel,
  //   )
  //   if (loadResult) {
  //     config = mergeConfig(loadResult.config, config)
  //     configFile = loadResult.path
  //     configFileDependencies = loadResult.dependencies
  //   }
  // }

  // user config may provide an alternative mode. But --mode has a higher priority
  mode = inlineConfig.mode || config.mode || mode
  configEnv.mode = mode

  const filterPlugin = (p: Plugin) => {
    if (!p) {
      return false
    } else if (!p.apply) {
      return true
    } else if (typeof p.apply === 'function') {
      return p.apply({ ...config, mode }, configEnv)
    } else {
      return p.apply === command
    }
  }
  // Some plugins that aren't intended to work in the bundling of workers (doing post-processing at build time for example).
  // And Plugins may also have cached that could be corrupted by being used in these extra rollup calls.
  // So we need to separate the worker plugin from the plugin that vite needs to run.
  const rawWorkerUserPlugins = (
    (await asyncFlatten(config.worker?.plugins || [])) as Plugin[]
  ).filter(filterPlugin)

  // resolve plugins
  const rawUserPlugins = (
    (await asyncFlatten(config.plugins || [])) as Plugin[]
  ).filter(filterPlugin)

  const [prePlugins, normalPlugins, postPlugins] =
    sortUserPlugins(rawUserPlugins)

  // run config hooks
  const userPlugins = [...prePlugins, ...normalPlugins, ...postPlugins]
  config = await runConfigHook(config, userPlugins, configEnv)

  // If there are custom commonjsOptions, don't force optimized deps for this test
  // even if the env var is set as it would interfere with the playground specs.
  if (
    !config.build?.commonjsOptions &&
    process.env.VITE_TEST_WITHOUT_PLUGIN_COMMONJS
  ) {
    config = mergeConfig(config, {
      optimizeDeps: { disabled: false },
      ssr: { optimizeDeps: { disabled: false } },
    })
    config.build ??= {}
    config.build.commonjsOptions = { include: [] }
  }

  // Define logger
  const logger = createLogger(config.logLevel, {
    allowClearScreen: config.clearScreen,
    customLogger: config.customLogger,
  })

  // resolve root
  const resolvedRoot = normalizePath(
    config.root ? path.resolve(config.root) : process.cwd(),
  )

  const clientAlias = [
    {
      find: /^\/?@vite\/env/,
      replacement: path.posix.join(FS_PREFIX, normalizePath(ENV_ENTRY)),
    },
    {
      find: /^\/?@vite\/client/,
      replacement: path.posix.join(FS_PREFIX, normalizePath(CLIENT_ENTRY)),
    },
  ]

  // resolve alias with internal client alias
  const resolvedAlias = config.resolve?.alias || []

  const resolveOptions: ResolvedConfig['resolve'] = {
    // mainFields: config.resolve?.mainFields ?? DEFAULT_MAIN_FIELDS,
    browserField: config.resolve?.browserField ?? true,
    conditions: config.resolve?.conditions ?? [],
    // extensions: config.resolve?.extensions ?? DEFAULT_EXTENSIONS,
    dedupe: config.resolve?.dedupe ?? [],
    preserveSymlinks: config.resolve?.preserveSymlinks ?? false,
    alias: resolvedAlias,
  }

  // load .env files
  const envDir = config.envDir
    ? normalizePath(path.resolve(resolvedRoot, config.envDir))
    : resolvedRoot
  const userEnv = false
  // loadEnv(mode, envDir, resolveEnvPrefix(config))

  // Note it is possible for user to have a custom mode, e.g. `staging` where
  // development-like behavior is expected. This is indicated by NODE_ENV=development
  // loaded from `.staging.env` and set by us as VITE_USER_NODE_ENV
  const userNodeEnv = process.env.VITE_USER_NODE_ENV
  if (!isNodeEnvSet && userNodeEnv) {
    if (userNodeEnv === 'development') {
      process.env.NODE_ENV = 'development'
    } else {
      // NODE_ENV=production is not supported as it could break HMR in dev for frameworks like Vue
      logger.warn(
        `NODE_ENV=${userNodeEnv} is not supported in the .env file. ` +
        `Only NODE_ENV=development is supported to create a development build of your project. ` +
        `If you need to set process.env.NODE_ENV, you can set it in the Vite config instead.`,
      )
    }
  }

  const isProduction = process.env.NODE_ENV === 'production'


  // resolve public base url
  const isBuild = command === 'build'
  const relativeBaseShortcut = config.base === '' || config.base === './'

  // During dev, we ignore relative base and fallback to '/'
  // For the SSR build, relative base isn't possible by means
  // of import.meta.url.
  const resolvedBase = relativeBaseShortcut
    ? !isBuild || config.build?.ssr
      ? '/'
      : './'
    : resolveBaseUrl(config.base, isBuild, logger) ?? '/'

  const resolvedBuildOptions = resolveBuildOptions(
    config.build,
    logger,
    resolvedRoot,
  )

  // resolve cache directory
  // const pkgDir = findNearestPackageData(resolvedRoot, packageCache)?.dir
  // const cacheDir = normalizePath(
  //   config.cacheDir
  //     ? path.resolve(resolvedRoot, config.cacheDir)
  //     : pkgDir
  //     ? path.join(pkgDir, `node_modules/.vite`)
  //     : path.join(resolvedRoot, `.vite`),
  // )

  const assetsFilter =
    config.assetsInclude &&
      (!Array.isArray(config.assetsInclude) || config.assetsInclude.length)
      ? createFilter(config.assetsInclude)
      : () => false

  // create an internal resolver to be used in special scenarios, e.g.
  // optimizer & handling css @imports
  // const createResolver: ResolvedConfig['createResolver'] = (options) => {
  //   let aliasContainer: PluginContainer | undefined
  //   let resolverContainer: PluginContainer | undefined
  //   return async (id, importer, aliasOnly, ssr) => {
  //     let container: PluginContainer
  //     if (aliasOnly) {
  //       container =
  //         aliasContainer ||
  //         (aliasContainer = await createPluginContainer({
  //           ...resolved,
  //           plugins: [aliasPlugin({ entries: resolved.resolve.alias })],
  //         }))
  //     } else {
  //       container =
  //         resolverContainer ||
  //         (resolverContainer = await createPluginContainer({
  //           ...resolved,
  //           plugins: [
  //             aliasPlugin({ entries: resolved.resolve.alias }),
  //             resolvePlugin({
  //               ...resolved.resolve,
  //               root: resolvedRoot,
  //               isProduction,
  //               isBuild: command === 'build',
  //               ssrConfig: resolved.ssr,
  //               asSrc: true,
  //               preferRelative: false,
  //               tryIndex: true,
  //               ...options,
  //               idOnly: true,
  //             }),
  //           ],
  //         }))
  //     }
  //     return (
  //       await container.resolveId(id, importer, {
  //         ssr,
  //         scan: options?.scan,
  //       })
  //     )?.id
  //   }
  // }

  const { publicDir } = config
  const resolvedPublicDir =
    publicDir !== false && publicDir !== ''
      ? path.resolve(
        resolvedRoot,
        typeof publicDir === 'string' ? publicDir : 'public',
      )
      : ''

  const server = resolveServerOptions(resolvedRoot, config.server, logger)
  // const ssr = resolveSSROptions(
  //   config.ssr,
  //   resolveOptions.preserveSymlinks,
  //   config.legacy?.buildSsrCjsExternalHeuristics,
  // )

  const middlewareMode = config?.server?.middlewareMode

  const optimizeDeps = config.optimizeDeps || {}

  const BASE_URL = resolvedBase

  // resolve worker
  // let workerConfig = mergeConfig({}, config)
  // const [workerPrePlugins, workerNormalPlugins, workerPostPlugins] =
  //   sortUserPlugins(rawWorkerUserPlugins)

  // // run config hooks
  // const workerUserPlugins = [
  //   ...workerPrePlugins,
  //   ...workerNormalPlugins,
  //   ...workerPostPlugins,
  // ]
  // workerConfig = await runConfigHook(workerConfig, workerUserPlugins, configEnv)
  // const resolvedWorkerOptions: ResolveWorkerOptions = {
  //   format: workerConfig.worker?.format || 'iife',
  //   plugins: [],
  //   rollupOptions: workerConfig.worker?.rollupOptions || {},
  //   getSortedPlugins: undefined!,
  //   getSortedPluginHooks: undefined!,
  // }


  const resolvedWorkerOptions: ResolveWorkerOptions = {
    format: "es",
    plugins: [],
    rollupOptions: {},
    getSortedPlugins: undefined!,
    getSortedPluginHooks: undefined!,
  }

  const resolvedConfig: ResolvedConfig = {
    configFile: configFile ? normalizePath(configFile) : undefined,
    configFileDependencies: configFileDependencies.map((name) =>
      normalizePath(path.resolve(name)),
    ),
    inlineConfig,
    root: resolvedRoot,
    base: resolvedBase.endsWith('/') ? resolvedBase : resolvedBase + '/',
    // rawBase: resolvedBase,
    resolve: resolveOptions,
    publicDir: resolvedPublicDir,
    cacheDir: '.cache',
    command,
    mode,
    // ssr: {

    // },
    isWorker: false,
    // mainConfig: null,
    isProduction,
    plugins: userPlugins,
    // css: resolveCSSOptions(config.css),
    esbuild:
      config.esbuild === false
        ? false
        : {
          jsxDev: !isProduction,
          ...config.esbuild,
        },
    server,
    build: resolvedBuildOptions,
    // preview: resolvePreviewOptions(config.preview, server),
    envDir,
    env: {
      // ...userEnv,
      BASE_URL,
      MODE: mode,
      DEV: !isProduction,
      PROD: isProduction,
    },
    assetsInclude(file: string) {
      return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file)
    },
    logger,
    // packageCache,
    // createResolver,
    optimizeDeps: {
      disabled: 'build',
      ...optimizeDeps,
      esbuildOptions: {
        preserveSymlinks: resolveOptions.preserveSymlinks,
        ...optimizeDeps.esbuildOptions,
      },
    },
    worker: resolvedWorkerOptions,
    appType: config.appType ?? (middlewareMode === 'ssr' ? 'custom' : 'spa'),
    experimental: {
      importGlobRestoreExtension: false,
      hmrPartialAccept: false,
      ...config.experimental,
    },
    getSortedPlugins: undefined!,
    getSortedPluginHooks: undefined!,
  }
  const resolved: ResolvedConfig = {
    ...config,
    ...resolvedConfig,
  }

  // ;(resolved.plugins as Plugin[]) = await resolvePlugins(
  //   resolved,
  //   prePlugins,
  //   normalPlugins,
  //   postPlugins,
  // )
  Object.assign(resolved, createPluginHookUtils(resolved.plugins))
  const workerConfig: any = {}
  const workerResolved: ResolvedConfig = {
    ...workerConfig,
    ...resolvedConfig,
    isWorker: true,
    mainConfig: resolved,
  }
  // resolvedConfig.worker.plugins = await resolvePlugins(
  //   workerResolved,
  //   // workerPrePlugins,
  //   // workerNormalPlugins,
  //   // workerPostPlugins,
  // )
  // Object.assign(
  //   resolvedConfig.worker,
  //   createPluginHookUtils(resolvedConfig.worker.plugins),
  // )

  // call configResolved hooks

  resolvedConfig
  console.log("🚀 ~ file: utils.ts:575 ~ resolvedConfig:", resolvedConfig)
  await Promise.all([
    ...resolved
      .getSortedPluginHooks('configResolved')
      .map((hook) => hook(resolved)),
    // ...resolvedConfig.worker
    // .getSortedPluginHooks('configResolved')
    // .map((hook) => hook(workerResolved)),
  ])

  // validate config

  if (middlewareMode === 'ssr') {
    logger.warn(
      colors.yellow(
        `Setting server.middlewareMode to 'ssr' is deprecated, set server.middlewareMode to \`true\`${config.appType === 'custom' ? '' : ` and appType to 'custom'`
        } instead`,
      ),
    )
  }
  if (middlewareMode === 'html') {
    logger.warn(
      colors.yellow(
        `Setting server.middlewareMode to 'html' is deprecated, set server.middlewareMode to \`true\` instead`,
      ),
    )
  }

  if (
    config.server?.force &&
    !isBuild &&
    config.optimizeDeps?.force === undefined
  ) {
    resolved.optimizeDeps.force = true
    logger.warn(
      colors.yellow(
        `server.force is deprecated, use optimizeDeps.force instead`,
      ),
    )
  }

  // debug?.(`using resolved config: %O`, {
  //   ...resolved,
  //   plugins: resolved.plugins.map((p) => p.name),
  //   worker: {
  //     ...resolved.worker,
  //     plugins: resolved.worker.plugins.map((p) => p.name),
  //   },
  // })

  if (config.build?.terserOptions && config.build.minify !== 'terser') {
    logger.warn(
      colors.yellow(
        `build.terserOptions is specified but build.minify is not set to use Terser. ` +
        `Note Vite now defaults to use esbuild for minification. If you still ` +
        `prefer Terser, set build.minify to "terser".`,
      ),
    )
  }

  // Check if all assetFileNames have the same reference.
  // If not, display a warn for user.
  const outputOption = config.build?.rollupOptions?.output ?? []
  // Use isArray to narrow its type to array
  if (Array.isArray(outputOption)) {
    const assetFileNamesList = outputOption.map(
      (output) => output.assetFileNames,
    )
    if (assetFileNamesList.length > 1) {
      const firstAssetFileNames = assetFileNamesList[0]
      const hasDifferentReference = assetFileNamesList.some(
        (assetFileNames) => assetFileNames !== firstAssetFileNames,
      )
      if (hasDifferentReference) {
        resolved.logger.warn(
          colors.yellow(`
assetFileNames isn't equal for every build.rollupOptions.output. A single pattern across all outputs is supported by Vite.
`),
        )
      }
    }
  }

  // Warn about removal of experimental features
  if (
    config.legacy?.buildSsrCjsExternalHeuristics ||
    config.ssr?.format === 'cjs'
  ) {
    resolved.logger.warn(
      colors.yellow(`
(!) Experimental legacy.buildSsrCjsExternalHeuristics and ssr.format: 'cjs' are going to be removed in Vite 5. 
    Find more information and give feedback at https://github.com/vitejs/vite/discussions/13816.
`),
    )
  }

  return resolved
}

/**
 * Resolve base url. Note that some users use Vite to build for non-web targets like
 * electron or expects to deploy
 */
export function resolveBaseUrl(
  base: UserConfig['base'] = '/',
  isBuild: boolean,
  logger: Logger,
): string {
  if (base[0] === '.') {
    logger.warn(
      colors.yellow(
        colors.bold(
          `(!) invalid "base" option: ${base}. The value can only be an absolute ` +
          `URL, ./, or an empty string.`,
        ),
      ),
    )
    return '/'
  }

  // external URL flag
  const isExternal = isExternalUrl(base)
  // no leading slash warn
  if (!isExternal && base[0] !== '/') {
    logger.warn(
      colors.yellow(
        colors.bold(`(!) "base" option should start with a slash.`),
      ),
    )
  }

  // parse base when command is serve or base is not External URL
  if (!isBuild || !isExternal) {
    base = new URL(base, 'http://vitejs.dev').pathname
    // ensure leading slash
    if (base[0] !== '/') {
      base = '/' + base
    }
  }

  return base
}




// export async function loadConfigFromFile(
//   configEnv: ConfigEnv,
//   configFile?: string,
//   configRoot: string = process.cwd(),
//   logLevel?: LogLevel,
// ): Promise<{
//   path: string
//   config: UserConfig
//   dependencies: string[]
// } | null> {
//   const start = performance.now()
//   const getTime = () => `${(performance.now() - start).toFixed(2)}ms`

//   let resolvedPath: string | undefined

//   if (configFile) {
//     // explicit config path is always resolved from cwd
//     resolvedPath = path.resolve(configFile)
//   } else {
//     // implicit config file loaded from inline root (if present)
//     // otherwise from cwd
//     for (const filename of DEFAULT_CONFIG_FILES) {
//       const filePath = path.resolve(configRoot, filename)
//       if (!fs.existsSync(filePath)) continue

//       resolvedPath = filePath
//       break
//     }
//   }

//   if (!resolvedPath) {
//     debug?.('no config file found.')
//     return null
//   }

//   let isESM = false
//   if (/\.m[jt]s$/.test(resolvedPath)) {
//     isESM = true
//   } else if (/\.c[jt]s$/.test(resolvedPath)) {
//     isESM = false
//   } else {
//     // check package.json for type: "module" and set `isESM` to true
//     try {
//       const pkg = lookupFile(configRoot, ['package.json'])
//       isESM =
//         !!pkg && JSON.parse(fs.readFileSync(pkg, 'utf-8')).type === 'module'
//     } catch (e) {}
//   }

//   try {
//     const bundled = await bundleConfigFile(resolvedPath, isESM)
//     const userConfig = await loadConfigFromBundledFile(
//       resolvedPath,
//       bundled.code,
//       isESM,
//     )
//     debug?.(`bundled config file loaded in ${getTime()}`)

//     const config = await (typeof userConfig === 'function'
//       ? userConfig(configEnv)
//       : userConfig)
//     if (!isObject(config)) {
//       throw new Error(`config must export or return an object.`)
//     }
//     return {
//       path: normalizePath(resolvedPath),
//       config,
//       dependencies: bundled.dependencies,
//     }
//   } catch (e) {
//     createLogger(logLevel).error(
//       colors.red(`failed to load config from ${resolvedPath}`),
//       { error: e },
//     )
//     throw e
//   }
// }


const isInNodeModules = false


export function resolveServerOptions(
  root: string,
  raw: ServerOptions | undefined,
  logger: Logger,
): ResolvedServerOptions {
  const server: ResolvedServerOptions = {
    preTransformRequests: true,
    ...(raw as Omit<ResolvedServerOptions, 'sourcemapIgnoreList'>),
    sourcemapIgnoreList:
      raw?.sourcemapIgnoreList === false
        ? () => false
        : raw?.sourcemapIgnoreList || isInNodeModules,
    middlewareMode: !!raw?.middlewareMode,
  }
  let allowDirs = server.fs?.allow
  const deny = server.fs?.deny || ['.env', '.env.*', '*.{crt,pem}']

  // if (!allowDirs) {
  //   allowDirs = [searchForWorkspaceRoot(root)]
  // }

  // allowDirs = allowDirs.map((i) => resolvedAllowDir(root, i))

  // only push client dir when vite itself is outside-of-root
  // const resolvedClientDir = resolvedAllowDir(root, CLIENT_DIR)
  // if (!allowDirs.some((dir) => isParentDirectory(dir, resolvedClientDir))) {
  //   allowDirs.push(resolvedClientDir)
  // }

  server.fs = {
    strict: server.fs?.strict ?? true,
    allow: allowDirs,
    deny,
  }

  if (server.origin?.endsWith('/')) {
    server.origin = server.origin.slice(0, -1)
    logger.warn(
      colors.yellow(
        `${colors.bold('(!)')} server.origin should not end with "/". Using "${server.origin
        }" instead.`,
      ),
    )
  }

  return server
}



Deno.test("asd", async () => {


  const config = await resolveConfig({
    plugins: [
      // pluginKitto({}),
    ],
    // esbuild: false,
    // build: {
    //   target: "esnext",
    //   modulePreload: false,
    //   rollupOptions: {
    //     output: {
    //       format: "esm",
    //     },
    //   },
    // },
  }, "serve");
})



export async function asyncFlatten<T>(arr: T[]): Promise<T[]> {
  do {
    arr = (await Promise.all(arr)).flat(Infinity) as any
  } while (arr.some((v: any) => v?.then))
  return arr
}




export function sortUserPlugins(
  plugins: (Plugin | Plugin[])[] | undefined,
): [Plugin[], Plugin[], Plugin[]] {
  const prePlugins: Plugin[] = []
  const postPlugins: Plugin[] = []
  const normalPlugins: Plugin[] = []

  if (plugins) {
    plugins.flat().forEach((p) => {
      if (p.enforce === 'pre') prePlugins.push(p)
      else if (p.enforce === 'post') postPlugins.push(p)
      else normalPlugins.push(p)
    })
  }

  return [prePlugins, normalPlugins, postPlugins]
}

// export function mergeAlias(
//   a?: AliasOptions,
//   b?: AliasOptions,
// ): AliasOptions | undefined {
//   if (!a) return b
//   if (!b) return a
//   if (isObject(a) && isObject(b)) {
//     return { ...a, ...b }
//   }
//   // the order is flipped because the alias is resolved from top-down,
//   // where the later should have higher priority
//   return [...normalizeAlias(b), ...normalizeAlias(a)]
// }

// export function normalizeAlias(o: AliasOptions = []): Alias[] {
//   return Array.isArray(o)
//     ? o.map(normalizeSingleAlias)
//     : Object.keys(o).map((find) =>
//         normalizeSingleAlias({
//           find,
//           replacement: (o as any)[find],
//         }),
//       )
// }

function mergeConfigRecursively(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  rootPath: string,
) {
  const merged: Record<string, any> = { ...defaults }
  for (const key in overrides) {
    const value = overrides[key]
    if (value == null) {
      continue
    }

    const existing = merged[key]

    if (existing == null) {
      merged[key] = value
      continue
    }

    // fields that require special handling
    if (key === 'alias' && (rootPath === 'resolve' || rootPath === '')) {
      // merged[key] = mergeAlias(existing, value)
      continue
    } else if (key === 'assetsInclude' && rootPath === '') {
      merged[key] = [].concat(existing, value)
      continue
    } else if (
      key === 'noExternal' &&
      rootPath === 'ssr' &&
      (existing === true || value === true)
    ) {
      merged[key] = true
      continue
    }

    if (Array.isArray(existing) || Array.isArray(value)) {
      merged[key] = [...arraify(existing ?? []), ...arraify(value ?? [])]
      continue
    }
    if (isObject(existing) && isObject(value)) {
      merged[key] = mergeConfigRecursively(
        existing,
        value,
        rootPath ? `${rootPath}.${key}` : key,
      )
      continue
    }

    merged[key] = value
  }
  return merged
}



export function mergeConfig<
  D extends Record<string, any>,
  O extends Record<string, any>,
>(
  defaults: D extends Function ? never : D,
  overrides: O extends Function ? never : O,
  isRoot = true,
): Record<string, any> {
  if (typeof defaults === 'function' || typeof overrides === 'function') {
    throw new Error(`Cannot merge config in form of callback`)
  }

  return mergeConfigRecursively(defaults, overrides, isRoot ? '' : '.')
}



async function runConfigHook(
  config: InlineConfig,
  plugins: Plugin[],
  configEnv: ConfigEnv,
): Promise<InlineConfig> {
  let conf = config

  for (const p of getSortedPluginsByHook('config', plugins)) {
    const hook = p.config
    const handler = hook && 'handler' in hook ? hook.handler : hook
    if (handler) {
      const res = await handler(conf, configEnv)
      if (res) {
        conf = mergeConfig(conf, res)
      }
    }
  }

  return conf
}



export function resolveBuildOptions(
  raw: BuildOptions | undefined,
  logger: Logger,
  root: string,
): ResolvedBuildOptions {
  const deprecatedPolyfillModulePreload = raw?.polyfillModulePreload
  if (raw) {
    const { polyfillModulePreload, ...rest } = raw
    raw = rest
    if (deprecatedPolyfillModulePreload !== undefined) {
      logger.warn(
        'polyfillModulePreload is deprecated. Use modulePreload.polyfill instead.',
      )
    }
    if (
      deprecatedPolyfillModulePreload === false &&
      raw.modulePreload === undefined
    ) {
      raw.modulePreload = { polyfill: false }
    }
  }

  const modulePreload = raw?.modulePreload
  const defaultModulePreload = {
    polyfill: true,
  }

  const defaultBuildOptions: BuildOptions = {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: !raw?.lib,
    sourcemap: false,
    rollupOptions: {},
    minify: raw?.ssr ? false : 'esbuild',
    terserOptions: {},
    write: true,
    emptyOutDir: null,
    copyPublicDir: true,
    manifest: false,
    lib: false,
    ssr: false,
    ssrManifest: false,
    ssrEmitAssets: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    watch: null,
  }

  const userBuildOptions = raw
    ? mergeConfig(defaultBuildOptions, raw)
    : defaultBuildOptions

  // @ts-expect-error Fallback options instead of merging
  const resolved: ResolvedBuildOptions = {
    target: 'modules',
    cssTarget: false,
    ...userBuildOptions,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      ...userBuildOptions.commonjsOptions,
    },
    dynamicImportVarsOptions: {
      warnOnError: true,
      exclude: [/node_modules/],
      ...userBuildOptions.dynamicImportVarsOptions,
    },
    // Resolve to false | object
    modulePreload:
      modulePreload === false
        ? false
        : typeof modulePreload === 'object'
          ? {
            ...defaultModulePreload,
            ...modulePreload,
          }
          : defaultModulePreload,
  }

  // handle special build targets
  if (resolved.target === 'modules') {
    resolved.target = ESBUILD_MODULES_TARGET
  } else if (resolved.target === 'esnext' && resolved.minify === 'terser') {
    // try {
    //   const terserPackageJsonPath = requireResolveFromRootWithFallback(
    //     root,
    //     'terser/package.json',
    //   )
    //   const terserPackageJson = JSON.parse(
    //     fs.readFileSync(terserPackageJsonPath, 'utf-8'),
    //   )
    //   const v = terserPackageJson.version.split('.')
    //   if (v[0] === '5' && v[1] < 16) {
    //     // esnext + terser 5.16<: limit to es2021 so it can be minified by terser
    //     resolved.target = 'es2021'
    //   }
    // } catch {}
  }

  if (!resolved.cssTarget) {
    resolved.cssTarget = resolved.target
  }

  // normalize false string into actual false
  if ((resolved.minify as string) === 'false') {
    resolved.minify = false
  }

  if (resolved.minify === true) {
    resolved.minify = 'esbuild'
  }

  if (resolved.cssMinify == null) {
    resolved.cssMinify = !!resolved.minify
  }

  return resolved
}
