import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'
import { pluginAutoImport } from './pluginAutoImport.ts'
import { pluginConfig } from './pluginConfig.ts'
import { pluginScrypt } from './pluginScrypt.ts'

export function pluginKitto() {
  return [
    Inspect(),
    pluginAutoImport(),
    tsconfigPaths(),
    pluginScrypt(),
    // pluginCivet(opts),
    // pluginCjs(),
    // pluginTs(opts),
    ...pluginConfig(),
  ]
}
