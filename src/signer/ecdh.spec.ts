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
})
