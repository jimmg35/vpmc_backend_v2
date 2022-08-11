import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm"

import { IsEmail, IsNotEmpty, Length } from "class-validator"
import { UserThumbnail } from "./UserThumbnail"

import { Role } from "./Role"
import { LandSheet } from "../SurveyDataSheet/LandSheet"
import { ParkSheet } from "../SurveyDataSheet/ParkSheet"
import { BuildingSheet } from "../SurveyDataSheet/BuildingSheet"

@Entity({ name: 'user' })
export class User {

    @PrimaryGeneratedColumn("uuid")
    userId!: string

    @Column({ length: 20, unique: true })
    @IsNotEmpty({ message: 'username is required' })
    username!: string

    @Column()
    @IsNotEmpty({ message: 'password is required' })
    password!: string

    @Column({ length: 20, nullable: true })
    alias: string

    @Column({ name: 'email' })
    @IsEmail({}, { message: 'Incorrect email' })
    @IsNotEmpty({ message: 'The email is required' })
    email!: string

    @Column({ nullable: true })
    phoneNumber: string

    @CreateDateColumn()
    createdDate!: Date

    @Column({ length: 128 })
    mailConfirmationToken!: string

    @Column({ default: false })
    isActive: boolean

    @Column({ nullable: true })
    lastLoginTime?: Date




    @OneToMany(() => UserThumbnail, userthumbnail => userthumbnail.user)
    thumbnails: UserThumbnail[]

    @ManyToMany(() => LandSheet, landsheet => landsheet.users)
    @JoinTable()
    landSheets: LandSheet[]

    @ManyToMany(() => ParkSheet, parksheet => parksheet.users)
    @JoinTable()
    parkSheets: ParkSheet[]

    @ManyToMany(() => BuildingSheet, buildingsheet => buildingsheet.users)
    @JoinTable()
    buildingSheets: BuildingSheet[]

    @ManyToMany(type => Role, role => role.users)
    @JoinTable()
    roles: Role[]
}