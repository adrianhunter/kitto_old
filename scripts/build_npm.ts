// ex. scripts/build_npm.ts
import { build, emptyDir } from 'https://deno.land/x/dnt@0.38.0/mod.ts'

await emptyDir('./npm')

// const pkgs = [new URL("../packages/scrypt")]

await build({
  entryPoints: ['../packages/scrypt/contract.ts', '../packages/scrypt/wallet.ts'].map(a => new URL(a, import.meta.url).pathname),
  outDir: './npm',
  // rootTestDir: 'test',

  test: false,
  importMap: './import_map.json',

  declaration: 'inline',
  esModule: true,

  scriptModule: false,
  // "package": {

  // },
  packageManager: 'pnpm',

  typeCheck: false,
  skipSourceOutput: true,

  shims: {

    // see JS docs for overview and more options
    deno: true,
  },
  package: {

    // package.json properties
    name: '@kitto/scrypt',
    version: Deno.args[0],
    description: 'Your package.',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/username/repo.git',
    },
    bugs: {
      url: 'https://github.com/username/repo/issues',
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    // Deno.copyFileSync('LICENSE', 'npm/LICENSE')
    Deno.copyFileSync('README.md', 'npm/README.md')
  },
})
