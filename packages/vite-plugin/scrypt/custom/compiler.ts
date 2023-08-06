// // export function compileContractAsync(file: string, options?: {
// //   out?: string
// //   artifact?: boolean
// //   sourceMap?: boolean
// // }): Promise<CompileResult> {
// //   options = Object.assign({
// //     out: join(__dirname, '..', 'out'),
// //     sourceMap: false,
// //     artifact: false,
// //   }, options)

// //   return compileAsync({ path: file }, {
// //     artifact: options.artifact,
// //     outputDir: options.out,
// //     sourceMap: options.sourceMap,
// //     hex: true,
// //     cmdPrefix: new URL('./scryptc', import.meta.url).pathname,
// //   })
// // }
// import fs from 'node:fs'
// import path from 'node:path'
// import { execSync } from 'node:child_process'
// import type {
//   ABIEntity,
//   AliasEntity,
//   AutoTypedVar,
//   CompileError,

//   ContractEntity,
//   LibraryEntity,
//   OpCode,

//   ParamEntity,
//   StaticEntity,
//   StructEntity,
//   Warning,
// } from './types.ts'
// import { handleCompilerOutput, md5 } from './outputUtils.ts'

// export enum BuildType {
//   Debug = 'debug',
//   Release = 'release',
// }

// const CURRENT_CONTRACT_ARTIFACT_VERSION = 123

// export class CompileResult {
//   constructor(public errors: CompileError[], public warnings: Warning[]) {

//   }

//   asm?: OpCode[]
//   hex?: string
//   ast?: Record<string, unknown>
//   dependencyAsts?: Record<string, unknown>
//   abi?: Array<ABIEntity>
//   stateProps?: Array<ParamEntity>
//   compilerVersion?: string
//   contract?: string
//   md5?: string
//   structs?: Array<StructEntity>
//   library?: Array<LibraryEntity>
//   contracts?: Array<ContractEntity>
//   alias?: Array<AliasEntity>
//   file?: string
//   buildType?: string
//   autoTypedVars?: AutoTypedVar[]
//   statics?: Array<StaticEntity>
//   sources?: Array<string>
//   sourceMap?: Array<string>
//   sourceMapFile?: string
//   dbgFile?: string

//   toArtifact() {
//     const artifact = {
//       version: CURRENT_CONTRACT_ARTIFACT_VERSION,
//       compilerVersion: this.compilerVersion || '0.0.0',
//       contract: this.contract || '',
//       md5: this.md5 || '',
//       structs: this.structs || [],
//       library: this.library || [],
//       alias: this.alias || [],
//       abi: this.abi || [],
//       stateProps: this.stateProps || [],
//       buildType: this.buildType || BuildType.Debug,
//       file: this.file || '',
//       hex: this.hex || '',
//       asm: '',
//       sourceMap: [],
//       sources: [],
//       sourceMapFile: this.sourceMapFile || '',
//     }

//     return artifact
//   }
// }

// export interface CompilingSettings {
//   ast?: boolean
//   asm?: boolean
//   hex?: boolean
//   debug?: boolean
//   artifact?: boolean
//   outputDir?: string
//   outputToFiles?: boolean
//   cwd?: string
//   cmdPrefix?: string
//   cmdArgs?: string
//   buildType?: string
//   stdout?: boolean
//   sourceMap?: boolean
//   timeout?: number // in ms
// }
// // export function doCompileAsync(source: {
// //   path: string
// //   content?: string
// // }, settings: CompilingSettings, callback?: (error: Error | null, result: {
// //   path: string
// //   output: string
// //   md5: string
// // } | null) => void) {
// //   const sourcePath = source.path
// //   const srcDir = dirname(sourcePath)
// //   const curWorkingDir = settings.cwd || srcDir

// //   const timeout = settings.timeout || 1200000
// //   const sourceContent = source.content !== undefined ? source.content : readFileSync(sourcePath, 'utf8')
// //   const cmd = settings2cmd(sourcePath, settings)
// //   const childProcess = exec(cmd, { cwd: curWorkingDir, timeout, killSignal: 'SIGKILL' },
// //     (error: Error | null, stdout: string) => {
// //       if (error) {
// //         console.error(`exec error: ${error} stdout: ${stdout}`)
// //         callback(error, null)
// //         return
// //       }

