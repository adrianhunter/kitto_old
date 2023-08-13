// import type { Config, Plugin } from './types.d.ts'
import type { Plugin, ResolvedConfig } from 'vite'
import { createFilter } from 'npm:@rollup/pluginutils'
import ScryptProgram from './scrypt/scryptProgram.ts'
import util, { getOutputFilePath } from "./pluginUtils.ts"
import { readTSConfig } from "npm:pkg-types"
import { compileContract } from './scrypt/scryptlib/utils.ts'
import path from "node:path"
import type { TSConfig } from 'pkg-types'


interface Opts {
  tsconfig: TSConfig
}
export default function pluginScrypt(): Plugin {
  let config: ResolvedConfig
  let program: ScryptProgram
  let autoImport: any
  let tsconfig: TSConfig

  const filter = createFilter(['**/*.scrypt.ts', '**/*.scrypt.tsx'])
  return {
    name: 'kitto:scrypt',
    enforce: 'pre',
    // extnames: ['.ts', '.tsx', '.mts', '.cts'],
    // deno-lint-ignore require-await
    async configResolved(c) {
      config = c
      autoImport = c.plugins.find(a => a.name === 'unplugin-auto-import') as Plugin
      tsconfig = await readTSConfig()
      program = new ScryptProgram(tsconfig)
    },
    async transform(code: string, id: string, opts) {
      console.log("🚀 ~ file: pluginScrypt.ts:34 ~ transform ~ id:", id)

      if (!filter(id))
        return null





      const ext = path.extname(id)

      if (autoImport) {
        const r = await autoImport.transform(code, id, opts)
        if (r)
          code = r.code
      }

      // code = await autoImport.transform(code, id)

      // const a = opts.id.includes('.scrypt.')
      // const b = opts.params.has('scrypt')
      // if (!a && !b)
      //   return opts
      try {
        const r = program.compile(code, id)

        if (r) {
          console.log('🚀 ~ file: pluginScrypt.ts:26 ~ REULT _____ transform ~ r:', r)

          const scryptFile = util.getOutputPath(id.replace(ext, '.scrypt'), tsconfig)
          const scryptCode = await Deno.readTextFile(scryptFile)
          const rr = await compileContract({ code: scryptCode, id: scryptFile }, { artifact: true, out: `${Deno.cwd()}/artifacts` })
          code = r.outputFiles[1].text
          // extname = '.js'
          code = code.replace('___ARTIFACT___', JSON.stringify(rr.toArtifact()))
        } else {
          return
        }

      }
      catch (e) {
        console.error(e)
        throw e
      }
      return {

        code,
      }
    },
  }
}
