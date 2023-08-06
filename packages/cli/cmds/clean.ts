import { defineCommand } from 'citty'
import { exec, updateProject } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'clean',
    description: 'clean a kitto project',
  },
  async run() {
    await updateProject()
    await exec('tsc -b --clean')
  },
})
