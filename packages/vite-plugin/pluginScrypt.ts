import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'

import * as pp from './scrypt/preprocess.ts'
import { ScryptProgram } from './scrypt/scryptProgram.ts'

export function pluginScrypt(): Plugin {
  let program: ScryptProgram
  let autoImport: any
  const filter = createFilter([
    '**/*.scrypt.ts',
    '*.scrypt.ts',
    '**/*.scrypt.civet.tsx',
    '*.scrypt.civet.tsx',
  ])
  return {
    name: 'kitto:scrypt',
    enforce: 'pre',
    configResolved(config) {
      program = new ScryptProgram({}, config)
      autoImport = config.plugins.find(
        a => a.name === 'unplugin-auto-import',
      )
    },
    async transform(code, id) {
      if (!filter(id))
        return null

      code = await pp.transform(code, id)
      if (autoImport) {
        const r = await autoImport.transform(code, id)
        if (r)
          code = r.code
      }
      try {
        const r = await program.compile(code, id, {})
        code = r.outputFiles[0].text
      }
      catch (e) {
        console.error(e)
        throw e
      }
      return {
        code,
        map: null,
      }
    },
  }
}
