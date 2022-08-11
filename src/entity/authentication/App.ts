import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    UpdateDateColumn,

} from "typeorm"
import { Role } from "./Role"

@Entity({ name: "app" })
export class App {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
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