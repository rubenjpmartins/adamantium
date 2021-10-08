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

var EC = require('elliptic').ec;
const ec = new EC('secp256k1')

jest.setTimeout(20000)
describe('e2e Create transaction hashes offline', () => {
    let app: SuperTest<Test>
    let key

    let pub: Buffer
    let msg: Buffer
    let msgHash: Buffer
    beforeEach(() => {
        app = supertest('http://localhost:3000')
        msg = Buffer.from('message')
        msgHash = Hasher.hash(msg, HASH_ALGO.KECCAK256)
    })

    it('(OK) e2e send transaction', async () => {
        key = ec.genKeyPair();
        pub = Buffer.from(key.getPublic('hex'), 'hex')

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
        // ================================================================================
        // ================ ETHEREUM SIGNATURE TREATMENT ==================================
        // ================================================================================
        // ECDSA (r, s) -> Standard ECDSA 
        const signature = key.sign(hash);
        
        const r: Buffer = Buffer.from(signature.r.toString(16), 'hex')
        let s: Buffer = Buffer.from(signature.s.toString(16), 'hex')

        // finite field
        const curveField: BN = new BN(Buffer.from(ec.curve.n.toString(16), 'hex'))

        // Half the curve as in ethereum secp256k1.n / 2 is the only valid half
        const halfCurve: BN = curveField.divn(2)

        // Do we have a signature on the wrong side of the curve? 
        if (new BN(s).gt(halfCurve)) {
            console.log(`inverting S!`)

            // invert s! 
            s = (new BN(s).sub(curveField)).toBuffer()
        }

        // Ethereum recovery id! 
        // necessary to calculate V
        // Needed to provide proper V so that public keys can be recovered from signatures
        let recid = 0
        let v = recid + chainId * 2 + 35
        let recoveredPub: Buffer = ecrecover(msgHash, v, r, s, chainId);
        if (!recoveredPub.equals(pub)) {
            recid = recid ^ 1 //invert
            v = recid + chainId * 2 + 35
            recoveredPub = ecrecover(msgHash, v, r, s, chainId);
        }

        // ================================================================================
        // ================ END ETHEREUM SIGNATURE TREATMENT ==============================
        // ================================================================================
   
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

        // DO THEY MATCH?
        expect(responseBody.result).toBe('0x' + transactionHash.toString('hex'))
    })

})
