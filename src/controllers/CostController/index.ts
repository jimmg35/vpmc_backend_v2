import { BaseController, HTTPMETHOD } from '../BaseController'
import { Request, Response } from 'express'
import { PostgreSQLContext } from '../../lib/dbcontext'
import { autoInjectable, inject } from 'tsyringe'
import StatusCodes from 'http-status-codes'
import { App } from '../../entity/authentication/App'
import { isTokenPermitted } from '../../lib/JwtAuthenticator'
import { JwtAuthenticator } from '../../lib/JwtAuthenticator'
import { PermissionFilter } from '../../lib/PermissionFilter'

const { OK, NOT_FOUND, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class CostController extends BaseController {


  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public permissionFilter: PermissionFilter
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    'quick': 'POST'
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

  public quick = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    return res.status(OK).json({ 'status': 'success' })
  }

}
