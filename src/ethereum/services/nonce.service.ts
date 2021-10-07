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
                .setLock('pessimistic_read')
                .where({ address })
                .getOne()
                .then (async (nonceRecord) => {
                    console.log(`nonceRecord: ${nonceRecord}`)
                    let newNonce: BigNumber = BigNumber.from(-1)
                    if(nonceRecord) {
                        newNonce = BigNumber.from(nonceRecord.nonce)
                    }
    
                    newNonce = BigNumber.from(newNonce).add(1)
                    nonceRecord = await manager.getRepository(NonceEntity).save({
                        id: nonceRecord ? nonceRecord.id : undefined,
                        address,
                        nonce: newNonce.toString()
                    })

                    console.log(`nonceRecord: ${newNonce.toString()}`)

                    return BigNumber.from(nonceRecord.nonce)
                })
            })

    }
}
