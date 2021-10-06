export enum ECCurve {
    secp256k1 = 'secp256k1',
    ed25519 = 'ed25519',
}

// Just adjust correct vault path for keys
// secp256k1 is the unique one due to the plugin used to handle secp256k1
export namespace ECCurve {
    export function vaultPathForNewKey(keyType: string, id: string): string {
        return keyType === ECCurve.secp256k1 ? 'quorum/ethereum/accounts' : `transit/keys/${id}`
    }

    export function vaultPathForSigning(keyType: string, id: string): string {
        return keyType === ECCurve.secp256k1 ? `quorum/ethereum/accounts/${id}/sign` : `transit/sign/${id}`
    }

    export function vaultPathGetPubKey(keyType: string, id: string): string {
        return keyType === ECCurve.secp256k1 ? `quorum/ethereum/accounts/${id}` : `transit/keys/${id}`
    }

    export function vaultPathGetKeys(keyType: string): string {
        return keyType === ECCurve.secp256k1 ? `quorum/ethereum/accounts` : `transit/keys`
    }
}
