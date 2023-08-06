// import sqlite3 from 'better-sqlite3'

// console.log("sqlite3sqlite3sqlite3", sqlite3);

import { SQLiteDatabaseAdapter } from '@deepkit/sqlite'
import type { PrimaryKey } from '@deepkit/type'
import { entity } from '@deepkit/type'
import { Database } from '@deepkit/orm'

async function main() {
  @entity.name('user')
  class User {
    public id: number & PrimaryKey = Math.random() * 10000
    created: Date = new Date()

    constructor(public name: string) {
    }
  }

  try {
    const database = new Database(new SQLiteDatabaseAdapter('./example.sqlite'), [User])
  }
  catch (e) {
    console.error(e)
  }

  const database = new Database(new SQLiteDatabaseAdapter('./example.sqlite'), [User])
  await database.migrate() // create tables

  await database.persist(new User('Peter'))

  const allUsers = await database.query(User).find()
  console.log('all users', allUsers)
}

try {
  main()
}
catch (e) {
  console.error(e)
}
