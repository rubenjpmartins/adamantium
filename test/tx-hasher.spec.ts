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
    ecrecover
} from 'ethereumjs-util'
import { CreateKeyRequest } from '../src/signer/requests/create-key.request';
import { SignRequest } from '../src/signer/requests/sign.request'
import { ECCurve } from '../src/vault/vault-keys';

var EC = require('elliptic').ec;
const ec = new EC('secp256k1')

jest.setTimeout(20000)
describe('e2e Create transaction hashes offline', () => {
    let app: SuperTest<Test>

    beforeEach(() => {
        app = supertest('http://localhost:3000')
    })

    it('(OK) e2e send transaction', async () => {
        // key = ec.genKeyPair();
        // pub = Buffer.from(key.getPublic('hex'), 'hex')

        const msg: string = '7f7465737432000000000000000000000000000000000000000000000000000000600057'

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
            Buffer.from(msg, 'hex'), // data
            toBuffer(new BN(chainId)), //chain id
            unpadBuffer(toBuffer(0)), // 0
            unpadBuffer(toBuffer(0)) // 0
        ]

        // Step (1) - Encode
        const encodedTx: Buffer = rlp.encode(txValues)

        // Step (2) - Hash encoded tx 
        const hash: Buffer = Hasher.hash(encodedTx, HASH_ALGO.KECCAK256)

        const createRequest: CreateKeyRequest = {
            id: v4(),
            type: ECCurve.secp256k1
        }

        const response = await app.post('/v1/signer/create')
            .send(createRequest)
            .expect(201)

        const address = response.body.data.address
        console.log(`address: ${address}`)

        // remove 0x + 04
        const pub: Buffer = Buffer.from(response.body.data.public_key.slice(4), 'hex')

        const signedRequest: SignRequest = {
            data: encodedTx.toString('hex'),
            type: ECCurve.secp256k1,
            keyId: address,
            encoding: 'hex'
        }

        // Step (3) - Sign
        const sigResponse = await app.post('/v1/signer/sign')
            .send(signedRequest)
            .expect(201)

        // strip 0x
        const signature: Buffer = Buffer.from(sigResponse.text.slice(2), 'hex')

        const r: Buffer = signature.slice(0, 32)
        let s: Buffer = signature.slice(32, 64)
        let recid: number = new BN(signature.slice(64, 66)).toNumber()

        // Ethereum recovery id! 
        // necessary to calculate V
        // Needed to provide proper V so that public keys can be recovered from signatures
        let v = recid + chainId * 2 + 35
        let recoveredPub: Buffer = ecrecover(hash, v, r, s, chainId);
        expect(recoveredPub.toString('hex')).toEqual(pub.toString('hex'))

        // Step(4) - CRAFT ENCODED SIGNED TRANSACTION
        // include signature values to tx body to be encoded again
        txValues.splice(6, 1, new BN(v).toBuffer())
        txValues.splice(7, 1, r)
        txValues.splice(8, 1, s)

        // const signedTxParams = 
        const signedTx: Buffer = rlp.encode(txValues)

        // Step (5) - GET TX HASH
        const transactionHash: Buffer = Hasher.hash(signedTx, HASH_ALGO.KECCAK256)

        const sendRawRequest: RawTransactionRequest = {
            data: '0x' + signedTx.toString('hex')
        }

        // Step (6) - SEND TX AND CHECK IF HASHES MATCH
        const sendResponse = await app.post('/v1/eth/send/rawTxPayload')
            .send(sendRawRequest)
            .expect(201)
        const responseBody = JSON.parse(sendResponse.text)

        console.log(`Tx hash : ${'0x' + transactionHash.toString('hex')}`)

        // DO THEY MATCH?
        expect(responseBody.result).toBe('0x' + transactionHash.toString('hex'))
    })

})
