import { defineCommand } from 'citty'
import { exec, updateProject } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'build',
    description: 'build a kitto project',
  },
  args: {
    watch: {
      type: 'boolean',
      default: false,
      description: 'watch build process',
      required: false,
    },
  },
  async run({ args }) {
    await updateProject()
    const watchCmd = args.watch ? ' -w' : ''
    const buildCmd = args.watch ? 'build:watch' : 'build'
    await exec('pnpm i')

    await Promise.all([

      // exec(`tsc -b${watchCmd}`),
      exec(`pnpm run ${buildCmd}`),
      // exec(`deno run -A vite build${watchCmd}`),

    ])
    await exec(`tsc -b${watchCmd}`)
  },
})
