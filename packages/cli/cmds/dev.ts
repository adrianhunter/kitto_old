import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'init new kitto project',
  },
  args: {

    // appName: {
    //     type: "positional",

    //     description: "app name",
    //     required: true,
    // }

  },
  async run({ args }) {
    return 'asd'
  },
})