// //       callback(null, {
// //         path: sourcePath,
// //         output: stdout,
// //         md5: md5(sourceContent),
// //       })
// //     })

// //   childProcess.stdin.write(sourceContent, (error: Error) => {
// //     if (error) {
// //       callback(error, null)
// //       return
// //     }

// //     childProcess.stdin.end()
// //   })

// //   return childProcess
// // }

// // export function compileAsync(source: {
// //   path: string
// //   content?: string
// // }, settings: CompilingSettings): Promise<CompileResult> {
// //   settings = Object.assign({}, defaultCompilingSettings, settings)
// //   return new Promise((resolve, reject) => {
// //     doCompileAsync(
// //       source,
// //       settings,
// //       async (error: Error, data) => {
// //         if (error) {
// //           reject(error)
// //           return
// //         }

// //         try {
// //           const result = handleCompilerOutput(source.path, settings, data.output, data.md5)
// //           resolve(result)
// //         }
// //         catch (error) {
// //           reject(error)
// //         }
// //       },
// //     )
// //   })
// // }

// const defaultCompilingSettings = {
//   ast: true,
//   asm: false,
//   hex: true,
//   debug: false,
//   artifact: true,
//   outputDir: '',
//   outputToFiles: false,
//   cwd: '',
//   cmdPrefix: '',
//   cmdArgs: '',
//   buildType: BuildType.Debug,
//   stdout: true,
//   sourceMap: false,
//   timeout: 1200000, // in ms
// }
// // function toOutputDir(artifactsDir: string, sourcePath: string) {
// //   return join(artifactsDir, basename(sourcePath) + '-' + hash160(sourcePath, 'utf-8').substring(0, 10));
// // }
// export function settings2cmd(sourcePath: string, settings: CompilingSettings): string {
//   const srcDir = path.dirname(sourcePath)
//   // dir that store artifact file
//   const artifactDir = settings.outputDir || srcDir
//   // dir that store ast,asm file
//   const outputDir = '/Users/X/Documents/GitHub/kitto/packages/vite-plugin/scrypt/out'
//   const cmdPrefix = settings.cmdPrefix || findCompiler()
//   let outOption = `-o "${outputDir}"`
//   if (settings.stdout) {
//     outOption = '--stdout'
//     return `"${cmdPrefix}" compile ${settings.asm || settings.artifact ? '--asm' : ''} ${settings.hex ? '--hex' : ''} ${settings.ast || settings.artifact ? '--ast' : ''} ${settings.debug === true ? '--debug' : ''} -r ${outOption} ${settings.cmdArgs ? settings.cmdArgs : ''}`
//   }
//   // else {
//   //   if (!existsSync(outputDir))
//   //     mkdirSync(outputDir)
//   // }
//   return `"${cmdPrefix}" compile ${settings.hex ? '--hex' : ''} ${settings.ast || settings.artifact ? '--ast' : ''} ${settings.debug === true ? '--debug' : ''} ${settings.sourceMap === true ? '--source-map' : ''} -r ${outOption} ${settings.cmdArgs ? settings.cmdArgs : ''}`
// }

// function findCompiler() {
//   // return new URL('./scryptc', import.meta.url).pathname
//   return '/Users/X/Documents/GitHub/kitto/packages/vite-plugin/scrypt/scryptc'
// }
// // function toOutputDir(artifactsDir: string, sourcePath: string) {
// //   return join(artifactsDir, `${path.basename(sourcePath)}-${hash160(sourcePath, 'utf-8').substring(0, 10)}`)
// // }
// // export function settings2cmd(sourcePath: string, settings: CompilingSettings): string {
// //   const srcDir = dirname(sourcePath)
// //   // dir that store artifact file
// //   const artifactDir = settings.outputDir || srcDir
// //   // dir that store ast,asm file
// //   const outputDir = '/Users/X/Documents/GitHub/kitto/packages/vite-plugin/scrypt/out/'
// //   const cmdPrefix = settings.cmdPrefix || findCompiler()
// //   let outOption = `-o "${outputDir}"`
// //   if (settings.stdout) {
// //     outOption = '--stdout'
// //     return `"${cmdPrefix}" compile ${settings.asm || settings.artifact ? '--asm' : ''} ${settings.hex ? '--hex' : ''} ${settings.ast || settings.artifact ? '--ast' : ''} ${settings.debug == true ? '--debug' : ''} -r ${outOption} ${settings.cmdArgs ? settings.cmdArgs : ''}`
// //   }
// //   //   else {
// //   //     if (!existsSync(outputDir))
// //   //       mkdirSync(outputDir)
// //   //   }
// //   return `"${cmdPrefix}" compile ${settings.hex ? '--hex' : ''} ${settings.ast || settings.artifact ? '--ast' : ''} ${settings.debug === true ? '--debug' : ''} ${settings.sourceMap == true ? '--source-map' : ''} -r ${outOption} ${settings.cmdArgs ? settings.cmdArgs : ''}`
// // }
// const encode = new TextEncoder()
// const decoder = new TextDecoder()

