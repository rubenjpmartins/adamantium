import { ECCurve } from '../../vault/vault-keys'
import { CryptoCurveService } from './crypto-curve.service'
import { Hasher, HASH_ALGO } from '../hasher'
import { ecdsaVerify } from 'secp256k1';
var BN = require('bn.js');

describe('ECC Verify', () => {

    let service: CryptoCurveService
    beforeEach(() => {
        service = new CryptoCurveService()
    })

    it('(OK) Verify ed25519 / blake2b Sig', () => {
        const msg: Buffer = Buffer.from('string')
        const pub: Buffer = Buffer.from("KBNSdf+7j9eGwrVJhfCf+v83gRUx2HTPMLkVtWOijHc=", 'base64')
        expect(pub.byteLength).toBe(32)

        const sig: Buffer = Buffer.from('qqkrhYcFxivqJaGlne8a7M9+XabfrX+xmVTYiI5TDKypPLjgT1nHivzBaXzEZdIyG6H3ePNUo7A1qsO9NurHCA==', 'base64')
        expect(sig.byteLength).toBe(64)
        
        const r: Buffer = sig.slice(0, 32)
        const s: Buffer = sig.slice(32, 64)
        
        expect(service.verify(msg, ECCurve.ed25519, HASH_ALGO.BLAKE2b, pub, r, s)).toBe(true)
    })

    it('(OK) Verify secp256k1 / keccak256 sig with compressed key', () => {
        const msg: Buffer = Buffer.from('string')

        const sig: Buffer = Buffer.from('0866a9ebb23cc4b047e398d7ede52b718a067c0d7f40595baa6b0d0c395152557a578887b7295152a2b9aeb01f96b11a28757b9f3722ddf4998353b643a4ecb9', 'hex')
        expect(sig.byteLength).toBe(64)
        
        const r: Buffer = sig.slice(0, 32)
        const s: Buffer = sig.slice(32, 64)

        // 02 -> compressed and y = 0
        // 03 -> compressed and y = 1
        // 04 -> uncompressed
        const pub: Buffer = Buffer.from('02c53c5ad7cd004a42db8a315148a0d130dc2ba5b24a618d42bab8e6f67976a9e6', 'hex')
        expect(sig.byteLength).toBe(64) //why ?

        console.log(`pub len: ${pub.byteLength}`)

        expect(service.verify(msg, ECCurve.secp256k1, HASH_ALGO.KECCAK256, pub, r, s)).toBe(true)
    })

    it('(OK) Verify secp256k1 / keccak256 sig with UNcompressed key', () => {
        const msg: Buffer = Buffer.from('string')
        const pub: Buffer = Buffer.from('04ab21dbe7c113ccc27af2d176e2f250125fbf3eecc5675fb2c2420c0cd4bbc1da58f9701ed26b258a023b45a6fca1a4aef3615c71ea2bcc5c0ce73adf5468327b', 'hex')

        // r, s, y_parity
        const sig: Buffer = Buffer.from('383f83e28d9da0de6f803fc627c75d4c68880e2f921e3efa901af0927c1fab08496ac3b9b6131f4e246416d51d926badff79dbf9c74a616c7e7736a3bfe7939b00', 'hex')
        expect(sig.byteLength).toBe(64)
        
        const r: Buffer = sig.slice(0, 32)
        const s: Buffer = sig.slice(32, 64)
        const y_parity: Buffer = sig.slice(64, 66)

        expect(service.verify(msg, ECCurve.secp256k1, HASH_ALGO.KECCAK256, pub, r, s, y_parity)).toBe(true)
    })
})
