import { ECCurve } from "../vault/vault-keys"
import { HASH_ALGO } from "./hasher"
import { CryptoCurveService } from "./services/crypto-curve.service"

describe('Ed25519 Verify', () => {
    
    let service: CryptoCurveService
    beforeEach(() => {
        service = new CryptoCurveService()
    })

    it('(OK) Verify ed25519 / blake2b Sig', () => {
        const msg: Buffer = Buffer.from('string')
        const pub: Buffer = Buffer.from("KBNSdf+7j9eGwrVJhfCf+v83gRUx2HTPMLkVtWOijHc=", 'base64')
        expect(pub.byteLength).toBe(32)

        // Signed with ed25519 / Blake2b Hash 
        const sig: Buffer = Buffer.from('qqkrhYcFxivqJaGlne8a7M9+XabfrX+xmVTYiI5TDKypPLjgT1nHivzBaXzEZdIyG6H3ePNUo7A1qsO9NurHCA==', 'base64')
        expect(sig.byteLength).toBe(64)
        
        const r: Buffer = sig.slice(0, 32)
        const s: Buffer = sig.slice(32, 64)
        
        expect(service.verify(msg, ECCurve.ed25519, HASH_ALGO.BLAKE2b, pub, r, s)).toBe(true)
    })
})
