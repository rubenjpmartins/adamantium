import { Injectable } from "@nestjs/common";
import { ECCurve } from "../../vault/vault-keys";
import { VaultService } from "../../vault/vault.service";
import { HASH_ALGO } from "../hasher";

@Injectable()
export class SignerService {
    constructor(private readonly vaultService: VaultService) {}

    async sign(keyType: string, keyId: string, data: Buffer): Promise<string> {
        const keypath: string = ECCurve.vaultPathForSigning(keyType, keyId)

        if (keyType === ECCurve.secp256k1) {
            const hex: string = '0x' + data.toString('hex')
            return this.vaultService.signData(keypath, { id: keyId, data: hex })    
        }

        return this.vaultService.signData(keypath, { input: data.toString('base64'), prehashed: true })
    }
}
