import type { Plugin } from './types.d.ts'

export default function pluginCivet(): Plugin {
  let civet: typeof import('npm:@danielx/civet')
  // const cache = new Map()
  return {
    enforce: 'pre',
    name: 'kitto:civet',

    async transform(code, id, _options) {
      if (!id.endsWith('.civet'))
        return
      if (!civet)
        civet = await import('https://esm.sh/@danielx/civet')

      if (id.includes('.civet.js')) {
        const tsResult = civet.compile(code, {
          js: false,
        })

        return {
          code: tsResult,
        }
      }
    },

  }
}
