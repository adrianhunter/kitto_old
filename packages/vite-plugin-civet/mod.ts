// import path from 'node:path'
// import fs from 'node:fs/promises'
// import civet from '@danielx/civet'
// import type { Plugin } from 'vite'

// export default (): Plugin => {
//   const cache = new Map()
//   return {
//     enforce: 'pre',
//     name: 'kitto:civet',
//     async resolveId(id: string, importer: string) {
//       if (id.endsWith('.civet')) {
//         const importDir = path.dirname(importer)
//         const fullPath = path.resolve(importDir, id)

//         if (!cache.get(fullPath)) {
//           const src = await fs.readFile(fullPath, 'utf8')
//           const tsResult = civet.compile(src, {
//             js: false,
//           })
//           await fs.writeFile(`${fullPath}.tsx`, tsResult)
//           cache.set(fullPath, true)
//         }
//         return `${fullPath}.tsx`
//       }
//     },
//   }
// }
export {}
export default {}
