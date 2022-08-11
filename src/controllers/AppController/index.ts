import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { App } from "../../entity/authentication/App"

const { OK, NOT_FOUND } = StatusCodes

@autoInjectable()
export default class AppController extends BaseController {


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
    const app_repository = this.dbcontext.connection.getRepository(App)
    const result = await app_repository.find({
      select: ['name', 'code']
    })
    return res.status(OK).json(result)
  }

  public new = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    const app_repository = this.dbcontext.connection.getRepository(App)
    const newApp = new App()
    newApp.name = params_set.name
    newApp.code = params_set.code
    const insertResult = await app_repository.insert(newApp)
    return res.status(OK).json({ "status": "success" })
  }

  public edit = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
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
