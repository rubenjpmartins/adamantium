import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TransactionRequest } from "./requests/transaction.request";
import { TransactionService } from "src/signer/services/transaction.service";
import { ECCurve } from "../vault/vault-keys";
import { randomBytes } from "crypto";
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { NonceService } from "./services/nonce.service";
import { BigNumber } from "@ethersproject/bignumber";
import {
    BN,
    bnToUnpaddedBuffer,
    rlp,
    toBuffer,
    unpadBuffer,
} from 'ethereumjs-util'
import { Cron, CronExpression } from "@nestjs/schedule";
import { RawTransactionRequest } from "./requests/raw-transaction.request";

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

    @Post('/send/rawTxPayload')
    async sendRaw(@Body() request: RawTransactionRequest): Promise<string> {
        return this.sendSignedTransaction(request.data)
    }

    @Post('/send')
    async send(@Body() request: TransactionRequest): Promise<string> {
        let chainId: number = 1
        const common = new Common({ chain: chainId, hardfork: Hardfork.Istanbul })

        const nonce: BigNumber = await this.nonceService.getNonce(request.keyId)

        const txValues = [
            bnToUnpaddedBuffer(new BN(nonce.toNumber())), // nonce
            bnToUnpaddedBuffer(new BN(0)), // gasPrice
            bnToUnpaddedBuffer(new BN(210000)), //gas
            Buffer.from('93C9a01E2b3eab33A7ca504D9B8e05bF7B5720cF', 'hex'), //to
            bnToUnpaddedBuffer(new BN(0)), // value
            Buffer.from('7f7465737432000000000000000000000000000000000000000000000000000000600057', 'hex'), // data
            toBuffer(new BN(chainId)), //chain id
            unpadBuffer(toBuffer(0)), // 0
            unpadBuffer(toBuffer(0)) // 0
        ]

        const signedTx: Buffer = await this.txSign(txValues, request.keyId, chainId, common)
        const txPayload = '0x' + signedTx.toString('hex')

        return this.sendSignedTransaction(txPayload)
    }

    // @Cron(CronExpression.EVERY_10_SECONDS)
    // handleCron() {
    //   Logger.debug('Called when the current second is 45');

    // }

    async txSign(txValues: any[], address: string, chainId: number, common: Common): Promise<Buffer> {

        // Plugin used for secp256k1 doesn't support pre-hashed payloads. Auto hashes to keccak256
        // so we just pass the encoded payload here
        const signature: string = await this.txService.sign(ECCurve.secp256k1, address, rlp.encode(txValues))

        const sigBuffer: Buffer = Buffer.from(signature.slice(2), 'hex')

        const r = new BN(sigBuffer.slice(0, 32))
        const s = new BN(sigBuffer.slice(32, 64))

        const recid = new BN(sigBuffer.slice(64, 66))
        const v = new BN(recid.toNumber() + chainId * 2 + 35)

        // replace values in tx with signature params
        txValues.splice(6, 1, v)
        txValues.splice(7, 1, r)
        txValues.splice(8, 1, s)

        const signedTx: Buffer = rlp.encode(txValues)

        const nonce: BN = new BN(txValues[0])
        await this.txService.saveTransaction(address, '0x' + signedTx.toString('hex'), nonce, recid.toBuffer(), r.toBuffer(), s.toBuffer())
        return signedTx
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
