import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable
} from "typeorm"

import { IsEmail, IsNotEmpty, Length } from "class-validator"

import { User } from "./User"
import { App } from "./App"

@Entity({ name: "role" })
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 50,
    })
    roleName: string;

    @ManyToMany(type => User, user => user.roles) //設定bi-directional關聯
    users: User[];

    @ManyToMany(type => App, app => app.roles) //設定bi-directional關聯
    @JoinTable()
    apps: App[];
}