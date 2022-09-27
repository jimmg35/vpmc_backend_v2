import {
    Entity,
    Column,
    PrimaryGeneratedColumn
} from "typeorm"

@Entity({ name: 'aprland' })
export class AprLand {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    aprId: string

    @Column()
    landTransferArea: number

    @Column()
    rightDenumerate: number

    @Column()
    rightNumerate: number

    @Column()
    address: string

    @Column()
    landUse: string

    @Column()
    parcelNumber: string

    @Column()
    transferStatus: number

}

export interface IAprLand {
    id: string
    landTransferArea: number
    rightDenumerate: number
    rightNumerate: number
    address: string
    landUse: string
    parcelNumber: string
    transferStatus: number
}