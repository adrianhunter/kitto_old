import { defineCommand, runMain } from 'citty'

// const modules = import.meta.glob('./cmds/*.ts')
// console.log(import.meta, modules)
const main = defineCommand({
  meta: {
    name: 'kitto',
    version: '1.0.0',
    description: 'Citty playground CLI',
  },
  subCommands: {
    // init: () => import('./cmds/init.ts').then(r => r.default),
    run: () => import('./cmds/run.ts').then(r => r.default),
    build: () => import('./cmds/build.ts').then(r => r.default),
    dev: () => import('./cmds/dev.ts').then(r => r.default),

    check: () => import('./cmds/check.ts').then(r => r.default),
    clean: () => import('./cmds/clean.ts').then(r => r.default),

  },
})

export default runMain(main)
