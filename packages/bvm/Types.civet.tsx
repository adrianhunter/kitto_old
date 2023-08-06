

export interface ByteArray extends Iterable<number> {
  slice(start: number, end: number): ByteArray;
  length: number;
  forEach: (fn: (a: number) => void) => void;
}

// export type Buf = Buf
// export interface Buf extends Iterable<number> {
//   slice(start: number, end: number): ByteArray;
//   length: number;
//   forEach: (fn: (a: number) => void) => void;
//   [key: number]: number
// }
export const asd = 123



export type Chunk = {
  opcode: number;
  buf?: ByteArray;
};

export type Signature = {
  r: ByteArray;
  s: ByteArray;
};

export type BlockHeader = {
  version: number;
  prevBlock: ByteArray;
  merkleRoot: ByteArray;
  timestamp: number;
  bits: number;
  nonce: number;
};

//   type tx = {
//     version: number;
//     inputs: classes.Transaction.Input[];
//     outputs: classes.Transaction.Output[];
//     locktime: number;
//   }

export type evalResult = {
  success: boolean;
  error: Error | null;
  chunks: Chunk[];
  stack: string;
  stackTrace: string;
};

export type ParentTx = {
  script: ByteArray;
  satoshis: number;
};


// function startsWith(value: any, type: Type, chars: string) {
//   const valid = "string" === typeof value && value.startsWith(chars);
//   if (!valid) {
//     return new ValidatorError("startsWith", "Does not start with " + chars);
//   }
// }

// export type PubKeyHash = Uint8Array & Validate<typeof startsWith, "a">;
