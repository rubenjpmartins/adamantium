import { BigNumber } from "@ethersproject/bignumber";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { NonceEntity } from "../entities/nonce.entity";

@Injectable()
export class NonceService {
    
    constructor(@InjectRepository(NonceEntity) private readonly nonceRepo: Repository<NonceEntity>) {

    }

    /**
     * 
     * @param address 
     */
    async getNonce(address: string): Promise<BigNumber> {
        return await this.nonceRepo
            .manager.transaction((manager: EntityManager): Promise<BigNumber> => {

                return manager.createQueryBuilder(NonceEntity, 'nonce')
                .setLock('pessimistic_write')
                .where({ address })
                .getOne()
                .then (async (nonceRecord) => {
                    console.log(`nonceRecord: ${nonceRecord}`)
                    if(undefined === nonceRecord) {
                        await this.nonceRepo.insert({
                            address,
                            nonce: BigNumber.from(0).toString()
                        })
                        return BigNumber.from(0)
                    }
    
                    const newNonce: BigNumber = BigNumber.from(nonceRecord.nonce).add(1)
                    await manager.update(NonceEntity, { address }, { nonce: newNonce.toString() })

                    console.log(`nonceRecord: ${nonceRecord}`)

                    return BigNumber.from(nonceRecord.nonce)
                })
            })

    }
}
