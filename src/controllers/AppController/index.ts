import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../lib/dbcontext"
import { autoInjectable, inject } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { App } from "../../entity/authentication/App"
import { isTokenPermitted } from "../../lib/JwtAuthenticator"
import { JwtAuthenticator } from "../../lib/JwtAuthenticator"
import { PermissionFilter } from "../../lib/PermissionFilter"

const { OK, NOT_FOUND, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class AppController extends BaseController {


  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public permissionFilter: PermissionFilter
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "list": "GET",
    "new": "POST",
    "edit": "PUT"
  }

  constructor(
    @inject('dbcontext') dbcontext: PostgreSQLContext,
    @inject('jwtAuthenticator') jwtAuthenticator: JwtAuthenticator,
    @inject('permissionFilter') permissionFilter: PermissionFilter
  ) {
    super()
    this.jwtAuthenticator = jwtAuthenticator
    this.permissionFilter = permissionFilter
    this.dbcontext = dbcontext
  }

  public list = async (req: Request, res: Response) => {
    // const permission = await this.permissionFilter.isRolePermitted({
    //   token: req.headers.authorization,
    //   permitRole: ['admin:ccis', 'admin:root']
    // })
    // if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const app_repository = this.dbcontext.connection.getRepository(App)
    const result = await app_repository.find({
      select: ['id', 'name', 'code', 'updatedTime']
    })
    return res.status(OK).json(result)
  }

  public new = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const permission = await this.permissionFilter.isRolePermitted({
      token: req.headers.authorization,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const app_repository = this.dbcontext.connection.getRepository(App)
    const newApp = new App()
    newApp.name = params_set.name
    newApp.code = params_set.code
    const insertResult = await app_repository.insert(newApp)
    return res.status(OK).json({ "status": "success" })
  }

  public edit = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const permission = await this.permissionFilter.isRolePermitted({
      token: req.headers.authorization,
      permitRole: ['admin:ccis', 'admin:root']
    })
    if (!permission) return res.status(UNAUTHORIZED).json({ "status": "permission denied" })

    const app_repository = this.dbcontext.connection.getRepository(App)
    const record = await app_repository.find({
      where: {
        code: params_set.code
      }
    })
    if (record.length === 0) return res.status(NOT_FOUND).json({ "status": "can't find app" })
    record[0].name = params_set.newName
    await app_repository.save(record)
    return res.status(OK).json({ "status": "success" })
  }

}
