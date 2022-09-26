import {
    Entity,
    Column,
    PrimaryColumn
} from "typeorm"

@Entity({ name: 'apr' })
export class Apr {

    @PrimaryColumn()
    id: string

    @Column()
    transactionTime: Date

    @Column()
    completionTime: Date

    @Column()
    floor: number

    @Column()
    transferFloor: number

    @Column()
    hasElevator: number

    @Column()
    hasCommittee: number

    @Column()
    hasCompartment: number

    @Column()
    buildingTransferArea: number

    @Column()
    price: number

    @Column()
    unitPrice: number

    @Column()
    parkingSpaceTransferArea: number

    @Column()
    parkingSpacePrice: number

    @Column()
    landTransferArea: number

    @Column()
    roomNumber: number

    @Column()
    hallNumber: number

    @Column()
    bathNumber: number

    @Column()
    buildingArea: number

    @Column()
    subBuildingArea: number

    @Column()
    belconyArea: number

    @Column()
    landAmount: number

    @Column()
    buildingAmount: number

    @Column()
    parkAmount: number

    @Column()
    urbanLandUse: number

    @Column()
    nonUrbanLandUse: number

    @Column()
    nonUrbanLandUsePlanning: number

    @Column()
    buildingType: number

    @Column()
    parkingSpaceType: number

    @Column()
    priceWithoutParking: number

    @Column()
    address: string

    @Column("geography")
    coordinate: string
}

export interface IApr {
    id: string
    transactionTime: Date
    completionTime: Date
    floor: number
    transferFloor: number
    hasElevator: number
    hasCommittee: number
    hasCompartment: number
    buildingTransferArea: number
    price: number
    unitPrice: number
    parkingSpaceTransferArea: number
    parkingSpacePrice: number
    landTransferArea: number
    roomNumber: number
    hallNumber: number
    bathNumber: number
    buildingArea: number
    subBuildingArea: number
    belconyArea: number
    landAmount: number
    buildingAmount: number
    parkAmount: number
    urbanLandUse: number
    nonUrbanLandUse: number
    nonUrbanLandUsePlanning: number
    buildingType: number
    parkingSpaceType: number
    priceWithoutParking: number
    address: string
    coordinate_x: number
    coordinate_y: number
}