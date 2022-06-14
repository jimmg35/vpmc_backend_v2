import { BaseController, HTTPMETHOD } from "../BaseController"
import { Request, Response } from 'express'
import { PostgreSQLContext } from "../../dbcontext"
import { autoInjectable } from "tsyringe"
import StatusCodes from 'http-status-codes'
import QueryStringStorer from "../../lib/QueryStringStorer"
import { IListTownsByCounty } from "./IUtility"

const { OK } = StatusCodes

@autoInjectable()
export default class UtilityController extends BaseController {

  public queryStringStorer: QueryStringStorer
  public dbcontext: PostgreSQLContext
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    "listCountiesByRegion": "GET",
    "listTownsByCounty": "GET",
    "getVillageGeographyByTown": "GET"
  }

  constructor(dbcontext: PostgreSQLContext, queryStringStorer: QueryStringStorer) {
    super()
    this.queryStringStorer = queryStringStorer
    this.dbcontext = dbcontext
    this.dbcontext.connect()
  }

  /**
   * @swagger
   * /Utility/listCountiesByRegion:
   *   get:
   *     tags: 
   *       - Utility
   *     summary: 列出依照地區進行縣市劃分的資料.
   *     responses:
   *       '200':    # status code
   *         description: 依照地區進行縣市劃分的資料
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public listCountiesByRegion = async (req: Request, res: Response) => {
    const north = [
      { name: '臺北市', marked: true },
      { name: '新北市', marked: true },
      { name: '桃園市', marked: true },
      { name: '新竹市', marked: false },
      { name: '新竹縣', marked: false },
      { name: '宜蘭縣', marked: false },
      { name: '基隆市', marked: false }
    ]
    const middle = [
      { name: '臺中市', marked: true },
      { name: '彰化縣', marked: false },
      { name: '雲林縣', marked: false },
      { name: '苗栗縣', marked: false },
      { name: '南投縣', marked: false }
    ]
    const south = [
      { name: '高雄市', marked: true },
      { name: '臺南市', marked: true },
      { name: '嘉義市', marked: false },
      { name: '嘉義縣', marked: false },
      { name: '屏東縣', marked: false }
    ]
    const east = [
      { name: '臺東縣', marked: false },
      { name: '花蓮縣', marked: false },
      { name: '澎湖縣', marked: false },
      { name: '金門縣', marked: false },
      { name: '連江縣', marked: false }
    ]
    const output: { [key: string]: { name: string, marked: boolean }[] } = {
      '北部': north,
      '中部': middle,
      '南部': south,
      '東部': east
    }
    // const results: { countyname: string }[] = await this.dbcontext.connection.query(
    //   this.queryStringStorer.utility.listCountiesByRegion
    // )
    // results.forEach((result) => {
    //   if (north.includes(result.countyname)) {
    //     output['北部'].push(result.countyname)
    //   }
    //   if (middle.includes(result.countyname)) {
    //     output['中部'].push(result.countyname)
    //   }
    //   if (south.includes(result.countyname)) {
    //     output['南部'].push(result.countyname)
    //   }
    //   if (east.includes(result.countyname)) {
    //     output['東部'].push(result.countyname)
    //   }
    // })
    return res.status(OK).json(output)
  }

  /**
   * @swagger
   * /Utility/listTownsByCounty:
   *   get:
   *     tags: 
   *       - Utility
   *     summary: 根據縣市列出鄉鎮市區.
   *     parameters:
   *       - in: query
   *         name: county
   *         required: true
   *         default: 新北市
   *         schema:
   *           type: string
   *         description: 縣市
   *     responses:
   *       '200':    # status code
   *         description: 該縣市的鄉鎮市區資料
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public listTownsByCounty = async (req: Request, res: Response) => {
    const props: IListTownsByCounty = { ...req.query }
    const markedList: string[] = ['林口區', '新店區', '板橋區', '淡水區']
    const output: { [key: string]: { name: string, marked: boolean }[] } = {
      '鄉鎮市區': []
    }
    const results: { townname: string }[] = await this.dbcontext.connection.query(
      this.queryStringStorer.utility.listTownsByCounty.format(
        [props.county]
      )
    )
    for (let i = 0; i < results.length; i++) {
      if (markedList.includes(results[i].townname)) {
        output['鄉鎮市區'].push({
          name: results[i].townname,
          marked: true
        })
      }
    }
    for (let i = 0; i < results.length; i++) {
      if (!markedList.includes(results[i].townname)) {
        output['鄉鎮市區'].push({
          name: results[i].townname,
          marked: false
        })
      }
    }
    return res.status(OK).json(output)
  }

  /**
   * @swagger
   * /Utility/getVillageGeographyByTown:
   *   get:
   *     tags: 
   *       - Utility
   *     summary: 給予行政區與鄉鎮市區，取得村里界的feature collection(GeoJson).
   *     parameters:
   *       - in: query
   *         name: county
   *         required: true
   *         default: 新北市
   *         schema:
   *           type: string
   *         description: 行政區
   *       - in: query
   *         name: town
   *         required: true
   *         default: 林口區
   *         schema:
   *           type: string
   *         description: 鄉鎮市區
   *     responses:
   *       '200':    # status code
   *         description: 村里界的feature collection(GeoJson).
   *         content:
   *           application/json:
   *             schema: 
   *               type: object
   */
  public getVillageGeographyByTown = async (req: Request, res: Response) => {
    const props: { county?: string, town?: string } = { ...req.query }
    const result = await this.dbcontext.connection.query(
      this.queryStringStorer.utility.getVillageGeographyByTown.format(
        [props.county, props.town]
      )
    )
    return res.status(OK).json(result[0]["json_build_object"])
  }

}
