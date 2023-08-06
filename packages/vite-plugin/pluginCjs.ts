// import type { Plugin } from 'vite'
// import { parse } from "acorn"
// import { transform } from "cjs-es"

// async function cjsToEsm(code: string) {

//   const r = await transform({ code, ast: parse(code, { ecmaVersion: "latest" }) })
//   return r.code
// }

// import path from "node:path"
// export function pluginCjs(): Plugin {
//   return {
//     name: "kitto:cjs",

//     async load(id: string) {
//       if (id.startsWith("npm:")) {

//         if (id.endsWith(".js")) {

//           const url = `https://cdn.jsdelivr.net/npm/${id.slice(4)}`

//           const r = await fetch(url).then(a => a.text())

//           return r

//         }
//       }

//     },

//     resolveId(id: string) {

//       if (id.startsWith("npm:")) {

//         if (id.endsWith(".js")) {

//           return {

//             id: `https://cdn.jsdelivr.net/npm/${id.slice(4)}`,

//             "external": false,

//             resolvedBy: "kitto:resolve"

//           }

//         }

//       }

//     },

//     async transform(code: string, id: string) {

//       if (id.includes("scrypt-ts")
//       ) {

//         return {
//           code: await cjsToEsm(code)
//         }
//         if (id.endsWith(".js")) {

//         }

//       }

//     }
//   }
// }
