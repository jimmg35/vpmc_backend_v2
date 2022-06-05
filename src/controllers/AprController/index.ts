import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import QueryStringStorer from "../../lib/QueryStringStorer"
import { IGetTownInfo } from "./IApr"
import { getAge } from "../util"

const { OK } = StatusCodes

@autoInjectable()
export default class AprController extends BaseController {

  public queryStringStorer: QueryStringStorer
  public dbcontext: PostgreSQLContext
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "getTownInfo": "GET",
    "post": "POST"
  }

  constructor(dbcontext: PostgreSQLContext, queryStringStorer: QueryStringStorer) {
    super()
    this.queryStringStorer = queryStringStorer
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }


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