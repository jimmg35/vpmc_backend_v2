import {
  Entity,
  Column,
  PrimaryGeneratedColumn
} from "typeorm"

@Entity({ name: 'commitee' })
export class Commitee {

  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  date: Date

  @Column()
  organization: string

  @Column()
  address: string

  @Column()
  license: string

  @Column()
  licenseYear: string

  @Column()
  licenseCode: string

  @Column("geography")
  coordinate: string

}

export interface ICommitee {
  date: Date
  organization: string
  address: string
  license: string
  licenseYear: string
  licenseCode: string
  latitude: string
  longitude: string
}
