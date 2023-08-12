import type { Plugin } from './types.d.ts'
import ts from "typescript"
export default function pluginTs(): Plugin {
  return {
    enforce: 'pre',
    name: 'kitto:ts',
    extnames: [".ts", ".tsx", ".mts", ".cts"],
    async transform(opts) {
      const r = ts.transpileModule(opts.code, {
        "compilerOptions": {
                      // "jsx": ts.JsxFlags.
            target: ts.ScriptTarget.ESNext,
            "jsx": ts.JsxEmit.React,
            "jsxImportSource": "react"
        }
      })
      opts.code = r.outputText
      opts.extname = ".js"
      return opts
    },
  }
}
