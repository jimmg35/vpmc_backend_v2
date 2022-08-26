import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../lib/dbcontext"
import { autoInjectable, inject } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { QueryStringStorer } from "../../lib/QueryStringStorer"
import { IGetAprInfo, IGetSimpleInfo, IListCommiteeByExtent, IListTownAvgProps } from "./ICommitee"
import { isRoleHasApp } from "../../lib/JwtAuthenticator"
import { JwtAuthenticator } from "../../lib/JwtAuthenticator"
import { Role } from "../../entity/authentication/Role"
import { App } from "../../entity/authentication/App"
import { PermissionFilter } from "../../lib/PermissionFilter"

const { OK, NOT_FOUND, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class CommiteeController extends BaseController {

  public queryStringStorer: QueryStringStorer
  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public permissionFilter: PermissionFilter
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "listTownAvg": "GET",
    "listCommiteeByExtent": "GET",
    "getSimpleInfo": "GET",
    "post": "POST",
    "getAprInfo": "GET",
    "getCommiteeInfoById": "GET"
  }

  constructor(
    @inject('dbcontext') dbcontext: PostgreSQLContext,
    @inject('queryStringStorer') queryStringStorer: QueryStringStorer,
    @inject('jwtAuthenticator') jwtAuthenticator: JwtAuthenticator,
    @inject('permissionFilter') permissionFilter: PermissionFilter
  ) {
    super()
    this.queryStringStorer = queryStringStorer
    this.jwtAuthenticator = jwtAuthenticator
    this.permissionFilter = permissionFilter
    this.dbcontext = dbcontext
  }

  /**
   * @swagger
   * /Commitee/listTownAvg:
   *   get:
   *     tags: 
   *       - Commitee
   *     summary: 查詢鄉鎮市區單位價格(元/平方公尺).
   *     description: 現在只有新北市10年份的資料
   *     parameters:
   *       - in: query
   *         name: county
   *         required: true
   *         default: 新北市
   *         schema:
   *           type: string
   *         description: 縣市
   *       - in: query
   *         name: town
   *         required: true
   *         default: 林口區
   *         schema:
   *           type: string
   *         description: 鄉鎮市區
   *       - in: query
   *         name: startDate
   *         required: true
   *         default: 2021-01-01
   *         schema:
   *           type: string
   *         description: yyyy-mm-dd
   *       - in: query
   *         name: endDate
   *         required: true
   *         default: 2022-01-01
   *         schema:
   *           type: string
   *         description: yyyy-mm-dd
   *     responses:
   *       '200':    # status code
   *         description: 該鄉鎮的單位均價
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public listTownAvg = async (req: Request, res: Response) => {
    const status = await this.permissionFilter.isRoleHasApp({
      appCode: 'function:aprMap',
      token: req.headers.authorization
    })
    if (!status) return res.status(UNAUTHORIZED).json({ "status": "user permission denied" })
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

  /**
   * @swagger
   * /Commitee/listCommiteeByExtent:
   *   get:
   *     tags: 
   *       - Commitee
   *     summary: 列出方框範圍內的基本管委會資料.
   *     description: 現在只有新北市10年份的資料
   *     parameters:
   *       - in: query
   *         name: xmin
   *         required: true
   *         default: 121.45344870570658
   *         schema:
   *           type: number
   *         description: 最小經度
   *       - in: query
   *         name: ymin
   *         required: true
   *         default: 25.004733928174055
   *         schema:
   *           type: number
   *         description: 最小緯度
   *       - in: query
   *         name: xmax
   *         required: true
   *         default: 121.4697565351926
   *         schema:
   *           type: number
   *         description: 最大經度
   *       - in: query
   *         name: ymax
   *         required: true
   *         default: 25.012356721844185
   *         schema:
   *           type: number
   *         description: 最大緯度
   *     responses:
   *       '200':    # status code
   *         description: 範圍內的所有社區資料
   *         content:
   *           application/json:
   *             schema: 
   *               type: array
   */
  public listCommiteeByExtent = async (req: Request, res: Response) => {
    const status = await this.permissionFilter.isRoleHasApp({
      appCode: 'function:aprMap',
      token: req.headers.authorization
    })
    if (!status) return res.status(UNAUTHORIZED).json({ "status": "user permission denied" })
    const props: IListCommiteeByExtent = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.listCommiteeByExtent.format(
        [props.xmin, props.ymin, props.xmax, props.ymax]
      )
    )
    return res.status(OK).json(result)
  }

  /**
   * @swagger
   * /Commitee/getSimpleInfo:
   *   get:
   *     tags: 
   *       - Commitee
   *     summary: 查詢社區半徑範圍內的實價交易數量、完工日期、建物型態、平均單位價格(元/平方公尺).
   *     description: 現在只有新北市10年份的資料
   *     parameters:
   *       - in: query
   *         name: commiteeId
   *         required: true
   *         default: 836bf30d-e426-49df-856f-ffb05eef7d5d
   *         schema:
   *           type: string
   *         description: 管委會id
   *       - in: query
   *         name: bufferRadius
   *         required: true
   *         default: 35
   *         schema:
   *           type: number
   *         description: 搜尋半徑
   *     responses:
   *       '200':    # status code
   *         description: 該社區半徑範圍內的實價交易數量、完工日期、建物型態、平均單位價格(元/平方公尺).
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public getSimpleInfo = async (req: Request, res: Response) => {
    const status = await this.permissionFilter.isRoleHasApp({
      appCode: 'function:aprMap',
      token: req.headers.authorization
    })
    if (!status) return res.status(UNAUTHORIZED).json({ "status": "user permission denied" })

    const props: IGetSimpleInfo = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.getSimpleInfo.format(
        [props.commiteeId, props.bufferRadius]
      )
    )
    return res.status(OK).json(result[0])
  }

  /**
   * @swagger
   * /Commitee/getAprInfo:
   *   get:
   *     tags: 
   *       - Commitee
   *     summary: 用管委會id查詢實價登陸交易紀錄.
   *     description: 現在只有新北市10年份的資料
   *     parameters:
   *       - in: query
   *         name: commiteeId
   *         required: true
   *         default: 52daa333-6e71-4dfd-a70d-97e7dd0cde2d
   *         schema:
   *           type: string
   *         description: 管委會id
   *     responses:
   *       '200':    # status code
   *         description: 該社區的所有實價登陸交易紀錄.
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public getAprInfo = async (req: Request, res: Response) => {
    // const status = await this.permissionFilter.isRoleHasApp({
    //   appCode: 'function:aprMap',
    //   token: req.headers.authorization
    // })
    // if (!status) return res.status(UNAUTHORIZED).json({ "status": "user permission denied" })

    const props: IGetAprInfo = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.commitee.getAprInfo.format(
        [props.commiteeId, 35]
      )
    )
    return res.status(OK).json(result)
  }

  /**
   * @swagger
   * /Commitee/getCommiteeInfoById:
   *   get:
   *     tags: 
   *       - Commitee
   *     summary: 用管委會id查詢基本資料.
   *     description: 現在只有新北市10年份的資料
   *     parameters:
   *       - in: query
   *         name: commiteeId
   *         required: true
   *         default: 52daa333-6e71-4dfd-a70d-97e7dd0cde2d
   *         schema:
   *           type: string
   *         description: 管委會id
   *     responses:
   *       '200':    # status code
   *         description: 該社區的基本資料.
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public getCommiteeInfoById = async (req: Request, res: Response) => {
    // const status = await this.permissionFilter.isRoleHasApp({
    //   appCode: 'function:aprMap',
    //   token: req.headers.authorization
    // })
    // if (!status) return res.status(UNAUTHORIZED).json({ "status": "user permission denied" })

    const props = { ...req.query } as unknown as { commiteeId: string }
    const result = await this.dbcontext.connection.query(
      `SELECT * FROM commitee WHERE id = '${props.commiteeId}'`
    )
    if (result.length !== 0) {
      return res.status(OK).json(result[0])
    } else {
      return res.status(NOT_FOUND)
    }

  }

  public post = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    return res.status(OK).json({
      ...params_set
    })
  }

}
