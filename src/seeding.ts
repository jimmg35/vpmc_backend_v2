import { autoInjectable } from "tsyringe"
import { PostgreSQLContext } from "./dbcontext"
import { Role } from "./entity/authentication/Role"
import { container } from "tsyringe"

@autoInjectable()
export class Seeder {

  public dbcontext: PostgreSQLContext

  constructor(dbcontext: PostgreSQLContext) {
    this.dbcontext = dbcontext
  }

  public seedRole = async () => {

    const role_repository = this.dbcontext.connection.getRepository(Role)
    await role_repository.query("ALTER SEQUENCE role_id_seq RESTART WITH 1;")
    await role_repository.query("TRUNCATE TABLE role CASCADE;")
    await role_repository.insert([
      { name: "user" },
      { name: "admin" }
    ])
  }

}

(async () => {
  // 輸入資料
  const seeder = container.resolve(Seeder)
  await seeder.dbcontext.connect()
  await seeder.seedRole()
  await seeder.dbcontext.connection.close()
})()
