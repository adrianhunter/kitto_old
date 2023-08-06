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
    await Promise.all([
      // exec(`tsc -b${watchCmd}`),
      exec(`./node_modules/.bin/vite build${watchCmd}`),
      // exec(`deno run -A npm:vite build${watchCmd}`),

    ])
    await exec(`tsc -b${watchCmd}`)
  },
})
