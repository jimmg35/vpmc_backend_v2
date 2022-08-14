import { singleton, inject, autoInjectable, container } from 'tsyringe'
import { Repository } from 'typeorm'
import { User } from '../entity/authentication/User'
import { Role } from '../entity/authentication/Role'
import { App } from '../entity/authentication/App'
import { PostgreSQLContext } from './dbcontext'
import { JwtAuthenticator } from './JwtAuthenticator'

export type AppCode = 'info:bulletin' |
  'info:generalLaw' |
  'info:twTrend' |
  'info:licenseSta' |
  'info:admin' |
  'news:marquee' |
  'function:aprMap' |
  'function:surveySheet' |
  'function:marketCompare' |
  'function:batchMarketCompare' |
  'function:landDevelop' |
  'function:test'

export type RoleCode = 'user:basic' |
  'user:ccis' |
  'admin:ccis' |
  'admin:root'

export interface IIsRoleHasApp {
  token: string | undefined
  appCode: AppCode
}

export interface IIsTokenPermitted {
  token: string | undefined
  permitRole: RoleCode[]
}

@autoInjectable()
export class PermissionFilter {

  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator

  constructor(dbcontext: PostgreSQLContext, jwtAuthenticator: JwtAuthenticator) {
    this.jwtAuthenticator = jwtAuthenticator
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  private _listRolesWithApps = async (userId: string) => {
    const user_repository = this.dbcontext.connection.getRepository(User)
    const userRoles = await user_repository
      .createQueryBuilder("user")
      .where("user.userId = :userId", { userId: userId })
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.apps", "app")
      .getOne()
    return userRoles
  }

  public isRoleHasApp = async ({
    token, appCode
  }: IIsRoleHasApp) => {
    const { status, payload } = this.jwtAuthenticator.isTokenValid(token)
    if (!status || !payload) return false
    const userRoles = await this._listRolesWithApps(payload._userId)
    if (!userRoles) return false
    for (let i = 0; i < userRoles.roles.length; i++) {
      for (let j = 0; j < userRoles.roles[i].apps.length; j++) {
        const app = userRoles.roles[i].apps[j]
        if (app.code === appCode) return true
      }
    }
    return false
  }

  public isRolePermitted = async ({
    token, permitRole
  }: IIsTokenPermitted) => {
    const { status, payload } = this.jwtAuthenticator.isTokenValid(token)
    if (!status || !payload) return false
    const userRoles = await this._listRolesWithApps(payload._userId)
    if (!userRoles) return false
    for (let i = 0; i < userRoles.roles.length; i++) {
      if (permitRole.includes(userRoles.roles[i].code as RoleCode)) return true
    }
    return false
  }

}

const permissionFilter = container.resolve(PermissionFilter)
export default permissionFilter
