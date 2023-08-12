import type { Plugin } from './types.d.ts'
import pp from "./scrypt/preprocess.ts"
export default function pluginScryptPP(): Plugin {
  return {
    name: 'kitto:scrypt_pp',
    enforce: 'pre',
    extnames: [".ts", ".tsx", ".mts", ".cts"],
    async transform(opts) {
      if (!(opts.id.includes(".scrypt."))) {
        return opts
      }
      opts.code =await pp(opts.code)
      return opts
    },
  }
}



// Deno.test('kitto:scrypt_pp', async () => {

//   const p = await pluginScryptPP().transform({
//     id: "Counter.scrypt.ts",
//     map: null,
//     extname: "ts",
//     code: /* typescript */ `
//     @contract
//     class Counter {
//       constructor(
//         public count: bigint
//       ) {}
//       inc() {
//         this.count++
//         return this
//       }
//     }
//     `
//   })


//   console.log(p.code)

// })
