import path from 'node:path'
import fs from 'node:fs/promises'
import civet from '@danielx/civet'
import type { Plugin } from 'vite'

export function pluginCivet(): Plugin {
  const cache = new Map()
  return {
    enforce: 'pre',
    name: 'kitto:civet',

    // transformIndexHtml(html: string) {
    //   console.log('LOAD HTML')
    //   const $ = loadHTML(html)
    //   $('script').each(function () {
    //     const el = $(this)
    //     const src = el.attr('src')
    //     if (src?.match(/\.civet$/))

    //       el.attr('src', src.replace(/\.civet$/, '.civet.js?transform'))
    //   })
    //   return $.html()
    // },
    // async transform(code, id, options) {
    //   if (id.includes('.civet.js')) {
    //     const tsResult = civet.compile(code, {
    //       js: false,
    //     })

    //     return tsResult
    //   }
    //   else {
    //     console.log('ASDASD', id)
    //   }
    //   // if (!filter(id))
    //   //   return null
    //   // let transformed: TransformResult = {
    //   //   code: civet.compile(code, {
    //   //     inlineMap: true,
    //   //     filename: id,
    //   //     js: stripTypes,
    //   //   } as any) as string,
    //   //   map: null,
    //   // }
    // },

    async resolveId(id: string, importer: string, options) {
      if (id.endsWith('.civet')) {
        const importDir = path.dirname(importer)
        const fullPath = path.resolve(importDir, id)

        if (!cache.get(fullPath)) {
          const src = await fs.readFile(fullPath, 'utf8')
          const tsResult = civet.compile(src, {
            js: false,
          })
          await fs.writeFile(`${fullPath}.tsx`, tsResult)
          cache.set(fullPath, true)
        }
        return `${fullPath}.tsx`
      }
      //   else {
      //     if (id.match(/\.civet/)) {
      //       const [pathPart, queryPart] = id.split('?')
      //       if (pathPart.match(/\.civet\.js$/) && queryPart === 'transform') {
      //         const transformedId = pathPart.replace(/\.js$/, '')
      //         const resolution = await this.resolve(
      //           transformedId,
      //           importer,
      //           options,
      //         )
      //         return resolution?.id
      //       }
      //       else {
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
    //     }
    //   }
    },
  }
}