// export function compile(
//   source: {
//     path: string
//     content?: string
//   },
//   settings: CompilingSettings,
// ): CompileResult {
//   const sourcePath = source.path
//   const srcDir = path.dirname(sourcePath)
//   // dir that stores artifact file

//   const curWorkingDir = settings.cwd || srcDir

//   settings = Object.assign({}, defaultCompilingSettings, settings)

//   const sourceContent = source.content !== undefined ? source.content : fs.readFileSync(sourcePath, 'utf8')

//   const maxBuffer = settings.stdout ? 1024 * 1024 * 100 : 1024 * 1024
//   settings = Object.assign({}, defaultCompilingSettings, settings)
//   const cmd = settings2cmd(sourcePath, settings)
//   const output = execSync(cmd, { input: sourceContent, cwd: curWorkingDir, timeout: settings.timeout, maxBuffer }).toString()
//   return handleCompilerOutput(sourcePath, settings, output, md5(sourceContent))
// }

// export function compileContract(file: string, options?: {
//   out?: string
//   sourceMap?: boolean
//   artifact?: boolean
// }): CompileResult {
//   options = Object.assign({
//     out: path.join(__dirname, '../out'),
//     sourceMap: false,
//     artifact: false,
//   }, options)
//   if (!fs.existsSync(file))
//     throw new Error(`file ${file} not exists!`)

//   if (!fs.existsSync(options.out as string))
//     fs.mkdirSync(options.out as string)

//   const result = compile(
//     { path: file },
//     {
//       artifact: options.artifact,
//       outputDir: options.out,
//       sourceMap: options.sourceMap,
//       cmdPrefix: findCompiler(),
//     },
//   )

//   return result
// }

// export async function compileContractXXX(code: string, id?: string) {
// //   const cmd = settings2cmd('asd.scrypt', defaultCompilingSettings)

//   const p = new Deno.Command(findCompiler(), {
//     // args: 'compile --asm --hex --ast  -r --stdout'.split(' '),
//     args: 'compile --hex --ast -r -o /Users/X/Documents/GitHub/kitto/packages/vite-plugin/scrypt/out'.split(' '),
//     stdout: 'piped',
//     stdin: 'piped',

//     stderr: 'piped',
//   })

//   const cmdProcess = p.spawn()

//   const inWrite = cmdProcess.stdin.getWriter()

//   inWrite.write(encode.encode(code))

//   inWrite.close()

//   const rrr = await cmdProcess.output()
//   console.error('rrrrrr', rrr)
//   console.error('rrrXXXXrrr', decoder.decode(rrr.stdout))

//   //   rrr.stdout

//   //   //   for await (const x of pp.stdout)
//   //   //     console.log(x)

//   //   //   pp.stdout.pipeThrough(Deno.stdout)

//   //   await pp.output().then((a) => {
//   //     console.log(a)
//   //   }).catch((e) => {
//   //     console.error('ERROR', e)
//   //   })

//   //   console.log(await pp.output())
// //   pp.unref()
// //   pp.kill()
// }

// // Deno.test('compier', async () => {
// //   try {
// //     const r = await compile('asd', 'Asd')
// //     console.log(r)
// //   }
// //   catch (e) {
// //     console.error(e)
// //   }
// // })
