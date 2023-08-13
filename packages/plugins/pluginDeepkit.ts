import { ReflectionTransformer, declarationTransformer } from '@deepkit/type-compiler'
import ts from 'typescript'
import { createFilter } from 'npm:@rollup/pluginutils'
import type { Plugin } from 'vite'

let loaded = false

import type { TSConfig } from 'pkg-types'


interface Opts {
  tsconfig: TSConfig
}

// @ts-expect-error asd
const transformer: ts.CustomTransformerFactory = function deepkitTransformer(context) {
  if (!loaded)
    loaded = true

  // @ts-expect-error asd
  return new ReflectionTransformer(context).withReflectionMode('always')
}

export default function pluginDeepkit(): Plugin {
  const filter = createFilter(['**/*.scrypt.ts', '**/*.scrypt.tsx'])

  const transformers = {
    before: [transformer],
    after: [declarationTransformer],
  }
  return {
    name: 'kitto:deepkit',
    enforce: 'pre',
    // extnames: ['.ts', '.tsx', '.mts', '.cts'],
    // deno-lint-ignore require-await
    async transform(code: string, id: string) {
      if (!filter(id))
        return null

      const transformed = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          experimentalDecorators: true,
          allowArbitraryExtensions: true,
          allowImportingTsExtensions: true,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
        },
        // opts.id,
        fileName: id,
        // @ts-expect-error asd
        transformers,
      })

      code = transformed.outputText
      // opts.extname = '.js'
      return {
        code,
      }
    },
  }
}
