import blake from 'blakejs'
import keccak256 from 'keccak256'

export enum HASH_ALGO {
    SHA256,
    KECCAK256,
    BLAKE2b
}

export class Hasher {
    static hash(msg: Buffer, algo: HASH_ALGO): Buffer {
        if (algo === HASH_ALGO.BLAKE2b) {
            return Buffer.from(blake.blake2b(msg))
        }

        if (algo == HASH_ALGO.KECCAK256) {
            return keccak256(msg)
        }
        
        return undefined
    }
}
