import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany
} from "typeorm"
import { User } from "../authentication/User"

@Entity({ name: 'parksheet' })
export class ParkSheet {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @ManyToMany(() => User, user => user.landSheets)
    users: User[]

    @Column()
    assetType: string

    @Column()
    landMarkCounty: string

    @Column()
    landMarkVillage: string

    @Column()
    landMarkName: string

    @Column()
    landMarkCode: string

    @Column()
    buildMarkCounty: string

    @Column()
    buildMarkVillage: string

    @Column()
    buildMarkName: string

    @Column()
    buildMarkCode: string

    @Column()
    buildAddressCounty: string

    @Column()
    buildAddressVillage: string

    @Column()
    buildAddress: string

    @Column("double precision")
    ParkArea: number

    @Column()
    parkType: string

    @Column()
    parkMethod: string

    @Column()
    landRightsOwner: string

    @Column()
    landRightsStatus: string

    @Column()
    landRightsHolding: string

    @Column()
    buildingRightsOwner: string

    @Column()
    buildingRightsStatus: string

    @Column()
    buildingRightsHolding: string

    @Column()
    otherRights: string

    @Column()
    assignMethod: string

    @Column()
    landUses: string

    @Column("double precision")
    buildingCoverageRatio: number

    @Column("double precision")
    floorAreaRatio: number

    @Column()
    buildingUsage: string

    @Column()
    buildingStructure: string

    @Column()
    buildingFinishDate: Date

    @Column()
    buildingUpFloor: number

    @Column()
    buildingDownFloor: number

    @Column()
    surveyFloor: number

    @Column("double precision")
    parkWidth: number

    @Column("double precision")
    parkHeight: number

    @Column()
    allowSuv: boolean

    @Column()
    inspectionDate: Date

    @Column()
    valueOpinionDate: Date

    @Column()
    appraisalObject: string

    @Column()
    appraisalDescription: string

    @Column()
    priceType: string

    @Column()
    evaluationRightsType: string

    @Column()
    appraisalCondition: string

    @Column()
    surveyorName: string

    @Column()
    surveyDescription: string

    @Column()
    transcriptFileBase64: string

    @Column({
        nullable: true
    })
    transcriptFileName: string

    @Column("text", { array: true })
    photoFilesBase64: string[]

    @Column("text", {
        array: true,
        nullable: true
    })
    photoFilesName: string[]
}