import type { Plugin, Config} from './types.d.ts'
import { ScryptProgram } from './scrypt/scryptProgram.ts'
import { compileContract } from './scrypt/scryptlib/utils.ts'
import { TSConfig } from 'pkg-types'
import { getOutputPath } from '@kitto/plugins/pluginUtils.ts'

// import {transform as pp} from "./scrypt/preprocess.ts"

export default function pluginScrypt(): Plugin {
  const cwd = Deno.cwd()

  let config: Config

  let program: ScryptProgram

  return {
    name: 'kitto:scrypt',
    enforce: 'pre',
    extnames: [".ts", ".tsx", ".mts", ".cts"],

    async configResolved(c) {
      config = c

      program  = new ScryptProgram(config.tsconfig)
    },
    // deno-lint-ignore require-await
    async transform(opts) {
      const a = opts.id.includes(".scrypt.")
      const b = opts.params.has("scrypt")
      if (!a && !b) {
        return opts
      }
      try {
        // const scryptCode = pp(opts.code)

        const r = program.compile(opts.code, opts.id)


        

        const scryptFile = getOutputPath(opts.id.replace(".ts", ".scrypt"), config.tsconfig)


        const scryptCode = await Deno.readTextFile(scryptFile)

        const rr = await compileContract({code: scryptCode, id: scryptFile}, {artifact: true, out: Deno.cwd() + "/artifacts"})
        
        opts.code = r.outputFiles[1].text


       opts.code  = opts.code.replace("___ARTIFACT___", JSON.stringify(rr.toArtifact()))

        
      }
      catch (e) {
        console.error(e)
        throw e
      }

      return opts
    },
  }
}

const cwd = Deno.cwd()


// function getScryptFile(fileName: string, config: TSConfig) {


//   const wow = fileName.replace(cwd +`/src`,  cwd + "/artifacts")
//   // const dirname = path.dirname(wow)

//   // Deno.mkdirSync(dirname, {recursive: true})


//   // Deno.writeTextFileSync(wow, content)

//   return wow + ".scrypt"
//   // const tempDir = os.tmpdir()
//   // const tempFilename = 'tmp.scrypt'
//   // const tempFilePath = path.join(tempDir, tempFilename)

//   // try {
//   //   fss.writeFileSync(tempFilePath, content)

//   //   return tempFilePath
//   // }
//   // catch (err) {
//   //   console.error('Error creating temporary file:', err)
//   //   throw err
//   // }
// }
