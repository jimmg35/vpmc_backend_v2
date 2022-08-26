import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany
} from "typeorm"
import { User } from "../authentication/User"

@Entity({ name: 'landsheet' })
export class LandSheet {

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
    landArea: number

    @Column()
    landRightsOwner: string

    @Column()
    landRightsStatus: string

    @Column()
    landRightsHolding: string

    @Column()
    otherRights: string

    @Column()
    landUses: string

    @Column("double precision")
    BuildingCoverageRatio: number

    @Column("double precision")
    floorAreaRatio: number

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