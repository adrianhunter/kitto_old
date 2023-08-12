import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'eval',
    description: 'eval code',
  },
  args: {


    fileName: {
      type: 'positional',

      description: 'eval to run',
      required: true,
    },


  },
  async run({ args }) {


    await Deno.eval(args.code)

    // const { createDb } = await import("../db.ts");
    // const { PluginContainer } = await import("../pluginContainer.ts");

    // const fpath = args.fileName

    // const cwd = Deno.cwd()

    // // const finalP = path.resolve(cwd, fpath)
    // const finalP = fpath

    // const channel = SM.makeChannel() as SM.Channel;

    // const worker = new Worker(new URL("../worker.ts", import.meta.url), { type: "module" })

    // interface Msg {
    //   method: "fetch" | "db.get" | "db.set" | "done" | "vite"
    //   args: string[],
    //   messageId: string
    // }
    // const plugins = await import("../plugins/pluginKitto.ts")

    // const container = new PluginContainer(plugins.pluginKitto())

    // const fileEntries: any = {}

    // const src = await Deno.readTextFile(finalP)

    // console.log(src)

    // const srcT = await container.transform(src, finalP)
    // console.log("CODDD ", srcT)

    // fileEntries[fpath] = {
    //   type: "file",
    //   content: srcT
    // }

    // const db = await createDb(fileEntries)

    // // const ready = new Promise((res) => {
    // const proc = new Promise((res) => {

    //   worker.addEventListener("close", () => {

    //     console.log("CLOSING-------")
    //   })
    //   worker.addEventListener("message", async (m) => {

    //     console.log("GOT MESS", m.data)
    //     const msg: Msg = m.data

    //     if (msg.method === "fetch") {
    //       const r = await fetch(msg.args[0]).then(a => a.text())

    //       SM.writeMessage(channel, r, msg.messageId);
    //     } else if (msg.method === "db.get") {
    //       const r = await db.get(msg.args)

    //       SM.writeMessage(channel, r, msg.messageId);
    //     } else if (msg.method === "done") {

    //       db.close()
    //       res(true)

    //     } else {

    //       console.error(msg.method, "not found")
    //     }

    //     // res(true)
    //   })

    //   // setTimeout(() => {

    //   // }, 2000)

    // })
    // // })

    // worker.postMessage({ channel })

    // // await ready

    // console.log("MAIN READY")

    // worker.postMessage({ run: finalP })

    // return await proc

  },
})

// import SM from "npm:sync-message";

// async function main(args: typeof Deno.args) {

// }

// if (import.meta.main) {
//     await main(Deno.args)
// }

// Deno.test(`cli`, async () => {
//     console.log("STRAT")

//     await main(["run", "contract.js"])
//     console.log("DONE")

// })

// import { getQuickJS } from "npm:quickjs-emscripten"

// console.log(Deno.args)

// const fpath = Deno.args[1]

// const cwd = Deno.cwd()

// import path from "node:path"
// import { keys } from "https://esm.sh/v129/object-hash@3.0.0/denonext/object-hash.mjs"

// const finalP = path.resolve(cwd, fpath)

// const src = await Deno.readTextFile(finalP)

// // const src = await Deno.readFile(new URL())

// const QuickJS = await getQuickJS()

// const runtime = QuickJS.newRuntime()
// import {parse} from "npm:acorn"
// import {transform}  from "npm:cjs-es"
// // import * as esbuild from "https://raw.githubusercontent.com/esbuild/deno-esbuild/main/mod.js"
// // await init();

// async function cjsToEsm(code: string) {

//  return   transform({code, ast: parse(code, {ecmaVersion: "latest"})})
//   .then(result => {
//     console.log(result.code);
//     return result.code
//     /* ->
//     function foo() {}
//     function bar() {}
//     export {foo};
//     export {bar};
//     */
//   });
// }

// async function resolve(pkg: string): Promise<string> {

//     // const [proto, asd] = pkg.split(":")

//     // const pkgJSON = await fetch(`https://cdn.jsdelivr.net/npm/${pkg}@latest/package.json`).then(a => a.json())

//     // const main = pkgJSON.main
//     let mainFile=   await fetch(`https://cdn.jsdelivr.net/npm/${pkg}`).then(a => a.text())

//     // acorn
//     // const r = await esbuild.transform(mainFile, {
//     //     "target": "esnext",
//     //     format: "esm",
//     //     loader: "js"
//     // })

//     mainFile = await cjsToEsm(mainFile)

//     // console.log(mainFile)

//     // const rrr = parse(mainFile);

//     // console.log(rrr)
//     // console.log(reexports)

//     return mainFile
// }

// runtime.setModuleLoader(async (moduleName) => {

//     console.log("LOADING ", moduleName)

//     const r = await resolve(moduleName)

//     return `export default '${moduleName}'`
// })

// const vm = runtime.newContext()

// // const world = vm.newString("world")
// // vm.setProp(vm.global, "NAME", world)
// // world.dispose()

// const bindings: any = {
//     console: {
//         log(...args: any[]) {
//             const nativeArgs = args.map(vm.dump)
//             console.log(...nativeArgs)
//         },
//         info(...args: any[]) {
//             const nativeArgs = args.map(vm.dump)
//             console.info(...nativeArgs)
//         }
//     }
// }

// Object.entries(bindings).forEach(([a, b]) => {

//     const bindObjOrFunc = bindings[a]

//     const consoleHandle = vm.newObject()

//     let handles: any[] = []

//     Object.entries(bindObjOrFunc).forEach(([key, entry]) => {

//         const logHandle = vm.newFunction(key, entry as any)

//         vm.setProp(consoleHandle, key, logHandle)

//         handles.push(logHandle)

//     })
//     vm.setProp(vm.global, a, consoleHandle)
//     consoleHandle.dispose()

//     handles.forEach(a => a.dispose())

//     // console.log(typeof a)
//     // console.log("---")

//     // console.log(b)

// })

// // Partially implement `console` object
// // logHandle.dispose()

// vm.unwrapResult(vm.evalCode(src)).dispose()
// // const result = vm.evalCode(src)
// // if (result.error) {
// //   console.log("Execution failed:", vm.dump(result.error))
// //   result.error.dispose()
// // } else {
// //   console.log("Success:", vm.dump(result.value))
// //   result.value.dispose()
// // }

// // vm.dispose()

// // async function main() {

// // }

// // main()
