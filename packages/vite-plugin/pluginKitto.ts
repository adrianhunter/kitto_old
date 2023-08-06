import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

import { pluginCivet } from './pluginCivetSimple.ts'
import { pluginAutoImport } from './pluginAutoImport.ts'
import { pluginConfig } from './pluginConfig.ts'
import { pluginScrypt } from './pluginScrypt.ts'
import { pluginDeepkit } from './pluginDeepkit.ts'

export function pluginKitto() {
  return [
    Inspect(),
    pluginAutoImport(),
    tsconfigPaths(),
    pluginScrypt(),
    pluginCivet(),
    pluginDeepkit(),

    // {
    //   // stripTypes: false,
    //   // outputExtension: 'tsx',
    //   // outputTransformerPlugin: 'vite:esbuild',
    // }
    // pluginCjs(),
    // pluginTs(opts),
    ...pluginConfig(),
  ]
}
