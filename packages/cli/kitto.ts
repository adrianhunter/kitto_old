import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'kitto',
    version: '0.0.1',
    description: 'Citty playground CLI',
  },
  subCommands: {
    init: () => import('./cmds/init.ts').then(r => r.default),
    install: () => import('./cmds/install.ts').then(r => r.default),
    eval: () => import('./cmds/eval.ts').then(r => r.default),
    run: () => import('./cmds/run.ts').then(r => r.default),
    build: () => import('./cmds/build.ts').then(r => r.default),
    dev: () => import('./cmds/dev.ts').then(r => r.default),
    check: () => import('./cmds/check.ts').then(r => r.default),
    clean: () => import('./cmds/clean.ts').then(r => r.default),
  },
})

export default runMain(main)
