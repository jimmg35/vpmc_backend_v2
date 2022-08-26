import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    ManyToOne
} from "typeorm"

import { IsEmail, IsNotEmpty } from "class-validator"
import { UserThumbnail } from "./UserThumbnail"
import { User } from "./User"
import { Role } from "./Role"
import { LandSheet } from "../SurveyDataSheet/LandSheet"
import { ParkSheet } from "../SurveyDataSheet/ParkSheet"
import { BuildingSheet } from "../SurveyDataSheet/BuildingSheet"

@Entity({ name: 'userloginlogs' })
export class UserLoginLogs {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column('text', { name: 'email' })
    email: string

    @Column('text', { name: 'entry' })
    entry: string

    @Column('boolean', { name: 'isSuccessed', default: true })
    isSuccessed: boolean

    @CreateDateColumn()
    loginTime: Date

    @ManyToOne(() => User, user => user.loginlogs)
    user: User

}