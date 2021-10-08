import { Hasher, HASH_ALGO } from "./hasher"

describe('Eth address', () => {

    it('(OK) Generate ETH address from public key', () => {
        const pubHex: string = '048e66b3e549818ea2cb354fb70749f6c8de8fa484f7530fc447d5fe80a1c424e4f5ae648d648c980ae7095d1efad87161d83886ca4b6c498ac22a93da5099014a'
        
        // Step (0) -  What size? And why ?
        expect(Buffer.from(pubHex, 'hex').byteLength).toBe(0) // Uncompressed key, first byte as [04]

        // Step (1) - Build pub key buffer
        const pub: Buffer = Buffer.from(pubHex.slice(2), 'hex')
        expect(pub.byteLength).toBe(0) // what size

        // Step (2) - Hash public key with correct algorithm
        const pubHash: Buffer = Hasher.hash(pub, HASH_ALGO.KECCAK256)
        expect(pubHash.byteLength).toBe(0) // what size ? 

        // Step (3) - Choose correct bytes for ethereum address
        const address: string = pubHash.slice(0).toString('hex')

        // Yay or nay? 
        expect(address).toBe("00b54e93ee2eba3086a55f4249873e291d1ab06c")
    })
})
