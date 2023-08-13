// import pluginCivet from './pluginCivet.ts'
import pluginAutoImport from './pluginAutoImport.ts'
import type { Plugin } from 'vite'

import pluginScrypt from './pluginScrypt.ts'

// import tsconfigPaths from 'vite-tsconfig-paths'

import pluginScryptPP from './pluginScryptPP.ts'

import pluginDeepkit from './pluginDeepkit.ts'
import pluginTs from './pluginTs.ts'
import { Opts } from './types.d.ts'

export default function pluginKitto(opts: Opts): Plugin[] {


  return [
    // pluginCivet(),
    pluginScryptPP(),
    // tsconfigPaths(),
    // ...pluginAutoImport(),
    pluginScrypt(),
    pluginDeepkit(),
    pluginTs(opts),

  ]
}
