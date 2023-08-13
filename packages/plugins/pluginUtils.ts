import path from 'node:path'
import type { TSConfig } from 'pkg-types'

const cwd = Deno.cwd()
const dirs: { [key: string]: boolean } = {}

function getOutputPath(fileName: string, config: TSConfig) {
  let rootDir = ""
  if (config.compilerOptions?.rootDir) {
    rootDir = `/${config.compilerOptions?.rootDir}`
  }
  fileName = fileName.replace(`${cwd}${rootDir}`, '')
  fileName = `./${config.compilerOptions?.outDir || "dist"}${fileName}`
  const dirname = path.dirname(fileName)
  if (!dirs[dirname]) {
    try {
      Deno.mkdirSync(dirname, { recursive: true })
      dirs[dirname] = true
    }
    // deno-lint-ignore no-empty
    catch (_e) { }
  }
  return fileName
}

export default { getOutputPath }



// import * as ts from 'typescript';
// import * as path from 'path';

// function getOutputFilePath(tsconfigPath: string, inputFile: string): string | null {
//     const parsedConfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

//     if (parsedConfig.error) {
//         console.error("Error reading tsconfig:", parsedConfig.error);
//         return null;
//     }

//     const parsedCommandLine = ts.parseJsonConfigFileContent(parsedConfig.config, ts.sys, path.dirname(tsconfigPath));

//     if (parsedCommandLine.errors && parsedCommandLine.errors.length) {
//         console.error("Error parsing tsconfig content:", parsedCommandLine.errors);
//         return null;
//     }

//     const outDir = parsedCommandLine.options.outDir || '';
//     const rootDir = parsedCommandLine.options.rootDir || path.commondir(parsedCommandLine.fileNames);

//     const relativeToRoot = path.relative(rootDir, inputFile);
//     return path.join(outDir, relativeToRoot).replace(/\.tsx?$/, '.js');
// }

// const tsconfigPath = './tsconfig.json'; // Adjust the path if your tsconfig is elsewhere
// const inputFile = './src/utils/helper.ts'; // Your input TypeScript file path

// const output = getOutputFilePath(tsconfigPath, inputFile);
// if (output) {
//     console.log(`Output file will be: ${output}`);
// } else {
//     console.error("Could not determine the output file path.");
// }
