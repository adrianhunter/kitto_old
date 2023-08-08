import { createFilter } from '@rollup/pluginutils'
import ts from 'typescript'
import type { Plugin } from 'vite'

// import { declarationTransformer, transformer } from './type-compiler/src/compiler.ts'
import { declarationTransformer, transformer } from './deepkit/type-compiler/index.ts'


export interface Options {
  test?: RegExp
  include?: string
  exclude?: string
  transformers?: ts.CustomTransformers
}
export { transformer, declarationTransformer }

export function pluginDeepkit(options: Options = {}): Plugin {
  const filter = createFilter([
    '**/*.ts',
    '**/*.tsx',
  ], options.exclude ?? 'node_modules/**')
  const transformers = options.transformers || {
    before: [transformer],
    after: [declarationTransformer],
  }
  return {
    name: 'kitto:deepkit',
    enforce: 'pre',
    transform(code: string, fileName: string) {
      console.log("VERS", ts.version)
      if (!filter(fileName)) {
        return null
      }else {
        // console.log('DEEP:', fileName)

      }
      const transformed = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,


          experimentalDecorators: true,


          "allowArbitraryExtensions": true,
          "allowImportingTsExtensions": true,
          "moduleResolution": ts.ModuleResolutionKind.Bundler
        
        },
        fileName,
        transformers,
      })


      return {
        code: transformed.outputText,
        map: transformed.sourceMapText,
      }
    },
  }
}
