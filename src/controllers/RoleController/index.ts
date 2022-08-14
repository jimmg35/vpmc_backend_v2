import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../lib/dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { Role } from "../../entity/authentication/Role"
import { App } from "../../entity/authentication/App"
import { JwtAuthenticator } from "../../lib/JwtAuthenticator"
import { isTokenPermitted } from "../../lib/JwtAuthenticator"

const { OK, NOT_FOUND, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class RoleController extends BaseController {


  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "list": "GET",
    "new": "POST",
    "edit": "PUT",
    "assignApp": "PUT",
    "listAppByRole": "GET"
  }

  constructor(dbcontext: PostgreSQLContext, jwtAuthenticator: JwtAuthenticator) {
    super()
    this.dbcontext = dbcontext
    this.dbcontext.connect()
    this.jwtAuthenticator = jwtAuthenticator
  }

  public list = async (req: Request, res: Response) => {
    const params_set = { ...req.query }
    const permission = isTokenPermitted({
      token: req.headers.authorization,
      jwtAuthenticator: this.jwtAuthenticator,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const role_repository = this.dbcontext.connection.getRepository(Role)
    const result = await role_repository.find({
      select: ['name', 'code']
    })
    return res.status(OK).json(result)
  }

  public new = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const permission = isTokenPermitted({
      token: req.headers.authorization,
      jwtAuthenticator: this.jwtAuthenticator,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const role_repository = this.dbcontext.connection.getRepository(Role)
    const newRole = new Role()
    newRole.name = params_set.name
    newRole.code = params_set.code
    const insertResult = await role_repository.insert(newRole)
    return res.status(OK).json({ "status": "success" })
  }

  public edit = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const permission = isTokenPermitted({
      token: req.headers.authorization,
      jwtAuthenticator: this.jwtAuthenticator,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const role_repository = this.dbcontext.connection.getRepository(Role)
    const record = await role_repository.find({
      where: {
        code: params_set.code
      }
    })
    if (record.length === 0) return res.status(NOT_FOUND).json({ "status": "can't find role" })
    record[0].name = params_set.newName
    await role_repository.save(record)
    return res.status(OK).json({ "status": "success" })
  }

  public assignApp = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const permission = isTokenPermitted({
      token: req.headers.authorization,
      jwtAuthenticator: this.jwtAuthenticator,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const role_repository = this.dbcontext.connection.getRepository(Role)
    const app_repository = this.dbcontext.connection.getRepository(App)
    const role = await role_repository.find({
      where: {
        code: params_set.code
      }
    })
    if (role.length === 0) return res.status(NOT_FOUND).json({ "status": "can't find this role" })
    const codeArray: string[] = params_set.appCodeArray.split(',')
    const codeWrappedInQuotes = codeArray.map((code: string) => `'${code}'`)
    const withCommasInBetween = codeWrappedInQuotes.join(',')
    role[0].apps = await app_repository
      .createQueryBuilder()
      .where(`code in (${withCommasInBetween})`)
      .getMany()
    await role_repository.save(role)
    return res.status(OK).json({ "status": "success" })
  }

  public listAppByRole = async (req: Request, res: Response) => {
    const params_set = { ...req.query }
    const permission = isTokenPermitted({
      token: req.headers.authorization,
      jwtAuthenticator: this.jwtAuthenticator,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const role_repository = this.dbcontext.connection.getRepository(Role)
    const roleApps = await role_repository.createQueryBuilder("role")
      .where("role.code = :roleCode", { roleCode: params_set.roleCode })
      .leftJoinAndSelect("role.apps", "app").getOne()
    if (!roleApps) return res.status(NOT_FOUND).json({ "status": "can't find this role" })
    return res.status(OK).json(roleApps)
  }

}
