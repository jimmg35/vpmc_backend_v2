import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../lib/dbcontext"
import { autoInjectable, inject } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { QueryStringStorer } from "../../lib/QueryStringStorer"
import { JwtAuthenticator } from "../../lib/JwtAuthenticator"
import { PermissionFilter } from "../../lib/PermissionFilter"

const { OK } = StatusCodes

@autoInjectable()
export default class HomeController extends BaseController {


  public dbcontext: PostgreSQLContext
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "get": "GET",
    "post": "POST"
  }

  constructor(
    @inject('dbcontext') dbcontext: PostgreSQLContext,
    @inject('queryStringStorer') queryStringStorer: QueryStringStorer,
    @inject('jwtAuthenticator') jwtAuthenticator: JwtAuthenticator,
    @inject('permissionFilter') permissionFilter: PermissionFilter
  ) {
    super()
    this.dbcontext = dbcontext
  }

  public get = async (req: Request, res: Response) => {
    const params_set = { ...req.query }
    return res.status(OK).json({
      ...params_set
    })
  }

  public post = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    return res.status(OK).json({
      ...params_set
    })
  }

}
