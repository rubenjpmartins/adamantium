import { BigNumber } from "@ethersproject/bignumber";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import BN from "bn.js";
import { TransactionEntity } from "src/ethereum/entities/transaction.entity";
import { Repository } from "typeorm";
import { ECCurve } from "../../vault/vault-keys";
import { VaultService } from "../../vault/vault.service";
import { HASH_ALGO } from "../hasher";

@Injectable()
export class TransactionService {
    constructor(
        private readonly vaultService: VaultService,
        @InjectRepository(TransactionEntity) private readonly txRepo: Repository<TransactionEntity>
        
        ) {}

    /**
     * 
     * @param keyType 
     * @param keyId 
     * @param data 
     * @returns 
     */
    async sign(keyType: string, keyId: string, data: Buffer): Promise<string> {
        const keypath: string = ECCurve.vaultPathForSigning(keyType, keyId)

        if (keyType === ECCurve.secp256k1) {
            const hex: string = '0x' + data.toString('hex')
            return this.vaultService.signData(keypath, { id: keyId, data: hex })    
        }

        return this.vaultService.signData(keypath, { input: data.toString('base64'), prehashed: true })
    }

    /**
     * 
     * @param payload 
     * @param v 
     * @param r 
     * @param s 
     */
    async saveTransaction(
        address: string, 
        payload: string, 
        nonce: BN, y_parity: Buffer, r: Buffer, s: Buffer): Promise<TransactionEntity> {
        return this.txRepo.save({
            address,
            payload,
            nonce: nonce.toNumber(),
            y_parity: y_parity.toString('hex'),
            r: r.toString('hex'),
            s: s.toString('hex')
        })
    }

    async getTransactions(address: string): Promise<TransactionEntity[]>{
        return this.txRepo.find({ address })
    }
}
