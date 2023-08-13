import type { Plugin } from 'vite'
import { createFilter } from 'npm:@rollup/pluginutils'
import pp from './scrypt/preprocess.ts'

export default function pluginScryptPP(): Plugin {
  const filter = createFilter(['**/*.scrypt.ts'])

  return {
    name: 'kitto:scrypt_pp',
    enforce: 'pre',
    // extnames: ['.ts', '.tsx', '.mts', '.cts'],
    transform(code, id) {
      if (!filter(id))
        return null

      code = pp(code)
      return code
    },
  }
}
