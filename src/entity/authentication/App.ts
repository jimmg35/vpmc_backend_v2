import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany
} from "typeorm"

import { IsEmail, IsNotEmpty, Length } from "class-validator"

import { User } from "./User"
import { Role } from "./Role"

@Entity({ name: "app" })
export class App {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToMany(type => Role, role => role.apps)
    roles: Role[]
}