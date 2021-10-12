import { CryptoCurveService } from './services/crypto-curve.service'
import * as ethutil from 'ethereumjs-util';
import { ECCurve } from '../vault/vault-keys'
import { Hasher, HASH_ALGO } from './hasher'
var EC = require('elliptic').ec;
import BN from 'bn.js'
import { randomBytes, randomInt } from 'crypto';

const ec = new EC('secp256k1')

interface SignedMessage {
    pub: string
    r: string,
    s: string,
    msg: string
}

// Eth Signatures with S > secp256k1.n / 2 + 1
const invalidEthSignatures: SignedMessage[] = [
    {
        msg: '6d657373616765',
        pub: '04a088367d805bc43c73032473a4c0a57cf9d0412afbd56347080d6c458ea45d2c01e6934d7448f13d072bd45ecb16f21651d66abd7fd94848a55eed541419a397',
        r: 'a836e37e6d9e7a1bc2c888a164aa4358ea1c348f27ba28e73b2491929a87c732',
        s: '964587fb386576ee1e7232dbc3bab6b0e26a7d95fe3f1a82539eb4f037834722'
    },
    {
        msg: '6d657373616765',
        pub: '04ebd696a7e51006fbe61b2dd03ef8ab63f5dcc3c4f260cbc6879926ba0169be8e08de15b028e30a82bfb05657c7e812c1e17570680ba0c2ef5f0f02378c5bea37',
        r: 'ac57279052357110230e5b335d62898fe986ad4a46a86b86bb87642cffef8532',
        s: 'b53d45a2a88155a7b8450e2c213a2fff8ebc5a90542f02808fabb38fa2c1d1bd'
    },
]

// Eth Signatures => valid. S < secp256k1.n / 2 + 1
const validEthSignatures: SignedMessage[] = [
    {
        msg: '6d657373616765',
        pub: '049ab2a0098443fdc2139e5ba7fc664c34fd766eaa5cc8085ce53057e01664bb5de78f41c454fb40d9ac90e3d3f37640599227b21da909ff9ba994bd286b976354',
        r: '9a664dc3551b6554df69d27065ec05c379da433cbcdaf2100b9279547b7e0146',
        s: '69146dcc7c0ab25fef70ddba100c3a1d41bd2bca5faafe7922b3c36312ca3344'
    },
    {
        msg: '6d657373616765',
        pub: '043163962ad498cf18899eee5bf66ac15d0d3a6579905ce1ce780cfcfc34d84688912d57ff7c77d2b7f8703b652b195bf3108596c8c10abfd2a7e8540620617dfa',
        r: '545df86758e2f3897caf8604d770e00da107fc9098d8380deac0dfe54646efcd',
        s: '3f2a701c85a84b512d103675091293232df9dead25f5c03c4038ef0407be686e'
    }
]

describe('Malleability', () => {
    let ecService: CryptoCurveService
    let allPossibleSignedPayloads: SignedMessage[]

    beforeEach(() => {
        ecService = new CryptoCurveService()
        allPossibleSignedPayloads = [...validEthSignatures, ...invalidEthSignatures]
    })

    it('(OK) secp256k1 ECDSA => Ethereum Valid Signatures', () => {
        // pick random message payload
        const signedMessage: SignedMessage = allPossibleSignedPayloads[randomInt(3)]

        // Signature params
        const r: Buffer = Buffer.from(signedMessage.r, 'hex')
        let s: Buffer = Buffer.from(signedMessage.s, 'hex')

        // public key
        const pub: Buffer = Buffer.from(signedMessage.pub, 'hex')

        // message
        const msg: Buffer = Buffer.from(signedMessage.msg, 'hex')

        // valid signature?
        expect(ecService.verify(msg, ECCurve.secp256k1, HASH_ALGO.KECCAK256, pub, r, s)).toBe(true)
    })

    it('(OK) Standard secp256k1 ECDSA to proper R, S, V', () => {
        const signedMessage: SignedMessage = allPossibleSignedPayloads[randomInt(3)]

        // ECDSA (r, s) -> Standard ECDSA 
        const r: Buffer = Buffer.from(signedMessage.r, 'hex')
        let s: Buffer = Buffer.from(signedMessage.s, 'hex')
        const pub: Buffer = Buffer.from(signedMessage.pub, 'hex')
        const msg: Buffer = Buffer.from(signedMessage.msg, 'hex')

        // orderOfCurve -> nr of possible points over a specific field (i.e, secp256k1 field)
        const orderOfCurve: BN = new BN(Buffer.from(ec.curve.n.toString(16), 'hex'))

        // Half the curve order in ethereum is valid
        // Only secp256k1.n / 2 is valid
        const halfTheOrder: BN = orderOfCurve.divn(2).addn(1)

        // Do we have a signature on the wrong side of the curve? 
        if (new BN(s).gt(halfTheOrder)) {
            // invert s!
            s = orderOfCurve.sub(new BN(s)).toBuffer()
        }

        // keccak256 hash
        const msgHash: Buffer = Hasher.hash(msg, HASH_ALGO.KECCAK256)

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
