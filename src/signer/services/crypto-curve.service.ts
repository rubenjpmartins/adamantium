import { Injectable } from "@nestjs/common";
import { Hasher, HASH_ALGO } from "../hasher";
import { ECCurve } from "../../vault/vault-keys";
import { sign_detached_verify as eddsaVerify } from 'tweetnacl-ts'
import { ecdsaVerify as ecdsaVerify256k1 } from "secp256k1";

@Injectable()
export class CryptoCurveService {
    constructor() {}

    /**
     * 
     * @param msg - raw buffer msg
     * @param curve - secp256k1, ed25519
     * @param hashAlgo - (Kecackk256, Blake2b, sha256) 
     * @param pub -raw pub buffer
     * @param sig - signature buffer
     * @returns true / false 
     */
    public verify(msg: Buffer, curve: ECCurve, hashAlgo: HASH_ALGO, pub: Buffer, r: Buffer, s: Buffer): boolean {
        const sig: Buffer = Buffer.concat([r, s])
        const hash: Buffer = Hasher.hash(msg, hashAlgo)

        if (curve === ECCurve.secp256k1) {
            return ecdsaVerify256k1(new Uint8Array(sig), new Uint8Array(hash), new Uint8Array(pub))
        }
        
        // eddsa
        return eddsaVerify(hash, new Uint8Array(sig), new Uint8Array(pub))
    }
}
