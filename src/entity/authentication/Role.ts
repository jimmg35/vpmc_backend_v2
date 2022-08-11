import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable,
    UpdateDateColumn
} from "typeorm"
import { User } from "./User"
import { App } from "./App"

@Entity({ name: "role" })
export class Role {

    @PrimaryGeneratedColumn()
    id: number;

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

    @ManyToMany(type => User, user => user.roles) //設定bi-directional關聯
    users: User[];

    @ManyToMany(type => App, app => app.roles) //設定bi-directional關聯
    @JoinTable()
    apps: App[];
}