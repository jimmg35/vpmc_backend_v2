import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne
} from "typeorm"

import { IsEmail, IsNotEmpty, Length } from "class-validator"
import { User } from "./User"

@Entity({ name: 'userthumbnail' })
export class UserThumbnail {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("text")
    thumbnailPath: string

    @ManyToOne(() => User, user => user.thumbnails)
    user: User
}