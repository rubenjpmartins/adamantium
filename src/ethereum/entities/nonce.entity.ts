import { BigNumber } from "@ethersproject/bignumber";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class NonceEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id?: Number

    @Column()
    address: string

    @Column({ type: 'numeric', default: 0})
    nonce: string
}
