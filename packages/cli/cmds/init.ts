import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import consola from 'consola'
import { exec } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'init new kitto project',
  },
  args: {

    appName: {
      type: 'positional',

      description: 'app name',
      required: true,
    },

  },
  async run({ args }) {
    const absolutePath = path.join(process.cwd(), args.appName)
    if (fs.existsSync(absolutePath)) {
      consola.error('APP ALREADY EXISTS')
      return
    }

    await Deno.mkdir(`${absolutePath}/packages/app`, {
      recursive: true,

    })

    const wsPath = `${absolutePath}/${args.appName}.code-workspace`

    await Deno.writeTextFile(wsPath, JSON.stringify({
      packages: 'packages/*',
      folders: [
        {
          path: '.',
        },
        {
          path: 'packages/app',
        },
      ],
      settings: {
        'files.exclude': {
          'scrypt.index.json': true,
          'pnpm-lock.yaml': true,
          'tsconfig.json': true,
          'node_modules': true,
          'pnpm-workspace.yaml': true,
        },
      },

    }, null, 2))
    await exec(`code -n ${wsPath}`)
  },
})
