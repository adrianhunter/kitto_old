import { defineCommand } from 'npm:citty'
import { consola } from 'consola'
import { readTSConfig, type TSConfig } from 'pkg-types'
import * as pp from 'pkg-types'



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




    const importMap = await getImportMap()
    if (importMap) {

      await Deno.writeTextFile(importMap.path, JSON.stringify(importMap.map, null, 2))


      const compilerOpts = await getCompilerOptions()

      const targetMap = new URL('../../plugins/import_maps/active_compiler_options.json', import.meta.url)

      await Deno.writeTextFile(targetMap, JSON.stringify(compilerOpts, null, 2))
      // const defaultImportMap = JSON.parse()

      const command = new Deno.Command(Deno.execPath(), {
        args: [
          'run',
          '-A',
          "--import-map",
          importMap.path.href,
          new URL("../../plugins/server.ts", import.meta.url).href
        ],
      })
      const server = command.spawn()
      consola.success("ready")
      await server.status

    } else {
      throw new Error(`could not find import map`)
    }




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

  },
})
import ts from "typescript"
async function getCompilerOptions(): Promise<TSConfig["compilerOptions"]> {
  const defaultOpts: TSConfig["compilerOptions"] = {

    target: ts.ScriptTarget.ESNext,
    jsx: ts.JsxEmit.React,

    outDir: "dist",

    module: ts.ModuleKind.ESNext,
    // rootDir: Deno.cwd(),
    jsxImportSource: 'react',
    // target: "esnext",
    // jsx: "react-jsxdev",
    // module: "esnext",
    // // "allowArbitraryExtensions": true,

    // moduleResolution: "Bundler",


    // "jsxImportSource": "preact"
    // target: ts.ScriptTarget.ESNext,
    // jsx: ts.JsxEmit.React,
    // jsxImportSource: 'react',
  }





  const denoJSON = JSON.parse(await Deno.readTextFile(Deno.cwd() + "/deno.json",))




  return {
    ...defaultOpts,
    ...denoJSON.compilerOptions
  }



}

async function getImportMap(): Promise<{ map: any, path: URL } | undefined> {
  const cwd = Deno.cwd()

  let importMap: any | null = null

  const importMapPath = cwd + "/importMap.json"

  try {
    const imp = await Deno.readTextFile(importMapPath)


    importMap = JSON.parse(imp)


  } catch (e) { }

  if (importMap) {

    const defaultImportMap = JSON.parse(await Deno.readTextFile(new URL('../../../import_map.json', import.meta.url)))

    const merged = {
      imports: {
        ...defaultImportMap.imports,
        ...importMap.imports
      }
    }

    const targetMap = new URL('../../plugins/import_maps/active_import_map.json', import.meta.url)

    return {
      map: merged,
      path: targetMap
    }


  }

}
