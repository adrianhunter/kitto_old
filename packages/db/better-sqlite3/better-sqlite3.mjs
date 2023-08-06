import sqlite3InitModule from '../sqlite3/jswasm/sqlite3-bundler-friendly.mjs'
import initApiDeno from './api.browser.mjs'

// import sqlite3InitModule from '../sqlite3/jswasm/sqlite3-bundler-friendly.mjs';

let sqlite3

try {
  sqlite3 = await sqlite3InitModule({})
}
catch (e) {
  console.error(e)
}
let _DB
if (!sqlite3.opfs && !sqlite3.oo1.OpfsDb)
  console.error('no OPFS SUPPORT!!')

if (sqlite3.opfs)
  _DB = sqlite3.oo1.OpfsDb

else if (sqlite3.oo1.OpfsDb)
  _DB = sqlite3.oo1.OpfsDb

else

  throw new Error('NO OPFS!')

const _STMT = sqlite3.oo1.Stmt

const Database = _DB

initApiDeno(_DB)
Database.Statement = _STMT
Database.Database = Database

export default Database
