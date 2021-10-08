import { randomBytes, randomUUID } from 'crypto';
import supertest, { SuperTest, Test } from 'supertest';
import { RawTransactionRequest } from '../src/ethereum/requests/raw-transaction.request'
import { v4 } from 'uuid'
import { Hasher, HASH_ALGO } from '../src/signer/hasher'
import {
    BN,
    bnToUnpaddedBuffer,
    rlp,
    toBuffer,
    unpadBuffer,
} from 'ethereumjs-util'
import { CreateKeyRequest } from '../src/signer/requests/create-key.request';
import { SignRequest } from '../src/signer/requests/sign.request'
import { ECCurve } from '../src/vault/vault-keys';

jest.setTimeout(20000)
describe('e2e Create transaction hashes offline', () => {
    let app: SuperTest<Test>

    let msg: Buffer
    let msgHash: Buffer
    beforeEach(() => {
        app = supertest('http://localhost:3000')
        msg = Buffer.from('message')
        msgHash = Hasher.hash(msg, HASH_ALGO.KECCAK256)
    })

    it('(OK) e2e send transaction', async () => {
        const createRequest: CreateKeyRequest = {
            name: v4(),
            type: ECCurve.secp256k1
        }

        const response = await app.post('/v1/signer/create')
        .send(createRequest)
        .expect(201)

        const address = response.body.data.address
        console.log(`address : ${address}`)

        // mainnet?
        const chainId: number = 1

        // Step(0) - Transaction params
        // EIP - 155 
        const txValues = [
            bnToUnpaddedBuffer(new BN(0)), // nonce
            bnToUnpaddedBuffer(new BN(0)), // gasPrice
            bnToUnpaddedBuffer(new BN(2100000)), //gas
            Buffer.from('93C9a01E2b3eab33A7ca504D9B8e05bF7B5720cF', 'hex'), //to
            bnToUnpaddedBuffer(new BN(0)), // value
            Buffer.from('7f7465737432000000000000000000000000000000000000000000000000000000600057', 'hex'), // data
            toBuffer(new BN(chainId)), //chain id
            unpadBuffer(toBuffer(0)), // 0
            unpadBuffer(toBuffer(0)) // 0
        ]

        // Step (1) - Encode
        const encodedTx: Buffer = rlp.encode(txValues)

        // Step (2) - Hash encoded tx 
        const hash: Buffer = Hasher.hash(encodedTx, HASH_ALGO.KECCAK256)
        
        // Step (3) - Sign
        const signRequest: SignRequest = {
            data: encodedTx.toString('hex'),
            name: address,
            type: ECCurve.secp256k1
        }
        const signedResponse = await app.post('/v1/signer/sign')
        .send(signRequest)
        .expect(201)

        // remove 0x
        const signature: Buffer = Buffer.from(signedResponse.text.slice(2), 'hex')

        // calculate { r, s, v}
        const r: Buffer = signature.slice(0, 32)
        const s: Buffer = signature.slice(32, 64)
        const y_parity: Buffer = signature.slice(64, 66)

        const v: Buffer = new BN(new BN(y_parity).toNumber() + chainId * 2 + 35).toBuffer()
 
        // Step(6) - CRAFT ENCODED SIGNED TRANSACTION
        // include signature values to tx body to be encoded again
        txValues.splice(6, 1, v)
        txValues.splice(7, 1, r)
        txValues.splice(8, 1, s)

        // const signedTxParams = 
        const signedTx: Buffer = rlp.encode(txValues)

        // Step (7) - GET TX HASH
        const transactionHash: Buffer = Hasher.hash(signedTx, HASH_ALGO.KECCAK256)

        const sendRawRequest: RawTransactionRequest = {
            data: '0x' + signedTx.toString('hex')
        }

        // Step (8) - SEND TX AND CHECK IF HASHES MATCH
        const sendResponse = await app.post('/v1/eth/send/rawTxPayload')
        .send(sendRawRequest)
        .expect(201)
        const responseBody = JSON.parse(sendResponse.text)

        // DO THEY MATCH?
        expect(responseBody.result).toBe('0x' + transactionHash.toString('hex'))
    })

})
