import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany
} from "typeorm"
import { User } from "../authentication/User"

@Entity({ name: 'buildingsheet' })
export class BuildingSheet {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @ManyToMany(() => User, user => user.landSheets)
    users: User[]

    @Column()
    landCounty: string

    @Column()
    landTown: string

    @Column()
    landSegmentName: string

    @Column()
    landSegmentCode: string

    @Column()
    buildCounty: string

    @Column()
    buildTown: string

    @Column()
    buildSegmentName: string

    @Column()
    buildSegmentCode: string

    @Column()
    buildAddressCounty: string

    @Column()
    buildAddressTown: string

    @Column()
    buildAddress: string

    @Column("double precision")
    landArea: number

    @Column("double precision")
    buildingArea: number

    // @Column()
    // landRightsOwner: string

    @Column()
    landRightsStatus: number

    // @Column()
    // landRightsHolding: string

    // @Column()
    // buildingRightsOwner: string

    @Column()
    buildingRightsStatus: number

    // @Column()
    // buildingRightsHolding: string

    @Column('text')
    otherRights: string

    @Column()
    landUse: number

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
    buildingFloor: number

    @Column()
    buildingBase: number

    @Column()
    surveyFloor: number

    @Column()
    inspectionDate: Date

    @Column()
    priceDate: Date

    @Column()
    appraisalObject: number

    @Column('text')
    appraisalDescription: string

    @Column()
    priceType: number

    @Column()
    evaluationRightsType: number

    @Column('text')
    appraisalCondition: string

    @Column()
    surveyorName: string

    @Column('text')
    surveyDescription: string

    // @Column()
    // transcriptFileBase64: string

    // @Column({
    //     nullable: true
    // })
    // transcriptFileName: string

    // @Column("text", { array: true })
    // photoFilesBase64: string[]

    // @Column("text", {
    //     array: true,
    //     nullable: true
    // })
    // photoFilesName: string[]

}