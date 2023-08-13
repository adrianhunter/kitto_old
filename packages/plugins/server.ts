import path from "node:path";
import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

// import { ResolvedConfig, resolveConfig } from "npm:vite";
import { createPluginContainer } from "./PluginContainer.ts";
import pluginKitto from "./pluginKitto.ts";
import { Opts } from "./types.d.ts";
import type { ResolvedConfig } from "vite";
// import { resolveConfig } from "npm:vite";
import { resolveConfig } from "./utils.ts"
const app = new Hono();
const root = "/Users/X/Documents/GitHub/kitto";
const cwd = Deno.cwd();

// const plugins = pluginDriver(pluginKitto())

const configPlugins: Opts = {
  tsconfig: {
    compilerOptions: JSON.parse(
      Deno.readTextFileSync(
        new URL("./import_maps/active_compiler_options.json", import.meta.url),
      ),
    ),
  },
};
console.log("🚀 ~ file: server.ts:26 ~ configPlugins:", configPlugins)

const config = await resolveConfig({
  plugins: [
    pluginKitto(configPlugins),
  ],
  esbuild: false,
  build: {
    target: "esnext",
    modulePreload: false,
    rollupOptions: {
      output: {
        format: "esm",
      },
    },
  },
}, "serve");

// import config from "./config/vite.config.json" assert {type: "json"}


await Deno.writeTextFile("./config.json", JSON.stringify(config.build, null, 2))

// const config: ResolvedConfig = {
//   command: "serve",
//   plugins: [
//     //@ts-ignore
//     pluginKitto(configPlugins)
//   ]

// }

const container = await createPluginContainer(config);

// app.use("*", cors());
app.get("/favicon.ico", (c) => {
  return c.newResponse("");
});

import * as wow from 'npm:pkg-types'



app.get("*", async (c) => {
  // const id = c.req.url

  // container




  // return c.newResponse("XXX", {
  //   headers: {
  //     // 'content-type': ctype,
  //   },
  // });


  const agent = c.req.headers.get("User-Agent") || " ";

  const isDenoReq = agent?.includes("Deno/");

  // console.log("🚀 ~ file: server.ts:47 ~ app.get ~ cwd:", cwd)
  const url = new URL(c.req.url);


  // const base  = path.join(cwd, path.resolve( root, url.pathname))
  // const id = path.join(root, url.pathname);

  // // console.log("🚀 ~ file: server.ts:47 ~ app.get ~ url:", url)
  // // const params = new URLSearchParams(url.searchParams)

  // const extname = path.extname(id);

  const id = path.resolve(cwd, `./${url.pathname}`)

  console.log("🚀 ~ file: server.ts:102 ~ app.get ~ id:", id)
  console.log("🚀 ~ file: server.ts:102 ~ app.get ~ id:", id)
  console.log("🚀 ~ file: server.ts:102 ~ app.get ~ id:", id)
  console.log("🚀 ~ file: server.ts:102 ~ app.get ~ id:", id)
  console.log("🚀 ~ file: server.ts:102 ~ app.get ~ id:", id)
  // // console.log("🚀 ~ file: server.ts:54 ~ app.get ~ id:", id)
  const code = await Deno.readTextFile(id);

  // if(isDenoReq && extname === ".tsx") {
  //   return c.newResponse(code, {
  //     headers: {
  //       'content-type': "text/tsx",
  //     },
  //   })
  // }


  // const filename = await wow.findFile('app/src/Counter.scrypt.tsx', {
  //   startingFrom: url.pathname,
  //   rootPattern: /^node_modules$/,
  //   matcher: filename => filename.endsWith('.tsx'),
  // })
  // console.log("🚀 ~ file: server.ts:136 ~ app.get ~ filename:", filename)
  // console.log("🚀 ~ file: server.ts:136 ~ app.get ~ filename:", filename)
  // console.log("🚀 ~ file: server.ts:136 ~ app.get ~ filename:", filename)

  // // const tsconfig = await readTSConfig()
  const r = await container.transform(code, id);
  // console.log("🚀 ~ file: server.ts:108 ~ app.get ~ r:", r)

  // await plugins.configResolved({ tsconfig })

  // const r = await plugins.transform({
  //   code,
  //   id,
  //   url,
  //   params,
  //   map: null,
  //   extname,
  // })

  if (!r) {
    return c.json({ error: "could not transpile" });
  }

  const ctype = "application/javascript";

  return c.newResponse(r.code, {
    headers: {
      "content-type": ctype,
    },
  });
});

Deno.serve({ port: 1337 }, app.fetch);
