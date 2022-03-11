import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne
} from "typeorm"

import { IsEmail, IsNotEmpty, Length } from "class-validator"
import { User } from "../authentication/User"

@Entity({ name: 'buildingsheet' })
export class BuildingSheet {

    @PrimaryGeneratedColumn("uuid")
    sheetId: string

    @ManyToOne(() => User, user => user.landSheets)
    user: User

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
    landArea: number

    @Column("double precision")
    buildingArea: number

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
    landUses: string

    @Column("double precision")
    BuildingCoverageRatio: number

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

    @Column("text", { array: true })
    photoFilesBase64: string[]

}