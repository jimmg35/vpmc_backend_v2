import { error } from "console"
import { createConnection, Connection, ConnectionOptions, MssqlParameter } from "typeorm"
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import { User } from "./entity/authentication/User"
import { Role } from "./entity/authentication/Role"
import { UserThumbnail } from "./entity/authentication/UserThumbnail"
import { LandSheet } from "./entity/SurveyDataSheet/LandSheet"
import { BuildingSheet } from "./entity/SurveyDataSheet/BuildingSheet"
import { ParkSheet } from "./entity/SurveyDataSheet/ParkSheet"

export interface IDbConfig {
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
}

export interface IDbContext {
  dbConfig: IDbConfig
  connection: Connection
  connect (): void
  parseConfig (): void
}

export class DbContext implements IDbContext {
  public dbConfig: IDbConfig
  public connection: Connection
  constructor() {
    this.parseConfig()
  }
  public connect = async () => { }
  public parseConfig = () => {
    this.dbConfig = {
      type: process.env[this.constructor.name + "_TYPE"]!,
      host: process.env[this.constructor.name + "_HOST"]!,
      port: Number(process.env[this.constructor.name + "_PORT"]!),
      username: process.env[this.constructor.name + "_USERNAME"]!,
      password: process.env[this.constructor.name + "_PASSWORD"]!,
      database: process.env[this.constructor.name + "_DATABASE"]!
    }
  }
}

export class SQLServerContext extends DbContext {

  constructor() {
    super()
  }

  public connect = async () => {
    try {
      this.connection = await createConnection({
        "type": this.dbConfig.type as any,
        "host": this.dbConfig.host,
        "port": this.dbConfig.port,
        "username": this.dbConfig.username,
        "password": this.dbConfig.password,
        "database": this.dbConfig.database,
        "entities": [
          // "build/entity/authentication/Role.js",
          // "build/entity/authentication/User.js",
          // "build/entity/authentication/UserThumbnail.js"
        ],
        "migrations": [
          "build/migration/*.js"
        ],
        "logging": false,
        "synchronize": false,
        "cli": {
          "migrationsDir": "src/migration"
        }
      })
    } catch (error: unknown) {
      console.log("SQL Server database connection failed! ")
      throw error
    }

  }

}


export class PostgreSQLContext extends DbContext {

  constructor() {
    super()
  }

  public connect = async () => {
    try {
      this.connection = await createConnection({
        "type": this.dbConfig.type as PostgresConnectionOptions['type'],
        "host": this.dbConfig.host,
        "port": this.dbConfig.port,
        "username": this.dbConfig.username,
        "password": this.dbConfig.password,
        "database": this.dbConfig.database,
        "entities": [
          Role, User, UserThumbnail, LandSheet, BuildingSheet, ParkSheet
          // "./entity/authentication/Role.ts",
          // "./entity/authentication/User.ts",
          // "./entity/authentication/UserThumbnail.ts",
          // "./entity/SurveyDataSheet/LandSheet.ts",
          // "./entity/SurveyDataSheet/ParkSheet.ts",
          // "./entity/SurveyDataSheet/BuildingSheet.ts",
          // "./entity/authentication/Role.js",
          // "./entity/authentication/User.js",
          // "./entity/authentication/UserThumbnail.js",
          // "./entity/SurveyDataSheet/LandSheet.js",
          // "./entity/SurveyDataSheet/ParkSheet.js",
          // "./entity/SurveyDataSheet/BuildingSheet.js"
        ],
        "migrations": [
          "./migration/*.js"
        ],
        "logging": false,
        "synchronize": false,
        "cli": {
          "migrationsDir": "src/migration"
        }
      })

      console.log(`database ${this.dbConfig.host}:${this.dbConfig.port} connected | ${this.dbConfig.database}`)
    } catch (error: unknown) {
      console.log("PostgreSQL database connection failed! ")
      throw error
    }

  }
}

// // 輸入假資料
// (async () => {
//     const dbcontext = new WebApiContext()
//     await dbcontext.connect()
//     console.log(dbcontext.connection.isConnected)
//     // let role_repository = dbcontext.connection.getRepository(Role)
//     // await role_repository.insert({
//     //     name: "admin"
//     // })
// })();



// typeorm migration:run
// typeorm migration:generate -n [migration_name]