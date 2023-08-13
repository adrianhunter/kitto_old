// // import path from "node:path"

// import * as uhtml from 'npm:ultrahtml'
// import swap from 'npm:ultrahtml/transformers/swap'
// import type { Plugin } from './types.d.ts'

// export default function pluginAstro(): Plugin {
//   return {
//     enforce: 'pre',
//     name: 'kitto:astro',
//     extnames: ['.astro'],
//     async transform(opts) {
//       opts.code = await transpile(opts.code)
//       opts.extname = '.ts'
//       return opts
//     },

//   }
// }

// async function transpile(code: string) {
//   uhtml.transform()

//   const output = await transform(code, [

//     swap({
//       // h1: "h2",
//       // link: (props, children) => html`<link rel="stylesheet" href={useAsset('/style.css')} />`,
//     }),
//     // sanitize({ allowElements: ["h1", "h2", "h3"] }),
//   ])

//   console.log(output)
//   return `import useAsset from 'ultra/hooks/use-asset.js'
//   import useEnv from 'ultra/hooks/use-env.js'
//   import React from "https://esm.sh/react"
//   export default function App() {
//     // Read our environment variable from '.env' or the host environment
//     const foo = useEnv('ULTRA_PUBLIC_FOO')
//     console.log(foo)

//     return (
//       ${code}
//     )
//   }
//   `

//   // return `import useAsset from 'ultra/hooks/use-asset.js'
//   // import useEnv from 'ultra/hooks/use-env.js'

//   // export default function App() {
//   //   // Read our environment variable from '.env' or the host environment
//   //   const foo = useEnv('ULTRA_PUBLIC_FOO')
//   //   console.log(foo)

//   //   return (
//   //     ${code}
//   //   )
//   // }`
// }
