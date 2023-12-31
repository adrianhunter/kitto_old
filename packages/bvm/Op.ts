const x = Error

export enum Op {
  _0 = 0,
  false = 0,

  push = 0,
  pushData1 = 76,
  pushData2 = 77,
  pushData4 = 78,
  OP_1NEGATE = 79,
  negate1 = 79,

  OP_PUSHDATA1 = 76,
  OP_PUSHDATA2 = 77,
  OP_PUSHDATA4 = 78,
  _1 = 81,

  true = 81,
  _2 = 82,
  _3 = 83,
  _4 = 84,
  _5 = 85,
  _6 = 86,
  _7 = 87,
  _8 = 88,
  _9 = 89,
  _10 = 90,
  _11 = 91,
  _12 = 92,
  _13 = 93,
  _14 = 94,
  _15 = 95,
  _16 = 96,
  _NOP = 97,
  if = 99,
  NOTIF = 100,
  else = 103,
  endif = 104,
  verify = 105,
  return = 106,
  toAltstack = 107,
  fromAltstack = 108,
  ifDup = 115,
  depth = 116,
  drop = 117,
  dup = 118,
  nip = 119,
  over = 120,
  pick = 121,
  roll = 122,
  rot = 123,
  swap = 124,
  tuck = 125,
  drop2 = 109,
  dup2 = 110,
  dup3 = 111,
  over2 = 112,
  rot2 = 113,
  swap2 = 114,
  cat = 126,
  split = 127,
  size = 130,
  invert = 131,
  and = 132,
  or = 133,
  xor = 134,
  equal = 135,
  equalVerify = 136,
  lshift = 152,
  RSHIFT = 153,
  add1 = 139,
  sub1 = 140,
  negate = 143,
  abs = 144,
  not = 145,
  notequal0 = 146,
  add = 147,
  sub = 148,
  mul = 149,
  div = 150,
  mod = 151,
  BOOLAND = 154,
  BOOLOR = 155,
  NUMEQUAL = 156,
  NUMEQUALVERIFY = 157,
  NUMNOTEQUAL = 158,
  LESSTHAN = 159,
  GREATERTHAN = 160,
  '>' = 160,
  '>=' = 162,

  LESSTHANOREQUAL = 161,
  GREATERTHANOREQUAL = 162,
  MIN = 163,
  MAX = 164,
  min = 163,
  max = 164,
  WITHIN = 165,
  within = 165,

  NUM2BIN = 128,
  BIN2NUM = 129,
  RIPEMD160 = 166,
  sha1 = 167,
  sha256 = 168,
  hash160 = 169,
  hash256 = 170,
  CODESEPARATOR = 171,
  checkSig = 172,
  CHECKSIGVERIFY = 173,
  checkSigVerify = 173,
  CHECKMULTISIG = 174,
  checkMultiSig = 174,

  CHECKMULTISIGVERIFY = 175,
  nop = 176,

  NOP1 = 176,
  NOP2 = 177,
  NOP3 = 178,
  NOP4 = 179,
  NOP5 = 180,
  NOP6 = 181,
  NOP7 = 182,
  NOP8 = 183,
  NOP9 = 184,
  NOP10 = 185,
}

// const x = crypto.subtle.verify({"hash": ""})
