

export class Input {
  constructor(
    public txid: string = "xxxx",
    public vout: number = 0,
    public script: Buf = [],
    public sequence: number = 0
  ){}
}

