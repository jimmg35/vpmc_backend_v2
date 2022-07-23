import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import QueryStringStorer from "../../lib/QueryStringStorer"
import { getAge } from "../util"
import { IMarketCompare } from "./IAnalysis"

const { OK } = StatusCodes

const buileMarketCompareQuery = (props: IMarketCompare, queryStringStorer: QueryStringStorer): string => {
  let queryString = ''
  let bufferFilter = ''

  /* 第一種空間查詢方式 */
  if (props.longitude !== undefined && props.latitude !== undefined && props.bufferRadius !== undefined) {
    bufferFilter = ` 
      ST_Buffer(
        ST_SetSRID(ST_Point(${props.longitude}, ${props.latitude})::geography, 4326), 
        ${props.bufferRadius}
      ) && ap.coordinate 
    `
  }

  /* 第二種空間查詢方式 */
  if (props.geojson !== undefined) {
    bufferFilter = ` 
      ST_GeomFromGeoJSON('${props.geojson}')::geography && ap.coordinate 
    `
  }

  /* 第三種空間查詢方式 */
  if (props.county !== undefined && props.town !== undefined) {
    let townsString = ''
    const towns: string[] = props.town.split(',')
    towns.forEach((town) => {
      townsString += `'${town}',`
    })
    townsString = townsString.substring(0, townsString.length - 1)
    queryString = queryStringStorer.analysis.marketCompareCountyTown
    bufferFilter = ` 
      ta.geom && ap.coordinate AND ta.countyname='${props.county}' AND ta.townname in (${townsString})  
    `
  } else {
    queryString = queryStringStorer.analysis.marketCompare
  }

  let assetTypeFilter = ''
  if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(Number(props.buildingType))) {
    assetTypeFilter = `
      AND ap."buildingType" = ${props.buildingType} 
      AND ap."buildingAmount" > 0 
    `
  } else if (Number(props.buildingType) === 100) {
    assetTypeFilter = `
      AND ap."landAmount" > 0 
    `
  } else if (Number(props.buildingType) === 200) {
    assetTypeFilter = `
      AND ap."parkAmount" > 0 
    `
  }
  queryString += bufferFilter + assetTypeFilter

  if (props.transactionTimeStart && props.transactionTimeEnd) {
    let transactionTimeFilter = ` 
      AND ap."transactionTime" >= '${props.transactionTimeStart}' AND ap."transactionTime" <= '${props.transactionTimeEnd}' 
    `
    queryString += transactionTimeFilter
  }

  if (props.buildingAreaStart && props.buildingAreaEnd) {
    let buildingAreaFilter = ` 
      AND ap."buildingTransferArea" >= ${props.buildingAreaStart} AND ap."buildingTransferArea" <= ${props.buildingAreaEnd} 
    `
    queryString += buildingAreaFilter
  }

  if (props.landAreaStart && props.landAreaEnd) {
    let landAreaFilter = ` 
      AND ap."landTransferArea" >= ${props.landAreaStart} AND ap."landTransferArea" <= ${props.landAreaEnd} 
    `
    queryString += landAreaFilter
  }

  if (props.parkingSpaceType) {
    queryString += `
      AND ap."parkingSpaceType" = ${props.parkingSpaceType} 
    `
  }

  if (props.urbanLandUse) {
    queryString += `
      AND ap."urbanLandUse" in (${props.urbanLandUse}) 
    `
  }
  return queryString
}

@autoInjectable()
export default class AnalysisController extends BaseController {

