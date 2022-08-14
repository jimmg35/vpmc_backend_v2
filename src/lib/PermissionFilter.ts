import { singleton, inject, autoInjectable, container } from 'tsyringe'
import { Repository } from 'typeorm'
import { User } from '../entity/authentication/User'
import { Role } from '../entity/authentication/Role'
import { App } from '../entity/authentication/App'
import { PostgreSQLContext } from './dbcontext'
import { JwtAuthenticator } from './JwtAuthenticator'

// export interface IisRoleHasApp {
//   token: string | undefined
//   jwtAuthenticator: JwtAuthenticator
//   appCode: string
//   role_repository: Repository<Role>
//   app_repository: Repository<App>
// }

@autoInjectable()
export class PermissionFilter {

  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator

  constructor(dbcontext: PostgreSQLContext, jwtAuthenticator: JwtAuthenticator) {
    this.jwtAuthenticator = jwtAuthenticator
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  public isRoleHasApp = () => {
    console.log(this.dbcontext.connection.isConnected)
  }

}

const permissionFilter = container.resolve(PermissionFilter)
export default permissionFilter
