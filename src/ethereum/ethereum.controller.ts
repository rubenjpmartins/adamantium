import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TransactionRequest } from "./transaction.request";
import { SignerService } from "src/signer/services/signer.service";
import { Hasher, HASH_ALGO } from "src/signer/hasher";
import { ECCurve } from "../vault/vault-keys";
import { randomBytes } from "crypto";
import { Transaction } from 'ethereumjs-tx'
import Common from "ethereumjs-common";

@Controller('eth')
@ApiTags('Ethereum')
export class EthereumController {

    constructor(
        private readonly http: HttpService,
        private readonly signer: SignerService
    ) { }

    @Post('/send')
    async send(@Body() request: TransactionRequest): Promise<any> {
        let chainId: number = 336497841

        var rawTx = {
            nonce: 0,
            chainId,
            gas: 210000,
            gasPrice: '0x0', 
            gasLimit: '0x2710',
            to: '0x0000000000000000000000000000000000000000', 
            value: '0x00', 
            data: '0x' + Buffer.from(request.data).toString('hex')
        }

          const customCommon = Common.forCustomChain(
            'mainnet',
            {
                name: 'my-private-blockchain',
                networkId: 1,
                chainId,
            }, 'istanbul'
        );
        
        const tx = new Transaction(rawTx, { common: customCommon })

        const hash: Buffer = Hasher.hash(tx.serialize(), HASH_ALGO.KECCAK256)
        let signature: string = await this.signer.sign(ECCurve.secp256k1, request.keyId, hash)

        console.log(`signature: ${signature}`)
        signature = signature.slice(2)
        
        const sigBuffer: Buffer = Buffer.from(signature, 'hex')
            
        const r = sigBuffer.slice(0, 32)
        const s = sigBuffer.slice(32, 64)
        const v = sigBuffer.slice(64, 66)

        tx.r = r
        tx.s = s

        // {0,1} + CHAIN_ID * 2 + 35
        const vInt = v.readUInt8() + chainId * 2 + 35

        // write new number
        const vBuf = Buffer.allocUnsafe(4)
        vBuf.writeUInt32BE(vInt)

        tx.v = vBuf

        // hash 2
        const hash2: Buffer = Hasher.hash(tx.serialize(), HASH_ALGO.KECCAK256)
        console.log(`hash : ${hash2.toString('hex')}`)

        return this.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
    }

    /**
     * 
     * @param payload 
     * @returns 
     */
    async sendSignedTransaction(payload: string): Promise<string> {
        try {
            const response = await this.http.post('/', {
                jsonrpc: '2.0',
                method: 'eth_sendRawTransaction',
                params: [payload],
                id: randomBytes(32).toString('hex')
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).toPromise()
            console.log(`node response : ${JSON.stringify(response.data)}`)

            return response.data

        } catch (error) {
            Logger.error(error)
        }        
    }

    stripZeros = function (a: any): Buffer | number[] | string {
        let first = a[0]
        while (a.length > 0 && first.toString() === '0') {
          a = a.slice(1)
          first = a[0]
        }
        return a
      }
}
