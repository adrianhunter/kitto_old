import { defineCommand } from 'citty'
import { emitViteDevConfig, exec } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'develop a kitto',
  },
  args: {

    // appName: {
    //     type: "positional",

    //     description: "app name",
    //     required: true,
    // }

  },
  async run({ args }) {
    // await updateProject()
    await emitViteDevConfig()
    await Promise.all([
      exec('pnpm run dev'),
      // exec('deno run --import-map /Users/X/Documents/GitHub/kitto/import_map.json -A npm:vite'),
    ])
  },
})
