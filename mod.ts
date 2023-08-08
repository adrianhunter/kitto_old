/// <reference types="vite/client" />


// export * as app from './packages/app/mod.ts'

export default import.meta.glob('./packages/*/mod.ts', {
  eager: true,
})

// // import('./packages/app/sw.ts')

// export class NICE {
//     asd = 123
// }

// export * as db from './packages/db/db.ts'
// export * as cli from './packages/cli/mod.ts'
// export * as examples from './packages/examples/mod.ts'

// export * as vitePlugin from './packages/vite-plugin/mod.ts'

// import('./packages/app/sw.ts')
// import('./packages/app/lib/app.worker.ts')
// import('./packages/app/lib/db/sqlean.wasm?url')
