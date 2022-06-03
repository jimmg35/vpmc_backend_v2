import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import QueryStringStorer from "../../lib/QueryStringStorer"
import { IGetAprInfo, IGetSimpleInfo, IListCommiteeByExtent, IListTownAvgProps } from "./ICommitee"

const { OK } = StatusCodes

@autoInjectable()
export default class CommiteeController extends BaseController {

  public queryStringStorer: QueryStringStorer
  public dbcontext: PostgreSQLContext
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "listTownAvg": "GET",
    "listCommiteeByExtent": "GET",
    "getSimpleInfo": "GET",
    "post": "POST",
    "getAprInfo": "GET"
  }

  constructor(dbcontext: PostgreSQLContext, queryStringStorer: QueryStringStorer) {
    super()
    this.queryStringStorer = queryStringStorer
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  public listTownAvg = async (req: Request, res: Response) => {
    const props: IListTownAvgProps = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.listTownAvg.format(
        [props.county, props.town, props.startDate, props.endDate]
      )
    )
    result[0].county = props.county
    result[0].town = props.town
    return res.status(OK).json(result[0])
  }

  public listCommiteeByExtent = async (req: Request, res: Response) => {
    const props: IListCommiteeByExtent = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.listCommiteeByExtent.format(
        [props.xmin, props.ymin, props.xmax, props.ymax]
      )
    )
    return res.status(OK).json(result)
  }

  public getSimpleInfo = async (req: Request, res: Response) => {
    const props: IGetSimpleInfo = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.getSimpleInfo.format(
        [props.commiteeId, props.bufferRadius]
      )
    )
    return res.status(OK).json(result[0])
  }

  public getAprInfo = async (req: Request, res: Response) => {
    const props: IGetAprInfo = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.getAprInfo.format(
        [props.commiteeId, 35]
      )
    )
    return res.status(OK).json(result)
  }

  public post = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    return res.status(OK).json({
      ...params_set
    })
  }

}
