import { ECCurve } from '../vault/vault-keys'
import { CryptoCurveService } from './services/crypto-curve.service'
import {  HASH_ALGO } from './hasher'
import { BigNumber } from '@ethersproject/bignumber'

describe('ECC Verify', () => {

    let service: CryptoCurveService
    beforeEach(() => {
        service = new CryptoCurveService()
    })

    it('(OK) Verify secp256k1 / keccak256 sig with UNcompressed key', () => {
        const msg: Buffer = Buffer.from('string')
        const pub: Buffer = Buffer.from('04ab21dbe7c113ccc27af2d176e2f250125fbf3eecc5675fb2c2420c0cd4bbc1da58f9701ed26b258a023b45a6fca1a4aef3615c71ea2bcc5c0ce73adf5468327b', 'hex')
        expect(pub.byteLength).toBe(65)

        // r, s, y_parity
        const sig: Buffer = Buffer.from('383f83e28d9da0de6f803fc627c75d4c68880e2f921e3efa901af0927c1fab08496ac3b9b6131f4e246416d51d926badff79dbf9c74a616c7e7736a3bfe7939b00', 'hex')
        expect(sig.byteLength).toBe(65)
        
        const r: Buffer = sig.slice(0, 32)
        const s: Buffer = sig.slice(32, 64)
        const y_parity: Buffer = sig.slice(64, 66)

        expect(service.verify(msg, ECCurve.secp256k1, HASH_ALGO.KECCAK256, pub, r, s, y_parity)).toBe(true)
    })
})
