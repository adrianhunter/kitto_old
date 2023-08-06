import * as Comlink from './sqlite3/comlink.mjs'
import { default as sqlite3InitModule } from './sqlite3/jswasm/sqlite3-bundler-friendly.mjs'

const log = (...args) => console.log(...args)
const error = (...args) => console.error(...args)

class DeepkitWorker {
  db
  init(dbFile) {
    return new Promise((resolve) => {
      sqlite3InitModule({
        print: log,
        printErr: error,
      }).then((sqlite3) => {
        globalThis.sqlite3 = sqlite3

        // return import(dbFile)

        console.log('READY')
        // try {
        //   this.db = new sqlite3.oo1.OpfsDb(dbFile);
        // } catch (err) {
        //   error(err.name, err.message);
        // }

        // return resolve(true);
      })
    })
  }

  iniXXt(dbFile) {
    return new Promise((resolve) => {
      sqlite3InitModule({
        print: log,
        printErr: error,
      }).then((sqlite3) => {
        try {
          this.db = new sqlite3.oo1.OpfsDb(dbFile)
        }
        catch (err) {
          error(err.name, err.message)
        }

        return resolve(true)
      })
    })
  }

  executeSql(sqlStatement, bindParameters, callback) {
    return callback(
      this.db.exec({
        sql: sqlStatement,
        bind: bindParameters,
        returnValue: 'resultRows',
        rowMode: 'array',
      }),
    )
  }
}

export type { DeepkitWorker }

Comlink.expose(DeepkitWorker)
