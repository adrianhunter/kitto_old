import {contract} from "@kitto/scrypt/contract.ts"

@contract
export class Counter {
  count: bigint
  constructor(
    count: bigint
  ) {
    this.count = count
  }
  inc() {
    this.count++
    return this
  }
}





let counter = new Counter(1n)
console.log(counter)




setTimeout(() => {

  console.log(counter.inc())


}, 1000)




// for (let i = 0; i < 3; ++i) {


//   counter = counter.inc()


//   console.log(counter)

// }

