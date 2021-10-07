import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TransactionRequest } from "./transaction.request";
import { TransactionService } from "src/signer/services/transaction.service";
import { Hasher, HASH_ALGO } from "src/signer/hasher";
import { ECCurve } from "../vault/vault-keys";
import { randomBytes } from "crypto";
import { Transaction } from '@ethereumjs/tx'
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { NonceService } from "./services/nonce.service";
import { BigNumber } from "@ethersproject/bignumber";
import {
    BN,
    bnToHex,
    bnToUnpaddedBuffer,
    ecrecover,
    rlp,
    rlphash,
    toBuffer,
    unpadBuffer,
} from 'ethereumjs-util'
import { Cron, CronExpression } from "@nestjs/schedule";

@Controller('eth')
@ApiTags('Ethereum')
export class EthereumController {

    constructor(
        private readonly http: HttpService,
        private readonly nonceService: NonceService,
        private readonly txService: TransactionService
    ) { }

    @Get('/all/:address')
    async allTransactions(@Param('address') address: string): Promise<any> {
        return this.txService.getTransactions(address)
    }

    @Post('/send')
    async send(@Body() request: TransactionRequest): Promise<any> {
        let chainId: number = 1
        const common = new Common({ chain: chainId, hardfork: Hardfork.Istanbul })

        const nonce: BigNumber = await this.nonceService.getNonce(request.keyId)
        const txParams = {
            nonce: nonce.toHexString(),
            gas: '210000',
            gasPrice: '0x0',
            gasLimit: '0x27100',
            to: '0x0000000000000000000000000000000000000000',
            value: '0x00',
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        }

        const tx = Transaction.fromTxData(txParams, { common })

        // Plugin used for secp256k1 doesn't support pre-hashed payloads. Auto hashes to keccak256
        // so we just pass the encoded payload here
        const signature: string = await this.txService.sign(ECCurve.secp256k1, request.keyId, rlp.encode([
            bnToUnpaddedBuffer(tx.nonce),
            bnToUnpaddedBuffer(tx.gasPrice),
            bnToUnpaddedBuffer(tx.gasLimit),
            tx.to !== undefined ? tx.to.buf : Buffer.from([]),
            bnToUnpaddedBuffer(tx.value),
            tx.data,
            toBuffer(new BN(chainId)),
            unpadBuffer(toBuffer(0)),
            unpadBuffer(toBuffer(0))
        ]))

        const sigBuffer: Buffer = Buffer.from(signature.slice(2), 'hex')

        const r = new BN(sigBuffer.slice(0, 32))
        const s = new BN(sigBuffer.slice(32, 64))

        const recid = new BN(sigBuffer.slice(64, 66))
        const v = new BN(recid.toNumber() + chainId * 2 + 35)

        const signedTxParams = { ...txParams, v, r, s }
        const signedTx = Transaction.fromTxData(signedTxParams, { common })

        const txPayload = '0x' + signedTx.serialize().toString('hex')

        await this.txService.saveTransaction(request.keyId, txPayload, nonce, recid.toBuffer(), r.toBuffer(), s.toBuffer())
        return this.sendSignedTransaction(txPayload)
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    handleCron() {
      Logger.debug('Called when the current second is 45');
      
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
}
