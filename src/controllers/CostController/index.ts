import { BaseController, HTTPMETHOD } from '../BaseController'
import { Request, Response } from 'express'
import { PostgreSQLContext } from '../../lib/dbcontext'
import { autoInjectable, inject } from 'tsyringe'
import StatusCodes from 'http-status-codes'
import { App } from '../../entity/authentication/App'
import { isTokenPermitted } from '../../lib/JwtAuthenticator'
import { JwtAuthenticator } from '../../lib/JwtAuthenticator'
import { PermissionFilter } from '../../lib/PermissionFilter'
import { ICostQuickParam } from './types'
import buildCostRangeJson from './tables/buildCostRange.json'
import { IBuildCostRange, IMinMax, isFactory } from '../../types'
import { CostConditioner } from '../../lib/CostConditioner'

const buildCostRange: IBuildCostRange = buildCostRangeJson

const { OK, NOT_FOUND, UNAUTHORIZED, BAD_REQUEST } = StatusCodes

@autoInjectable()
export default class CostController extends BaseController {


  public dbcontext: PostgreSQLContext
  public jwtAuthenticator: JwtAuthenticator
  public permissionFilter: PermissionFilter
  public costConditioner: CostConditioner
  public routeHttpMethod: { [methodName: string]: HTTPMETHOD; } = {
    'quick': 'POST'
  }

  constructor(
    @inject('dbcontext') dbcontext: PostgreSQLContext,
    @inject('jwtAuthenticator') jwtAuthenticator: JwtAuthenticator,
    @inject('permissionFilter') permissionFilter: PermissionFilter,
    @inject('costConditioner') costConditioner: CostConditioner

  ) {
    super()
    this.jwtAuthenticator = jwtAuthenticator
    this.permissionFilter = permissionFilter
    this.dbcontext = dbcontext
    this.costConditioner = costConditioner
  }

  public quick = async (req: Request, res: Response) => {
    const params: ICostQuickParam = { ...req.body }
    params.price = Number(params.price)
    params.buildingArea = Number(params.buildingArea)
    params.steelCharge = (params.steelCharge === 'true')
    params.extendYears = Number(params.extendYears)
    params.age = Number(params.age)

    // 取得建築期間(年) - constructionTime
    const constructionPeriod = this.costConditioner.getConstructionPeriod(
      Number(params.groundFloor), Number(params.underGroundFloor)
    )

    // 取得投資利潤率區間 - EPRInterval
    const EPRInterval = this.costConditioner.getEPRInterval(
      constructionPeriod, params.countyCode
    )

    // 取得營造物價指數調整率 - constAdjRatio
    const constAdjRatio = this.costConditioner.getConstAdjRatio(
      9999
    )

    // 取得資本利息綜合利率 - ICRRatio
    const ICRRatio = this.costConditioner.getICRRatio(
      constructionPeriod
    )


    ////////////////////////////////////////////////////


    // 取得營造施工費區間 - constBudgetInterval
    const constBudgetInterval = this.costConditioner.getConstBudgetInterval(
      params.countyCode,
      params.material,
      params.buildingPurpose,
      params.groundFloor,
      params.buildingArea,
      params.price,
      params.steelCharge
    )
    if (!constBudgetInterval) return res.status(BAD_REQUEST).json({ 'status': '無法取得營造施工費區間' })

    // 取得規劃設計費用區間 - designBudgetInterval
    const designBudgetInterval = this.costConditioner.getDesignBudgetInterval(
      constBudgetInterval, constAdjRatio
    )

    // 取得廣告銷售費用區間 - adBudgetInterval
    const adBudgetInterval = this.costConditioner.getReverseBudgetInterval(
      constBudgetInterval, designBudgetInterval,
      EPRInterval, ICRRatio, constAdjRatio, 'ad'
    )
    if (!adBudgetInterval) return res.status(BAD_REQUEST).json({ 'status': '無法取得廣告銷售費用區間' })

    // 取得管理費用區間 - manageBudgetInterval
    const manageBudgetInterval = this.costConditioner.getReverseBudgetInterval(
      constBudgetInterval, designBudgetInterval,
      EPRInterval, ICRRatio, constAdjRatio, 'manage'
    )
    if (!manageBudgetInterval) return res.status(BAD_REQUEST).json({ 'status': '無法取得管理費用區間' })

    // 取得稅捐及其他費用區間 - taxBudgetInterval
    const taxBudgetInterval = this.costConditioner.getReverseBudgetInterval(
      constBudgetInterval, designBudgetInterval,
      EPRInterval, ICRRatio, constAdjRatio, 'tax'
    )
    if (!taxBudgetInterval) return res.status(BAD_REQUEST).json({ 'status': '無法取得稅捐及其他費用區間' })

    // 取得費用合計(元) - totalBudgetInterval
    const totalBudgetInterval = this.costConditioner.getTotalBudgetInterval(
      constBudgetInterval, designBudgetInterval,
      adBudgetInterval, manageBudgetInterval,
      taxBudgetInterval, constAdjRatio
    )

    // 取得建物成本單價(元/坪) - buildingCostInterval
    const buildingCostInterval = this.costConditioner.getBuildingCostInterval(
      totalBudgetInterval, ICRRatio, EPRInterval
    )

    ////////////////////////////////////////////////////

    // 取得殘價率 - residualPriceRatio
    const residualPriceRatio = this.costConditioner.getResidualPriceRatio(
      params.material,
      params.steelCharge
    )

    // 取得經濟耐用年數 - durableYears
    const durableYears = this.costConditioner.getDurableYears(
      params.buildingPurpose,
      params.material
    )
    if (!durableYears) return res.status(BAD_REQUEST).json({ 'status': '無法取得經濟耐用年數，可能是用途與構造輸入錯誤' })

    // 取得建物殘值率 - buildingResidualRation
    const buildingResidualRation = this.costConditioner.getBuildingResidualRation(
      durableYears,
      residualPriceRatio,
      params.extendYears,
      params.age
    )

    // 取得折舊後建物單價 - depreciatedBuildingCostInterval
    const depreciatedBuildingCostInterval = this.costConditioner.getDepreciatedBuildingCostInterval(
      buildingCostInterval,
      buildingResidualRation
    )

    ////////////////////////////////////////////////////

    // 取得土地成本價格(元)區間
    const landPriceCostInterval = this.costConditioner.getLandPriceCostInterval(
      params.price,
      params.buildingArea,
      depreciatedBuildingCostInterval
    )

    // 取得土地折舊率
    const landDepreciationRatio = this.costConditioner.getLandDepreciationRatio(
      params.extendYears,
      params.age,
      durableYears
    )

    // 取得土地的資本利息綜合利率
    const landICRRatio = this.costConditioner.getLandICRRatio(
      constructionPeriod
    )

    console.log(landICRRatio)



    // this.costConditioner.logResults(
    //   constBudgetInterval,
    //   designBudgetInterval,
    //   adBudgetInterval,
    //   manageBudgetInterval,
    //   taxBudgetInterval,
    //   totalBudgetInterval,
    //   buildingCostInterval,
    //   depreciatedBuildingCostInterval
    // )



    return res.status(OK).json({ 'status': 'success' })
  }

}
