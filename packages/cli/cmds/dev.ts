import { defineCommand } from 'npm:citty'

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'develop a kitto',
  },
  args: {

    // entry: {
    //     type: "positional",
    //     "default": "index.tsx",
    //     description: "app name",
    // }

  },
  async run({ args }) {
    // deno run -A --no-check --watch ./server.tsx
    // Deno.chdir(new URL("../app", import.meta.url))
    // const x = path.resolve(Deno.cwd(), args.entry)

    // console.log(x)

    // const serverPath = new URL("../app/dev.ts", import.meta.url)

    // const command = new Deno.Command(Deno.execPath(), {
    //   args: [
    //    "task", "dev"
    //   ],
    // })
    // const command = new Deno.Command(Deno.execPath(), {
    //   args: [
    //     'run',
    //     '-A',
    //     "--watch",
    //     serverPath.href
    //   ],
    // })
    // const server = command.spawn()

    // await server.status
  },
})
