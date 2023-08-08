import { defineCommand } from 'citty'
import { exec, updateProject } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'bundle',
    description: 'bundle a kitto project',
  },
  args: {
    watch: {
      type: 'boolean',
      default: false,
      description: 'watch bundle process',
      required: false,
    },
  },
  async run({ args }) {
    await updateProject()
    await Promise.all([
      // exec(`tsc -b${watchCmd}`),
      exec('pnpm run build'),
      // exec(`deno run -A npm:vite build${watchCmd}`),

    ])
  },
})
