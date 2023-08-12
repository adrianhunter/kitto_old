// // import Inspect from 'npm:vite-plugin-inspect'
// // import tsconfigPaths from 'npm:vite-tsconfig-paths'

// import pluginAstro from "./pluginAstro.ts"
import pluginTs from "./pluginTs.ts"

// import pluginCivet from './pluginCivetSimple.ts'

import pluginAutoImport from './pluginAutoImport.ts'
// // import { pluginConfig } from './pluginConfig.ts'
import pluginScrypt from './pluginScrypt.ts'
import pluginScryptPP from "./pluginScryptPP.ts"
import pluginDeepkit from "./pluginDeepkit.ts"
// import { pluginA } from './pluginScrypt.ts'



export default function pluginKitto() {
  return [
    // Inspect({
    //   outputDir: '/Users/X/Documents/GitHub/kitto/__debug',
    // }),
    // pluginAutoImport(),
    // tsconfigPaths(),

    // pluginAstro(),
    pluginScryptPP(),
    pluginAutoImport(),
    pluginScrypt(),
    pluginDeepkit(),
    // pluginTs(),
    // pluginScrypt(),
    // pluginCivet(),
    // pluginDeepkit(),
    // pluginLSP(),

    // {
    //   // stripTypes: false,
    //   // outputExtension: 'tsx',
    //   // outputTransformerPlugin: 'vite:esbuild',
    // }
    // pluginCjs(),
    // pluginTs(opts),
    // ...pluginConfig(),
  ]
}

// export default pluginKitto

// {
//   "extends": ["plugin:optimal-modules/recommended"]
// }
