import { BigNumber } from "@ethersproject/bignumber";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TransactionEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id?: Number

    @Column()
    address: string

    @Column({ type: 'numeric', default: 0})
    nonce: number

    @Column()
    payload: string

    @Column()
    y_parity: string

    @Column()
    r: string

    @Column()
    s: string
}
