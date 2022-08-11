import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { Role } from "../../entity/authentication/Role"

const { OK, NOT_FOUND } = StatusCodes

@autoInjectable()
export default class RoleController extends BaseController {


  public dbcontext: PostgreSQLContext
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "list": "GET",
    "new": "POST",
    "edit": "PUT"
  }

  constructor(dbcontext: PostgreSQLContext) {
    super()
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  public list = async (req: Request, res: Response) => {
    const params_set = { ...req.query }
    const role_repository = this.dbcontext.connection.getRepository(Role)
    const result = await role_repository.find({
      select: ['name', 'code']
    })
    return res.status(OK).json(result)
  }

  public new = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const role_repository = this.dbcontext.connection.getRepository(Role)
    const newRole = new Role()
    newRole.name = params_set.name
    newRole.code = params_set.code
    const insertResult = await role_repository.insert(newRole)
    return res.status(OK).json({ "status": "success" })
  }

  public edit = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
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

}
