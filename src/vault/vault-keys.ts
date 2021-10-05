export enum ECCurve {
    secp256k1 = 'secp256k1',
    ed25519 = 'ed25519',
}

// Just adjust correct vault path for keys
// secp256k1 is the unique one due to the plugin used to handle secp256k1
export namespace ECCurve {
    export function vaultPathForNewKey(keyType: string, name: string): string {
        return keyType === ECCurve.secp256k1 ? 'quorum/ethereum/accounts' : `transit/keys/${name}`
    }

    export function vaultPathForSigning(keyType: string, name: string): string {
        return keyType === ECCurve.secp256k1 ? `quorum/ethereum/accounts/${name}/sign` : `transit/sign/${name}`
    }

    export function vaultPathGetPubKey(keyType: string, name: string): string {
        return keyType === ECCurve.secp256k1 ? `quorum/ethereum/accounts/${name}` : `transit/keys/${name}`
    }

    export function vaultPathGetKeys(keyType: string): string {
        return keyType === ECCurve.secp256k1 ? `quorum/ethereum/accounts` : `transit/keys`
    }

}
