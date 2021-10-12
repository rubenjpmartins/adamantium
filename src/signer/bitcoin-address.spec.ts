import { Hasher, HASH_ALGO } from "./hasher"
import { base58 } from "ethers/lib/utils"

describe('BTC address', () => {

    it('(OK) Generate BTC address from public key', () => {
        /**
         * Base 58 ( Network byte + RIPEMD160 ( SHA-256 ( compressedPubKey) ) + first4BytesOfCheckSum )
         */
        const compressedPubKey: Buffer = Buffer.from('02c53c5ad7cd004a42db8a315148a0d130dc2ba5b24a618d42bab8e6f67976a9e6', 'hex')
    
        const sha256Hash: Buffer = Hasher.hash(compressedPubKey, HASH_ALGO.SHA256)
        expect(sha256Hash.byteLength).toBe(32)

        const pubKeyDoubleHash: Buffer = Hasher.hash(sha256Hash, HASH_ALGO.RIPEMD_160)
        expect(pubKeyDoubleHash.byteLength).toBe(20)

        // Mainnet (0x00), Testnet (0x6f)
        const networkByte: Buffer = Buffer.from('0x00', 'hex')

        // We need a buffer with an extra byte because of network byte
        const networkPubKey: Buffer = Buffer.alloc(pubKeyDoubleHash.byteLength + 1)

        Buffer.concat([networkByte, pubKeyDoubleHash]).copy(networkPubKey, 1 - networkByte.byteLength)
        expect(networkPubKey.byteLength).toBe(21)

        const checksum: Buffer = Hasher.hash(Hasher.hash(networkPubKey, HASH_ALGO.SHA256), HASH_ALGO.SHA256).subarray(0, 4)
        expect(checksum.byteLength).toBe(4)

        const addressWithChecksum: Buffer = Buffer.concat([networkPubKey, checksum])
        expect(addressWithChecksum.byteLength).toBe(25)

        const btcAddress = base58.encode(addressWithChecksum)
        expect(btcAddress).toEqual('1Nfx8wcKgzdwQna6dRb4uVUirpqqRbSVBN')
    })
})
