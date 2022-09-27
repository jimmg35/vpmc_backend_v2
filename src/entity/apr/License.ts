import {
    Entity,
    Column,
    PrimaryGeneratedColumn
} from "typeorm"

@Entity({ name: 'license' })
export class License {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    licenseType: string

    @Column()
    license: string

    @Column()
    licenseYear: string

    @Column()
    licenseCode: string

    @Column()
    baseArea?: number

    @Column()
    buildingArea?: number

    @Column()
    floorArea?: number

    @Column()
    buildingHeight?: number

    @Column()
    basementArea?: number

    @Column()
    blankArea?: number

    @Column()
    buildingStructure?: string

    @Column()
    groundLevel?: number

    @Column()
    undergroundLevel?: number

    @Column()
    buildingCount?: number

    @Column()
    householdCount?: number

    @Column({
        nullable: true
    })
    representative?: string

    @Column({
        nullable: true
    })
    designer?: string

    @Column({
        nullable: true
    })
    supervisor?: string

    @Column({
        nullable: true
    })
    builder?: string

    @Column({
        nullable: true
    })
    parkingSpace?: string

    @Column({
        nullable: true
    })
    issueDate?: Date

    @Column({
        nullable: true
    })
    startDate?: Date

    @Column({
        nullable: true
    })
    endDate?: Date
}

export class ILicense {
    licenseType: string
    license: string
    licenseYear: string
    licenseCode: string
    baseArea?: number
    buildingArea?: number
    floorArea?: number
    buildingHeight?: number
    basementArea?: number
    blankArea?: number
    buildingStructure?: string
    groundLevel?: number
    undergroundLevel?: number
    buildingCount?: number
    householdCount?: number
    representative?: string
    designer?: string
    supervisor?: string
    builder?: string
    parkingSpace?: string
    issueDate?: string
    startDate?: string
    endDate?: string
}
