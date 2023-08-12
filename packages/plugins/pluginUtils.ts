import { TSConfig } from "pkg-types"

const cwd = Deno.cwd()
import path from "node:path"

const dirs: {[key: string]: boolean} = {}

export function getOutputPath(fileName: string, config: TSConfig) {

  fileName = fileName.replace(cwd + `/${config.compilerOptions?.rootDir}`, "")

  fileName=  `./${config.compilerOptions?.outDir}${fileName}`
  // const wow = fileName.replace(cwd, `./${config.compilerOptions?.outDir}`)
  // console.log("🚀 ~ file: scryptProgram.ts:389 ~ createTemporaryFile ~ wow:", fileName)
  const dirname = path.dirname(fileName)

  if(!dirs[dirname]) {

    try {
      Deno.mkdirSync(dirname, {recursive: true})
  
  
      dirs[dirname] = true
  
    }catch(e) {}
  }




  

  // Deno.writeTextFileSync(wow, content)

  return fileName
  // const tempDir = os.tmpdir()
  // const tempFilename = 'tmp.scrypt'
  // const tempFilePath = path.join(tempDir, tempFilename)

  // try {
  //   fss.writeFileSync(tempFilePath, content)

  //   return tempFilePath
  // }
  // catch (err) {
  //   console.error('Error creating temporary file:', err)
  //   throw err
  // }
}
