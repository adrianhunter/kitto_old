import type { Plugin } from './types.d.ts'
import { declarationTransformer, ReflectionTransformer } from "@deepkit/type-compiler"
import ts from 'typescript'
let loaded = false;

//@ts-ignore asd
const transformer: ts.CustomTransformerFactory = function deepkitTransformer(context) {
  if (!loaded) {
      loaded = true;
  }
  //@ts-ignore asd
  return new ReflectionTransformer(context).withReflectionMode("always");
};


export default function pluginDeepkit(): Plugin {
  const transformers = {
    before: [transformer],
    after: [declarationTransformer],
  }
  return {
    name: 'kitto:deepkit',
    enforce: 'pre',
    extnames: [".ts", ".tsx", ".mts", ".cts"],
    // deno-lint-ignore require-await
    async transform(opts) {
      const transformed = ts.transpileModule(opts.code, {
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
          // experimentalDecorators: true,
          "allowArbitraryExtensions": true,
          "allowImportingTsExtensions": true,
          "moduleResolution": ts.ModuleResolutionKind.Bundler
        },
        // opts.id,
        fileName: opts.id,
        //@ts-ignore asd
        transformers,
      })

      opts.code = transformed.outputText
      opts.extname = ".js"
      return opts
    },
  }
}
