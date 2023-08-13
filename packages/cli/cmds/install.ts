import { defineCommand } from 'citty'
import { exec, updateProject } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'install',
    description: 'install a kitto project',
  },
  args: {
    name: {
      type: 'string',
      description: 'watch install process',
      required: false,
    },
  },
  async run({ args }) {

    if (args.name) {


    }
    await updateProject()


    await Promise.all([

      // exec(`tsc -b${watchCmd}`),
      exec(`pnpm install --ignore-scripts`),
      // exec(`deno run -A vite build${watchCmd}`),

    ])
  },
})
