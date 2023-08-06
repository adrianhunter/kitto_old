import { createFilter } from '@rollup/pluginutils'
import ts from 'typescript'
import type { Plugin } from 'vite'

// import { declarationTransformer, transformer } from './type-compiler/src/compiler.ts'

export interface Options {
  test?: RegExp
  include?: string
  exclude?: string
  transformers?: ts.CustomTransformers
}
// export { transformer, declarationTransformer }

export function pluginDeepkit(options: Options = {}): Plugin {
  const filter = createFilter(options.include ?? '**/*.ts', options.exclude ?? 'node_modules/**')
  const transformers = options.transformers || {
    // before: [transformer],
    // after: [declarationTransformer],
  }
  return {
    name: 'kitto:deepkit',
    enforce: 'pre',
    transform(code: string, fileName: string) {
      if (!filter(fileName))
        return null
      const transformed = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
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
