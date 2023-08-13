// export type TransformResult = Opts
// import { TSConfig } from 'npm:pkg-types'
import type { TSConfig } from 'pkg-types'


export interface Opts {
  tsconfig: TSConfig
}

// export interface Opts {
//    code: string
//    map: null | string
//    id: string 
//    url: URL,
//    params: URLSearchParams,
//    extname: string
// }
export interface Config {

  tsconfig: TSConfig
}
// export interface Plugin {
//   name: string
//   enforce?: 'pre' | "post"
//   extnames: string[]
//   transform: (opts: Opts) => Promise<TransformResult> | TransformResult
//   configResolved?: (config: Config) => Promise<void>

// }
import type { Plugin as PluginVite } from "vite"


export { PluginVite }
// export interface PluginVite {
//   name: string
//   enforce?: 'pre' | "post"
//   extnames: string[]
//   transform: (code: string, id: string) => Promise<TransformResult> | TransformResult
//   configResolved?: (config: Config) => Promise<void>

// }
