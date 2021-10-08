import { ECCurve } from '../vault/vault-keys'
import { CryptoCurveService } from './services/crypto-curve.service'
import {  HASH_ALGO } from './hasher'
import { BigNumber } from '@ethersproject/bignumber'

describe('ECC Verify', () => {

    let service: CryptoCurveService
    beforeEach(() => {
        service = new CryptoCurveService()
    })

    it('(OK) Verify secp256k1 / keccak256 sig with compressed key', () => {
        const msg: Buffer = Buffer.from('string')

        const sig: Buffer = Buffer.from('0866a9ebb23cc4b047e398d7ede52b718a067c0d7f40595baa6b0d0c395152557a578887b7295152a2b9aeb01f96b11a28757b9f3722ddf4998353b643a4ecb9', 'hex')
        expect(sig.byteLength).toBe(64)
        
        const r: Buffer = sig.slice(0, 0)
        const s: Buffer = sig.slice(0, 0)

        // 02 -> compressed and y = 0
        // 03 -> compressed and y = 1
        // 04 -> uncompressed
        const pub: Buffer = Buffer.from('02c53c5ad7cd004a42db8a315148a0d130dc2ba5b24a618d42bab8e6f67976a9e6', 'hex')
        expect(pub.byteLength).toBe(0) //why ?

        expect(service.verify(msg, ECCurve.secp256k1, HASH_ALGO.BLAKE2b, pub, r, s)).toBe(true)
    })
})
