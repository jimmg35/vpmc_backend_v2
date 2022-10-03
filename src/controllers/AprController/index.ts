import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../lib/dbcontext"
import { autoInjectable, inject } from "tsyringe"
import StatusCodes from 'http-status-codes'
import { QueryStringStorer } from "../../lib/QueryStringStorer"
import { IGetTownInfo } from "./IApr"
import { getAge } from "../../lib/util"
import { JwtAuthenticator, isRoleHasApp } from "../../lib/JwtAuthenticator"
import { Role } from "../../entity/authentication/Role"
import { App } from "../../entity/authentication/App"
import { PermissionFilter } from "../../lib/PermissionFilter"
import { AprLand } from "../../entity/apr/AprLand"
import { AprBuild } from "../../entity/apr/AprBuild"
import { AprPark } from "../../entity/apr/AprPark"

const { OK, NOT_FOUND, UNAUTHORIZED } = StatusCodes

@autoInjectable()
export default class AprController extends BaseController {

  public queryStringStorer: QueryStringStorer
  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public permissionFilter: PermissionFilter
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "getTownInfo": "GET",
    "post": "POST",
    "getCommiteeByAprId": "GET",
    "getCommiteeByAprIds": "GET",
    "getAssetDetailByAprId": "GET"
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
   * /Apr/getCommiteeByAprId:
   *   get:
   *     tags: 
   *       - Apr
   *     summary: 根據實價交易ID查詢35公尺內管委會
   *     parameters:
   *
   *       - in: query
   *         name: id
   *         required: true
   *         default: RPWOMLPJOHKFFBF68CA
   *         schema:
   *           type: string
   *         description: 實價交易ID
   *
   *     responses:
   *       '200':    # status code
   *         description: 該實價交易紀錄35公尺內的管委會名稱
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   *       '404':    # status code
   *         description: 該實價交易紀錄附近沒有管委會
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public getCommiteeByAprId = async (req: Request, res: Response) => {
    const params_set = { ...req.query } as { id: string }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.apr.getCommiteeByAprId.format(
        [params_set.id]
      )
    )

    if (result.length === 0) {
      return res.status(NOT_FOUND).json({})
    } else {
      return res.status(OK).json(result[0])
    }
  }

  public getCommiteeByAprIds = async (req: Request, res: Response) => {
    const params_set = { ...req.query } as { ids: string }
    const ids = params_set.ids.split(',')

    const output = []
    for (let i = 0; i < ids.length; i++) {
      const result = await this.dbcontext.connection.query(
        this.queryStringStorer.apr.getCommiteeByAprId.format(
          [ids[i]]
        )
      )
      if (result[0]) {
        output.push(result[0])
      } else {
        output.push({ organization: '無管委會' })
      }
    }
    return res.status(OK).json(output)
  }

  public getAssetDetailByAprId = async (req: Request, res: Response) => {
    const params_set = { ...req.query } as { id: string }
    const repoLand = this.dbcontext.connection.getRepository(AprLand)
    const repoBuild = this.dbcontext.connection.getRepository(AprBuild)
    const repoPark = this.dbcontext.connection.getRepository(AprPark)
    const lands = await repoLand.find({
      where: {
        aprId: params_set.id
      }
    })
    const builds = await repoBuild.find({
      where: {
        aprId: params_set.id
      }
    })
    const parks = await repoPark.find({
      where: {
        aprId: params_set.id
      }
    })
    const output = {
      lands: lands,
      builds: builds,
      parks: parks
    }
    return res.status(OK).json(output)
  }

  /**
   * @swagger
   * /Apr/getTownInfo:
   *   get:
   *     tags: 
   *       - Apr
   *     summary: 地區總體
   *     description: 查詢鄉鎮市區的實價登陸資料，並且計算統計結果. 注意! 有些區的資料量過大，所以在swagger上會一直轉圈。
   *     parameters:
   *
   *       - in: query
   *         name: county
   *         required: true
   *         default: 新北市
   *         schema:
   *           type: string
   *         description: 縣市
   *
   *       - in: query
   *         name: town
   *         required: true
   *         default: 金山區
   *         schema:
   *           type: string
   *         description: 鄉鎮市區
   *
   *     responses:
   *       '200':    # status code
   *         description: 該行政區的實價登陸資料，依照建物型態與交易年分計算統計結果.
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public getTownInfo = async (req: Request, res: Response) => {
    const props: IGetTownInfo = { ...req.query }

    interface IResult {
      buildingType: number
      priceWithoutParking: number
      unitPrice: number
      completionTime?: string
      transactionTime: string
      age: number
    }

    interface IResultStatistics {
      priceWithoutParking_MEAN: number
      unitPrice_MEAN: number
      age_MEAN: number
      count: number
    }

    const result: IResult[] = await this.dbcontext.connection.query(
      this.queryStringStorer.apr.getTownInfo.format(
        [props.county, props.town]
      )
    );

    const resultGroupByBuildingType: { [key: number]: IResult[] } = {}
    result.forEach((ap) => {
      if (!Object.keys(
        resultGroupByBuildingType
      ).includes(
        ap.buildingType.toString()
      )) {
        resultGroupByBuildingType[ap.buildingType] = []
      }
      ap.age = getAge(ap.completionTime!)
      delete ap.completionTime
      resultGroupByBuildingType[ap.buildingType].push(ap)
    })

    const outputResult: { [key: string]: { [key: string]: IResult[] | IResultStatistics } } = {}
    Object.keys(resultGroupByBuildingType).forEach((buildingType) => {
      const groupByYear: { [key: string]: IResult[] } = {}
      const groupByYearStatistics: { [key: string]: IResultStatistics } = {}
      resultGroupByBuildingType[Number(buildingType)].forEach((ap) => {
        const year = new Date(ap.transactionTime).getFullYear().toString()
        if (!Object.keys(
          groupByYear
        ).includes(
          year
        )) {
          groupByYear[year] = []
        }
        groupByYear[year].push(ap)
      })

      Object.keys(groupByYear).forEach((year) => {
        const resultStatistic: IResultStatistics = {
          priceWithoutParking_MEAN: 0,
          unitPrice_MEAN: 0,
          age_MEAN: 0,
          count: 0
        }
        groupByYear[year].forEach((apr) => {
          resultStatistic.priceWithoutParking_MEAN += apr.priceWithoutParking
          resultStatistic.unitPrice_MEAN += apr.unitPrice
          resultStatistic.age_MEAN += apr.age
        })
        resultStatistic.priceWithoutParking_MEAN = resultStatistic.priceWithoutParking_MEAN / groupByYear[year].length
        resultStatistic.unitPrice_MEAN = resultStatistic.unitPrice_MEAN / groupByYear[year].length
        resultStatistic.age_MEAN = resultStatistic.age_MEAN / groupByYear[year].length
        resultStatistic.count = groupByYear[year].length

        groupByYearStatistics[year] = resultStatistic
      })
      outputResult[buildingType] = groupByYearStatistics
    })


    return res.status(OK).json(outputResult)
  }

  public post = async (req: Request, res: Response) => {
    const params_set = { ...req.body }
    return res.status(OK).json({
      ...params_set
    })
  }

}
