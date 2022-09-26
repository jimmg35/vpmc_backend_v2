import {
    Entity,
    Column,
    PrimaryGeneratedColumn
} from "typeorm"

@Entity({ name: 'aprbuild' })
export class AprBuild {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    aprId: string

    @Column()
    usage: string

    @Column()
    material: string

    @Column({ nullable: true })
    buildingLayer: string

    @Column()
    buildingTransferArea: number
}

export interface IAprBuild {
    id: string
    usage: string
    material: string
    buildingLayer: string
    buildingTransferArea: number
}