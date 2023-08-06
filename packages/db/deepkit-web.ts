import type { DeepkitWorker } from './deepkit-worker.ts'
import * as Comlink from './sqlite3/comlink.mjs'

export class DeepkitClient {
  deepkitWorker: DeepkitWorker

  static async fromURL(url: string) {
    const db = new DeepkitClient(url)

    await db.init()

    // await db.load()
    // const code = await fetch(url).then(a => a.text())

    // const ensureSqlite = `
    // console.log(222)
    // const  { default: sqlite3InitModule } = await import("file:///Users/X/Documents/GitHub/sqlite-wasm-deepkit/src/sqlite3/jswasm/sqlite3.js");

    // const {default: sqlite3InitModule} = await import()
    // globalThis.sqlite3 = await sqlite3InitModule({
    //     print: log,
    //     printErr: error,
    //   })

    //   console.log("WOWOW", globalThis.sqlite3)

    // //   await import(${url.href})
    // `

    // const worker = new Worker(URL.createObjectURL(new Blob([ensureSqlite], { "type": "application/javascript" })), { type: "module" })
  }

  dbWorker: any
  // sqliteClient: SqliteClient

  constructor(

    public dbWorkerPath: string,
    public dbFile = 'example.sql',

  ) {
    // this.sqliteClient= new SqliteClient(dbFile, DbWorkerPath)
  }

  async init() {
    // await this.sqliteClient.init()

    const DbWorker = Comlink.wrap(
      new Worker(this.dbWorkerPath, {
        type: 'module',
      }),
    )

    this.dbWorker = await new DbWorker()

    await this.dbWorker.init(this.dbFile)
  }

  //  executeSql = this.sqliteClient
}
