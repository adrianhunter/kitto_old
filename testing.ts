/* eslint-disable optimal-modules/no-named-exports */
// import * as x from 'npm:chai'
import { assert } from 'npm:chai'

export { assert }

// console.log(x.assert)

export { describe, it, beforeAll, beforeEach, afterEach } from 'https://deno.land/std@0.198.0/testing/bdd.ts'
