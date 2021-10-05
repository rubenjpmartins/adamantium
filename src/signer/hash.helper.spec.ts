import { Hasher, HASH_ALGO } from "./hasher"

describe('Hash helper', () => {

    it('(OK) should get blake2b hash', () => {
        const msg: string = 'test'
        const result: Buffer = Hasher.hash(Buffer.from(msg), HASH_ALGO.BLAKE2b)

        console.log(`result = ${result.toString('hex')}`)
        expect(result).toBeDefined()
    })
})
