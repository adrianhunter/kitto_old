import type { Plugin, Opts, Config } from "./types.d.ts"
export default function pluginDriver(plugins: Plugin[]) {
  return {
    async configResolved(config: Config) {
      for await (const x of plugins) {

        if (x.configResolved) {
          await x.configResolved(config)

        }
      }
      // return opts
    },
    async transform(opts: Opts) {
      for await (const x of plugins) {
        if (x.transform && x.extnames.includes(opts.extname)) {
          opts = await x.transform(opts)
        }
      }
      return opts
    },
  }
}
