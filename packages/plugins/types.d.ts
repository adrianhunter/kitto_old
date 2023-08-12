export type TransformResult = Opts
import { TSConfig } from 'npm:pkg-types'


export interface Opts {
   code: string
   map: null | string
   id: string 
   url: URL,
   params: URLSearchParams,
   extname: string
}
export interface Config {

  tsconfig: TSConfig
}
export interface Plugin {
  name: string
  enforce?: 'pre' | "post"
  extnames: string[]
  transform: (opts: Opts) => Promise<TransformResult>
  configResolved?: (config: Config) => Promise<void>

}
