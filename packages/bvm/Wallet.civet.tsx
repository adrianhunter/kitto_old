import {PrivKey} from "./PrivKey.civet";
import {Tx} from "./Tx.civet"


class Wallet {
    constructor(
        private privKey: PrivKey,
        public txs: Tx[] 
    ){}
    getPrivateKey() {
        return this.privKey
    }
    async getBalance() {
        return 123
    }
    async getAddress() {
        return "asd"
    }
    async broadcast(tx: Tx) {
        return "asd"
    }
    async sendMoney() {
        return "asd"
    }
}





export {Wallet}
