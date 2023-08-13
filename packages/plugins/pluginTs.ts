import ts from 'typescript'
import type { Plugin } from 'vite'
import { createFilter } from 'npm:@rollup/pluginutils'
import type { TSConfig } from 'pkg-types'

ts.version
console.log("🚀 ~ file: pluginTs.ts:7 ~ ts.version:", ts.version)
interface Opts {
  tsconfig: TSConfig
}
export default function pluginTs(opts: Opts): Plugin {
  const filter = createFilter(['**/*.ts', '**/*.tsx'])
  // const compilerOptions = {
  //   target: ts.ScriptTarget.ESNext,
  //   jsx: ts.JsxEmit.React,
  //   jsxImportSource: 'react',
  // }
  // console.log("🚀 ~ file: pluginTs.ts:17 ~ pluginTs ~ compilerOptions:", compilerOptions)
  return {
    enforce: 'pre',
    name: 'kitto:ts',
    // extnames: ['.ts', '.tsx', '.mts', '.cts'],
    transform(code: string, id: string) {
      if (!filter(id))
        return null
      const r = ts.transpileModule(code, {
        compilerOptions: opts.tsconfig.compilerOptions
      })


      code = r.outputText
      return {
        code
      }
    },
  }
}
