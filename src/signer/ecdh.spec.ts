import { randomBytes } from 'crypto'
import sodium from 'sodium-native'

describe('ECDH', () => {

    let alicePub: Uint8Array
    let alicePriv: Uint8Array

    let bobPub: Uint8Array
    let bobPriv: Uint8Array

    beforeEach(() => {
        alicePub = new Uint8Array(32);
        alicePriv = new Uint8Array(32);

        bobPub = new Uint8Array(32);
        bobPriv = new Uint8Array(32);
    })

    it("(OK) Sample ECDH - Curve25519", () => {
        //ECDH using curve25519
        const aliceRx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);
        const aliceTx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);

        const bobRx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);
        const bobTx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);

        //generate key pairs for Alice and bob
        sodium.crypto_kx_keypair(alicePub, alicePriv);
        sodium.crypto_kx_keypair(bobPub, bobPriv);

        //generate shared keys using ECDH
        sodium.crypto_kx_client_session_keys(aliceRx, aliceTx, alicePub, alicePriv, bobPub)
        sodium.crypto_kx_server_session_keys(bobRx, bobTx, bobPub, bobPriv, alicePub)

        expect(aliceRx).toEqual(bobTx)
        expect(aliceTx).toEqual(bobRx)
    })

    it('(OK) Encrypt / Decrypt with same key & nonce', () => {
        const msg: Buffer = Buffer.from('msgText')
        const cipher: Buffer = Buffer.alloc(msg.length + sodium.crypto_secretbox_MACBYTES)
        const nonce: Buffer = randomBytes(sodium.crypto_secretbox_NONCEBYTES)

        // encrypt
        const key: Uint8Array = new Uint8Array(randomBytes(sodium.crypto_secretbox_KEYBYTES))
        sodium.crypto_secretbox_easy(cipher, msg, nonce, key)
        console.log(`cipher: ${cipher.toString('hex')}`)

        // decrypt
        const decrypted: Buffer = Buffer.alloc(cipher.length - sodium.crypto_secretbox_MACBYTES)

        sodium.crypto_secretbox_open_easy(decrypted, cipher, nonce, key)

        expect(decrypted).toEqual(msg)
    })

    it(`(OK) ALice & Bob perform ECDH and send encrypted message`, () => {
        //ECDH using curve25519
        const aliceRx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);
        const aliceTx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);

        const bobRx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);
        const bobTx = new Uint8Array(sodium.crypto_kx_SESSIONKEYBYTES);

        //generate key pairs for Alice and bob
        sodium.crypto_kx_keypair(alicePub, alicePriv);
        sodium.crypto_kx_keypair(bobPub, bobPriv);

        //generate shared keys using ECDH
        sodium.crypto_kx_client_session_keys(aliceRx, aliceTx, alicePub, alicePriv, bobPub)
        sodium.crypto_kx_server_session_keys(bobRx, bobTx, bobPub, bobPriv, alicePub)

        expect(aliceRx).toEqual(bobTx)
        expect(aliceTx).toEqual(bobRx)

        // Alice writes message! 
        const aliceMsg: Buffer = Buffer.from('msgText')
        const aliceEncryptedPayload: Buffer = Buffer.alloc(aliceMsg.length + sodium.crypto_secretbox_MACBYTES)
        const aliceGeneratedNonce: Buffer = randomBytes(sodium.crypto_secretbox_NONCEBYTES)

        // Alice encrypts message with it's TX (to 'transmit' / send) symmetric key
        sodium.crypto_secretbox_easy(aliceEncryptedPayload, aliceMsg, aliceGeneratedNonce, aliceTx)
        console.log(`aliceEncryptedPayload: ${aliceEncryptedPayload.toString('hex')}`)

        // Alice sends message ....

        // Bob Receives message ....
        const bobReceivedEncryptedMsg: Buffer = aliceEncryptedPayload
        const bobReceivedNonce: Buffer = aliceGeneratedNonce

        // Where will we write the message to?
        const decrypted: Buffer = Buffer.alloc(bobReceivedEncryptedMsg.length - sodium.crypto_secretbox_MACBYTES)

        // Bob decrypts msg with it's RX ( 'receiver' ) symmetric key. 
        sodium.crypto_secretbox_open_easy(decrypted, bobReceivedEncryptedMsg, bobReceivedNonce, bobRx)

        expect(decrypted).toEqual(aliceMsg)

    })
})