  public queryStringStorer: QueryStringStorer
  public dbcontext: PostgreSQLContext
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "marketCompare": "GET",
    "marketCompareStatistic": "GET"
  }

  constructor(dbcontext: PostgreSQLContext, queryStringStorer: QueryStringStorer) {
    super()
    this.queryStringStorer = queryStringStorer
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  /**
   * @swagger
   * /Analysis/marketCompare:
   *   get:
   *     tags: 
   *       - Analysis
   *     summary: 市場比較法API.
   *     description: 
   *     parameters:
   *
   *       - in: query
   *         name: longitude
   *         required: true
   *         default: 121.52955950274009
   *         schema:
   *           type: number
   *         description: 勘估點經度
   *
   *       - in: query
   *         name: latitude
   *         required: true
   *         default: 25.030509788769773
   *         schema:
   *           type: number
   *         description: 勘估點緯度
   * 
   *       - in: query
   *         name: bufferRadius
   *         required: true
   *         default: 300
   *         schema:
   *           type: number
   *         description: 勘估點buffer半徑(公尺)
   * 
   *       - in: query
   *         name: buildingType
   *         required: true
   *         default: 0
   *         schema:
   *           type: number
   *         description: 建物型態 0住宅大樓, 1辦公商業大樓, 2其他, 3公寓, 4華廈 5套房, 6透天厝, 7店面, 8廠辦, 9倉庫, 10工廠, 11農舍
   *
   *       - in: query
   *         name: transactionTimeStart
   *         required: false
   *         default: 2018/01/01
   *         schema:
   *           type: string
   *         description: 交易時間(開始)
   * 
   *       - in: query
   *         name: transactionTimeEnd
   *         required: false
   *         default: 2021/01/01
   *         schema:
   *           type: string
   *         description: 交易時間(結束)
   * 
   *       - in: query
   *         name: buildingAreaStart
   *         required: false
   *         default: 0
   *         schema:
   *           type: number
   *         description: 建物移轉面積(開始，單位是平方公尺)
   * 
   *       - in: query
   *         name: buildingAreaEnd
   *         required: false
   *         default: 264
   *         schema:
   *           type: number
   *         description: 建物移轉面積(開始，單位是平方公尺)
   * 
   *       - in: query
   *         name: landAreaStart
   *         required: false
   *         default: 0
   *         schema:
   *           type: number
   *         description: 土地移轉面積(開始，單位是平方公尺)
   * 
   *       - in: query
   *         name: landAreaEnd
   *         required: false
   *         default: 50
   *         schema:
   *           type: number
   *         description: 土地移轉面積(結束，單位是平方公尺)
   * 
   *       - in: query
   *         name: ageStart
   *         required: false
   *         default: 1
   *         schema:
   *           type: number
   *         description: 屋齡開始(完工時間~交易時間，單位是年)
   * 
   *       - in: query
   *         name: ageEnd
   *         required: false
   *         default: 10
   *         schema:
   *           type: number
   *         description: 屋齡結束(完工時間~交易時間，單位是年)
   * 
   *       - in: query
   *         name: parkingSpaceType
   *         required: false
   *         default: 2
   *         schema:
   *           type: number
   *         description: 車位類別 0無, 1塔式車位, 2坡道平面, 3升降平面, 4升降機械, 5坡道機械, 6一樓平面, 7其他
   * 
   *       - in: query
   *         name: urbanLandUse
   *         required: false
   *         default: 0
   *         schema:
   *           type: number
   *         description: 土地分區 0住宅區, 1商業區, 2其他, 4工業區, 5農業區
   * 
   *     responses:
   *       '200':    # status code
   *         description: 
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public marketCompare = async (req: Request, res: Response) => {
    interface IResult {
      transactiontime: string
      completiontime: string
      longitude: number
      latitude: number
    }
    const props = { ...req.query } as unknown as IMarketCompare
    const queryString = buileMarketCompareQuery(props, this.queryStringStorer)
    console.log(queryString)
    let results: IResult[] = await this.dbcontext.connection.query(queryString)
    let outputResults: IResult[] | undefined = undefined
    if (props.ageStart && props.ageEnd) {
      outputResults = []
      results.forEach((result) => {
        const start = new Date(result.completiontime)
        const end = new Date(result.transactiontime)
        const ageInYear = end.getFullYear() - start.getFullYear()
        if (ageInYear >= props.ageStart! && ageInYear <= props.ageEnd!) {
          outputResults?.push(result)
        }
      })
    } else {
      outputResults = results
    }
    return res.status(OK).json(outputResults)
  }

  /**
   * @swagger
   * /Analysis/marketCompareStatistic:
   *   get:
   *     tags: 
   *       - Analysis
   *     summary: 市場比較法統計圖表API.
   *     description: 
   *     parameters:
   *
   *       - in: query
   *         name: longitude
   *         required: true
   *         default: 121.52955950274009
   *         schema:
   *           type: number
   *         description: 勘估點經度
   *
   *       - in: query
   *         name: latitude
   *         required: true
   *         default: 25.030509788769773
   *         schema:
   *           type: number
   *         description: 勘估點緯度
   * 
   *       - in: query
   *         name: bufferRadius
   *         required: true
   *         default: 300
   *         schema:
   *           type: number
   *         description: 勘估點buffer半徑(公尺)
   * 
   *       - in: query
   *         name: buildingType
   *         required: true
   *         default: 0
   *         schema:
   *           type: number
   *         description: 建物型態 0住宅大樓, 1辦公商業大樓, 2其他, 3公寓, 4華廈 5套房, 6透天厝, 7店面, 8廠辦, 9倉庫, 10工廠, 11農舍
   *
   *       - in: query
   *         name: transactionTimeStart
   *         required: false
   *         default: 2018/01/01
   *         schema:
   *           type: string
   *         description: 交易時間(開始)
   * 
   *       - in: query
   *         name: transactionTimeEnd
   *         required: false
   *         default: 2021/01/01
   *         schema:
   *           type: string
   *         description: 交易時間(結束)
   * 
   *       - in: query
   *         name: buildingAreaStart
   *         required: false
   *         default: 0
   *         schema:
   *           type: number
   *         description: 建物移轉面積(開始，單位是平方公尺)
   * 
   *       - in: query
   *         name: buildingAreaEnd
   *         required: false
   *         default: 264
   *         schema:
   *           type: number
   *         description: 建物移轉面積(開始，單位是平方公尺)
   * 
   *       - in: query
   *         name: landAreaStart
   *         required: false
   *         default: 0
   *         schema:
   *           type: number
   *         description: 土地移轉面積(開始，單位是平方公尺)
   * 
   *       - in: query
   *         name: landAreaEnd
   *         required: false
   *         default: 50
   *         schema:
   *           type: number
   *         description: 土地移轉面積(結束，單位是平方公尺)
   * 
   *       - in: query
   *         name: ageStart
   *         required: false
   *         default: 1
   *         schema:
   *           type: number
   *         description: 屋齡開始(完工時間~交易時間，單位是年)
   * 
   *       - in: query
   *         name: ageEnd
   *         required: false
   *         default: 10
   *         schema:
   *           type: number
   *         description: 屋齡結束(完工時間~交易時間，單位是年)
   * 
   *       - in: query
   *         name: parkingSpaceType
   *         required: false
   *         default: 2
   *         schema:
   *           type: number
   *         description: 車位類別 0無, 1塔式車位, 2坡道平面, 3升降平面, 4升降機械, 5坡道機械, 6一樓平面, 7其他
   * 
   *     responses:
   *       '200':    # status code
   *         description: 
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public marketCompareStatistic = async (req: Request, res: Response) => {
    interface IResult {
      buildingType: number
      priceWithoutParking: number
      unitPrice: number
      completiontime: string
      transactiontime: string
      age: number
    }

    interface IResultStatistics {
      priceWithoutParking_MEAN: number
      unitPrice_MEAN: number
      age_MEAN: number
      count: number
    }
    const props = { ...req.query } as unknown as IMarketCompare
    const queryString = buileMarketCompareQuery(props, this.queryStringStorer)
    let results: IResult[] = await this.dbcontext.connection.query(queryString)
    let outputResults: IResult[] | undefined = undefined
    if (props.ageStart && props.ageEnd) {
      outputResults = []
      results.forEach((result) => {
        const start = new Date(result.completiontime)
        const end = new Date(result.transactiontime)
        const ageInYear = end.getFullYear() - start.getFullYear()
        if (ageInYear >= props.ageStart! && ageInYear <= props.ageEnd!) {
          outputResults?.push(result)
        }
      })
    } else {
      outputResults = results
    }

    // 開始計算圖表數據
    const resultGroupByBuildingType: { [key: number]: IResult[] } = {}
    outputResults.forEach((ap) => {
      if (!Object.keys(
        resultGroupByBuildingType
      ).includes(
        ap.buildingType.toString()
      )) {
        resultGroupByBuildingType[ap.buildingType] = []
      }
      ap.age = getAge(ap.completiontime!)
      // delete ap.completionTime
      resultGroupByBuildingType[ap.buildingType].push(ap)
    })
    const outputResult: { [key: string]: { [key: string]: IResult[] | IResultStatistics } } = {}
    Object.keys(resultGroupByBuildingType).forEach((buildingType) => {
      const groupByYear: { [key: string]: IResult[] } = {}
      const groupByYearStatistics: { [key: string]: IResultStatistics } = {}
      resultGroupByBuildingType[Number(buildingType)].forEach((ap) => {
        const year = new Date(ap.transactiontime).getFullYear().toString()
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
