import path from 'node:path'
import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts'
import { cors } from 'https://deno.land/x/hono@v2.7.8/middleware/cors/index.ts'
import { readTSConfig } from 'npm:pkg-types'
import { createPluginContainer } from 'vite'
import pluginKitto from './pluginKitto.ts'
import pluginDriver from './pluginDriver.ts'

const app = new Hono()
const cwd = Deno.cwd()

const plugins = pluginDriver(pluginKitto())

// @ts-expect-error asd
app.use('*', cors())
app.get('/favicon.ico', (c) => {
  return c.newResponse('')
})
app.get('*', async (c) => {
  // const id = c.req.url

  const url = new URL(c.req.url)
  const params = new URLSearchParams(url.searchParams)

  const extname = path.extname(url.pathname)

  const id = path.resolve(cwd, `./${url.pathname}`)

  const code = await Deno.readTextFile(id)

  const tsconfig = await readTSConfig()

  await plugins.configResolved({ tsconfig })

  const r = await plugins.transform({
    code,
    id,
    url,
    params,
    map: null,
    extname,
  })

  if (!r)
    return c.json({ error: 'could not transpile' })

  const ctype = 'application/javascript'

  return c.newResponse(r?.code, {
    headers: {
      'content-type': ctype,
    },
  })
})

Deno.serve({ port: 1337 }, app.fetch)

const container = createPluginContainer()
