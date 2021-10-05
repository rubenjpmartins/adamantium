import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class NonceEntity {
    @PrimaryGeneratedColumn({ type: 'number' })
    id?: string

    @Column()
    address: string

    @Column({ type: 'number', default: 0})
    nonce: number
}
