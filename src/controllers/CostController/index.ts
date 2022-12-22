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


    // 取得營造施工費區間 - constBudgetInterval
    const constBudgetInterval = this.costConditioner.getConstructionBudgetInterval(
      params.countyCode,
      params.material,
      params.buildingPurpose,
      params.groundFloor,
      params.buildingArea,
      params.price
    )
    if (!constBudgetInterval) return res.status(BAD_REQUEST).json({ 'status': '無法取得營造施工費區間' })

    // 取得建築期間(年) - constructionTime
    const constructionPeriod = this.costConditioner.getConstructionPeriod(
      Number(params.groundFloor), Number(params.underGroundFloor)
    )

    // 取得投資利潤率 - EPR
    const EPR = this.costConditioner.getEPR(
      constructionPeriod, params.countyCode
    )




    return res.status(OK).json({ 'status': 'success' })
  }

}
