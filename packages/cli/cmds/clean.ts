import { execSync } from 'node:child_process'
import { defineCommand } from 'citty'
import { updateProject } from '../utils.ts'

const decoder = new TextDecoder()
export default defineCommand({
  meta: {
    name: 'clean',
    description: 'clean a kitto project',
  },
  async run() {
    // console.info('')
    execSync('rm -rf ./node_modules/')
    execSync('rm -rf ./dist/')
    execSync('find ./packages/*/dist -maxdepth 0 -type d -exec rm -r {} \\;')
    execSync('find ./packages/*/node_modules -maxdepth 0 -type d -exec rm -r {} \\;')

    // console.log(decoder.decode(r))
    await updateProject()
    // await exec('find . -type f -name "*.civet.tsx" -exec rm -f {} \;')
    // await exec('tsc -b --clean')

    const command = 'find . -type f -name "*.civet.tsx" -exec rm {} \\;'
    const r = execSync(command)
    console.log(r.toString())
  },
})
