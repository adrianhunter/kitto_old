// await import("../sqlite3/sqlite3.js");
// let sqlite3;

// try {
//     sqlite3 = await self.sqlite3InitModule({});
// } catch (e) {
//     console.error(e);
// }
// let _DB;
// if (!sqlite3.opfs) {
//     console.error("no OPFS SUPPORT!!");
// }

// if (sqlite3.opfs) {
//     _DB = sqlite3.opfs.OpfsDb;
// } else {
//     throw new Error("NO OPFS!");
// }
const _STMT = globalThis.sqlite3.oo1.Stmt
const _DB = globalThis.sqlite3.opfs.OpfsDb
// const Database = initApiDeno(_DB);
const Database = _DB

Database.Statement = _STMT
Database.Database = Database

export default Database
