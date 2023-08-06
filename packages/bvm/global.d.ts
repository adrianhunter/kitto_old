/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
export { }
declare global {
    // const describe: any
    // const it: any
    // const bsv: any
    // const assert: any

    export interface Signature {
      r: Iterable<number> | ArrayLike<number>
      s: Iterable<number> | ArrayLike<number>
    }


    export interface Point {
        x: Buf;
        y: Buf;
      }
  
    export interface Buf extends Iterable<number> {
        slice(start: number, end?: number): Buf;
        length: number;
        forEach: (fn: (a: number) => void) => void;
        reverse: () => Buf;
        [key: number]: number;
      }
      
}
declare global {
    // @ts-ignore
    //   export type { PubKeyHash, PubKey, Sig, ByteString } from 'scrypt-ts'
}
