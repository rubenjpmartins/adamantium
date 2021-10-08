import { CryptoCurveService } from './services/crypto-curve.service'
import * as ethutil from 'ethereumjs-util';
import { ECCurve } from '../vault/vault-keys'
import { Hasher, HASH_ALGO } from './hasher'
var EC = require('elliptic').ec;
import BN from 'bn.js'

const ec = new EC('secp256k1')

describe('Malleability', () => {

    let ecService: CryptoCurveService
    let key

    let pub: Buffer

    let msg: Buffer
    let msgHash: Buffer
    beforeEach(() => {
        ecService = new CryptoCurveService()
        msg = Buffer.from('message')
        msgHash = Hasher.hash(msg, HASH_ALGO.KECCAK256)
    })

    it('(OK) secp256k1 ECDSA => Ethereum Valid Signatures', () => {
        key = ec.genKeyPair();
        pub = Buffer.from(key.getPublic('hex'), 'hex')

        // Signing somehwere (i.e HSM)
        const signature = key.sign(msgHash);

        // ECDSA (r, s) -> Standard ECDSA 
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
            s = curveField.sub(new BN(s)).toBuffer()
        }

        // valid signature?
        expect(ecService.verify(msg, ECCurve.secp256k1, HASH_ALGO.KECCAK256, pub, r, s)).toBe(true)
    })

    it('(OK) Standard secp256k1 ECDSA to proper R, S, V', () => {
        key = ec.genKeyPair();
        pub = Buffer.from(key.getPublic('hex'), 'hex')
        expect(pub.byteLength).toBe(65)
        
        // Signing somehwere (i.e HSM)
        const signature = key.sign(msgHash);

        // ECDSA (r, s) -> Standard ECDSA 
        const r: Buffer = Buffer.from(signature.r.toString(16), 'hex')
        let s: Buffer = Buffer.from(signature.s.toString(16), 'hex')

        // Ethereum recovery id! 
        // necessary to calculate V
        // Needed to provide proper V so that public keys can be recovered from signatures
        let recid = 0
        let chainId = 1 // mainnet? 
        let v = recid + chainId * 2 + 35
        let recoveredPub: Buffer = ethutil.ecrecover(msgHash, v, r, s, chainId);
        if (!recoveredPub.equals(pub)) {
            recid = recid ^ 1 //invert
            v = recid + chainId * 2 + 35
            recoveredPub = ethutil.ecrecover(msgHash, v, r, s, chainId);
        }

        expect(recoveredPub.equals(pub))
    })
})
