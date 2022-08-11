import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    UpdateDateColumn,

} from "typeorm"

import { IsEmail, IsNotEmpty, Length } from "class-validator"

import { User } from "./User"
import { Role } from "./Role"

@Entity({ name: "app" })
export class App {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column()
    @CreateDateColumn()
    createdTime: Date;

    @Column()
    @UpdateDateColumn()
    updatedTime: Date;

    @ManyToMany(type => Role, role => role.apps)
    roles: Role[];
}