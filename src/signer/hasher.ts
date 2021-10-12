import blake from 'blakejs'
import keccak256 from 'keccak256'
import crypto from 'crypto'

export enum HASH_ALGO {
    SHA256,
    KECCAK256,
    BLAKE2b,
    RIPEMD_160
}

export class Hasher {
    static hash(msg: Buffer, algo: HASH_ALGO): Buffer {
        if (algo === HASH_ALGO.BLAKE2b) {
            return Buffer.from(blake.blake2b(msg))
        }

        if (algo == HASH_ALGO.KECCAK256) {
            return keccak256(msg)
        }

        if (algo == HASH_ALGO.RIPEMD_160) {
            const hash = crypto.createHash('ripemd160');
            return hash.update(msg.toString('hex'), 'hex').digest()
        }

        if(algo == HASH_ALGO.SHA256) {
            const hash = crypto.createHash('sha256');
            return hash.update(msg.toString('hex'), 'hex').digest()
        }
        
        return undefined
    }
}
