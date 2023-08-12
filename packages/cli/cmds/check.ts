


import { defineCommand } from 'citty'




import { exec, updateProject } from '../utils.ts'

export default defineCommand({
  meta: {
    name: 'check',
    description: 'type check a kitto project',
  },
  async run() {
    await updateProject()
    await exec('tsc -b -w')
  },
})
