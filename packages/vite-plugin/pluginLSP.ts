// import { createFilter } from '@rollup/pluginutils'
// import ts from 'typescript'
import type { Plugin } from 'vite'

// // import { declarationTransformer, transformer } from './type-compiler/src/compiler.ts'
// import { declarationTransformer, transformer } from './deepkit/type-compiler/index.ts'


// export interface Options {
//   test?: RegExp
//   include?: string
//   exclude?: string
//   transformers?: ts.CustomTransformers
// }
// export { transformer, declarationTransformer }

export function pluginLSP(options?: any): Plugin {
//   const filter = createFilter([
//     '**/*.ts',
//     '**/*.tsx',
//   ], options.exclude ?? 'node_modules/**')
//   const transformers = options.transformers || {
//     before: [transformer],
//     after: [declarationTransformer],
//   }
  return {
    name: 'kitto:lsp',
   
  }
}
