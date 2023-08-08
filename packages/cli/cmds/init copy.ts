import consola from 'consola'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'init new kitto project',
  },
  args: {

    appName: {
      type: 'positional',

      description: 'app name',
      required: true,
    },

  },
  async run({ args }) {
    consola.log('init')

    // consola.log("Parsed args:", args);

    // await Deno.mkdir(args.appName)

    // await Deno.mkdir(args.appName + "/" + ".vscode")
    // await Deno.mkdir(args.appName + "/" + "src")

    const files: { [key: string]: string } = {
      'index.html': '<script type="module" src="src/mod.civet"></script>',
      '.vscode/settings.json': JSON.stringify({

      }),

      'package.json': `
{
    "name": "demo",
    "version": "1.0.0",
    "description": "",
    "type": "module",
    "main": "index.js",
    "scripts": {
        "dev": "vite"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        "scrypt-ts": "^1.0.1",
        "unplugin-auto-import": "^0.16.6",
        "vite": "^4.4.7"
    }
}
          
        `,

      'tsconfig.json': `

        {
          "compilerOptions": {
                  "lib": [
                  "ESNext",
                  "DOM"
                  ],
                  "module": "esnext",
                  "target": "esnext",
                  "moduleResolution": "Bundler",
                  "experimentalDecorators": true,
                  "allowImportingTsExtensions": true,
                  "allowArbitraryExtensions": true,
                  "outDir": "dist",
                  "downlevelIteration": true,
                  "jsx": "preserve",
                  "declarationMap": true,
                  "declaration": true,
                  "skipLibCheck": true,
                  "emitDeclarationOnly": true,
                  "allowSyntheticDefaultImports": true,
                  "forceConsistentCasingInFileNames": true,
                  "allowJs": true,
                  "noEmit": true,
                  "types": []
          },
              "reflection": true,
              "include": [
                  "auto-imports.d.ts",
                  "src",
              ],
              "paths": {
                  "npm:*":[
                      "./node_modules/*"
                  ]
              }
      }
          
        `,

      'vite.config.ts': `

        import {defineConfig} from "vite"
        import AutoImport from 'unplugin-auto-import/vite'
        
        const xxx =   AutoImport({
          imports: [
        
            {
        
        
              "npm:scrypt-ts/dist/smart-contract/contract.js": [
        
                "SmartContract"
              ],
        
            }
           
          ],
        })
        
        import tsconfigPaths from 'vite-tsconfig-paths'
        
        export default defineConfig({
        
        
            
            plugins: [
        
              tsconfigPaths(),
              {
                ...xxx,
                vite: undefined,
                handleHotUpdate: undefined,
                transformInclude: undefined,
                configResolved: undefined,
                buildStart: undefined,
        
              }
            ]
        
        
        })
                
                
        
        `,

      'src/mod.civet': 'console.log("BRO ----XXX----", typeof bsv)',
      'deno.jsonc': JSON.stringify({}),
    }

    // files[`.vscode/${args.appName}.code-workspace`] = JSON.stringify({
    //   folders: [

    //     {
    //       path: '../src',
    //     },

    //     {
    //       path: '.',
    //     },
    //   ],
    //   settings: {

    //     'deno.enable': true,
    //     'deno.unstable': true,

    //     'deno.config': './deno.jsonc',

    //   },

    // }, null, 2)

    // await Promise.all(Object.entries(files).map(([keys, enty]) => {

    //   // return Deno.writeTextFile(`${args.appName}/${keys}`, enty)
    // }))
  },
})
