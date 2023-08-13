// import civet from '@danielx/civet'
// import type { Plugin } from './types.d.ts'

// export default function pluginCivet(): Plugin {
//   return {
//     enforce: 'pre',
//     name: 'kitto:civet',
//     extnames: ['.civet'],
//     transform(opts) {
//       const tsResult = civet.compile(opts.code, {
//         js: false,
//         sourceMap: true,
//       })
//       opts.code = tsResult.code
//       opts.extname = '.tsx'
//       return opts
//     },
//   }
// }
