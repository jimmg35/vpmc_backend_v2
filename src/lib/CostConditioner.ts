import { container } from "tsyringe"
import {
  square, UnitPriceLevel, isFactory,
  IMinMax, IBuildCostRange, Material,
  BuildingPurpose, IEPRRange, IInterval,
  BudgetType
} from "../types"
import buildCostRangeJson from '../controllers/CostController/tables/buildCostRange.json'
import eprRangeJson from '../controllers/CostController/tables/eprRange.json'
import bankLoanTable from '../controllers/CostController/tables/bankLoanTable.json'

const round4Decimal = (value: number) => {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}


export class CostConditioner {

  // **** 常數 ****
  //
  // 常數 - 一坪換算平方公尺
  private readonly _square: number = 3.305785
  // 設計費用占實際營造施工費用之比例
  private readonly _designRatioInterval: IInterval = {
    min: 0.02, max: 0.03
  }
  // 廣告銷售費用占總成本之比例
  private readonly _adRatioInterval: IInterval = {
    min: 0.03, max: 0.07
  }
  // 管理費用占總成本之比例
  private readonly _manageRatioInterval: IInterval = {
    min: 0.005, max: 0.05
  }
  // 稅捐費用占總成本之比例
  private readonly _taxRatioInterval: IInterval = {
    min: 0.005, max: 0.012
  }
  // 建築期間 - 常數 - 地上樓層數建築時間
  private readonly _groundFloorConstTime: number = 1
  // 建築期間 - 常數 - 地下樓層數建築時間
  private readonly _underGroundFloorConstTime: number = 2
  // 建築期間 - 常數 - 建築期間常數
  private readonly _consConstant: number = 6
  // 建築期間 - 常數 - 建築年(月)
  private readonly _constMonth: number = 12
  // 建築期間 - 常數 - 年限門檻
  private readonly _constPeriodThreshold: number = 1
  // 資本利息綜合利率 - 常數 - 常數1
  private readonly _ICRConstant1: number = 0.5
  // 資本利息綜合利率 - 常數 - 常數2
  private readonly _ICRConstant2: number = 2
  // 資本利息綜合利率 - 常數 - 自有資金比例
  private readonly _ICROwnRatio: number = 0.4
  // 資本利息綜合利率 - 常數 - 融資借貸比例
  private readonly _ICRLoanRation: number = 0.6
  // 廣告銷售費用區間 - 常數 - 常數1
  private readonly _AdConstant1: number = 1
  // 廣告銷售費用區間 - 常數 - 常數2
  private readonly _AdConstant2: number = 1
  // 廣告銷售費用區間 - 常數 - 常數3
  private readonly _AdConstant3: number = 1
  // 廣告銷售費用區間 - 常數 - 常數4
  private readonly _AdConstant4: number = 1
  // 廣告銷售費用區間 - 常數 - 常數5
  private readonly _AdConstant5: number = 1
  // 建物成本單價區間 - 常數 - 常數1
  private readonly _BuildingCostConstant1: number = 1
  // 建物成本單價區間 - 常數 - 常數2
  private readonly _BuildingCostConstant2: number = 1
  // 營造施工費區間 - 常數 - 鋼骨加價1
  private readonly _ConstBudgetSteelCharge1: number = 0
  // 營造施工費區間 - 常數 - 鋼骨加價2
  private readonly _ConstBudgetSteelCharge2: number = 20000


  public logResults = (
    constBudgetInterval: IInterval,
    designBudgetInterval: IInterval,
    adBudgetInterval: IInterval,
    manageBudgetInterval: IInterval,
    taxBudgetInterval: IInterval,
    totalBudgetInterval: IInterval,
    buildingCostInterval: IInterval,
    depreciatedBuildingCostInterval: IInterval,
    landCostInterval: IInterval,
    pureLandPriceInterval: IInterval
  ) => {
    console.log(`營造施工費區間      : 最小:${(constBudgetInterval.min)}    |  最大:${(constBudgetInterval.max)}`)
    console.log(`規劃設計費區間      : 最小:${(designBudgetInterval.min)}  |  最大:${(designBudgetInterval.max)}`)
    console.log(`廣告銷售費區間      : 最小:${(adBudgetInterval.min)}  |  最大:${(adBudgetInterval.max)}`)
    console.log(`管理費區間          : 最小:${(manageBudgetInterval.min)}   |  最大:${(manageBudgetInterval.max)}`)
    console.log(`稅捐及其他費區間    : 最小:${(taxBudgetInterval.min)}   |  最大:${(taxBudgetInterval.max)}`)
    console.log(`費用合計區間        : 最小:${(totalBudgetInterval.min)} |  最大:${(totalBudgetInterval.max)}`)
    console.log(`建物成本單價區間    : 最小:${(buildingCostInterval.min)}  |  最大:${(buildingCostInterval.max)}`)
    console.log(`折舊後建物單價區間  : 最小:${depreciatedBuildingCostInterval.min} |  最大:${depreciatedBuildingCostInterval.max}`)
    console.log(`土地成本價格區間    : 最小:${(landCostInterval.min)} |  最大:${(landCostInterval.max)}`)
    console.log(`土地素地價格區間    : 最小:${(pureLandPriceInterval.min)} |  最大:${(pureLandPriceInterval.max)}`)
  }

  // 計算單價等級 - 用於計算營造施工費區間
  private calculateUnitPriceLevel = (buildingArea: number, price: number): UnitPriceLevel | undefined => {
    const pyeong = buildingArea / this._square
    const unitPriceInPyeong = price / pyeong
    let unitPriceLevel: UnitPriceLevel | undefined = undefined
    if (unitPriceInPyeong <= 500000) {
      unitPriceLevel = '50below'
    } else if (unitPriceInPyeong > 500000 && unitPriceInPyeong <= 750000) {
      unitPriceLevel = '50-75'
    } else if (unitPriceInPyeong > 750000 && unitPriceInPyeong <= 1000000) {
      unitPriceLevel = '75-100'
    } else if (unitPriceInPyeong > 1000000 && unitPriceInPyeong <= 1250000) {
      unitPriceLevel = '100-125'
    } else if (unitPriceInPyeong > 1250000 && unitPriceInPyeong <= 1500000) {
      unitPriceLevel = '125-150'
    } else if (unitPriceInPyeong > 1500000 && unitPriceInPyeong <= 1800000) {
      unitPriceLevel = '150-180'
    } else if (unitPriceInPyeong > 1800000 && unitPriceInPyeong <= 2100000) {
      unitPriceLevel = '180-210'
    } else if (unitPriceInPyeong > 2100000) {
      unitPriceLevel = '210up'
    }
    return unitPriceLevel
  }

  // 計算建築期間等級 - 用於計算投資利潤率
  private calculateConstPeriodLevel = (constructionPeriod: number) => {
    if (constructionPeriod <= 1) {
      return '0up'
    } else if (constructionPeriod <= 2) {
      return '1up'
    } else if (constructionPeriod <= 3) {
      return '2up'
    } else if (constructionPeriod <= 4) {
      return '3up'
    } else if (constructionPeriod <= 5) {
      return '4up'
    } else {
      return '5up'
    }
  }

  // 計算建築期間(年)
  // (地上樓層數, 地下樓層數) => 建築期間(年)
  public getConstructionPeriod = (groundFloor: number, underGroundFloor: number) => {
    const constructionPeriod = (
      (groundFloor * this._groundFloorConstTime) +
      (underGroundFloor * this._underGroundFloorConstTime) +
      this._consConstant
    ) / this._constMonth;
    if (constructionPeriod < this._constPeriodThreshold) return this._constPeriodThreshold
    return constructionPeriod
  }

  // 計算投資利潤率 - 區間
  // (建築期間(年), 縣市代碼) => 投資利潤率
  // ※有參照外部資料 - eprRangeJson
  public getEPRInterval = (
    constructionPeriod: number,
    countyCode: string
  ): IInterval => {
    const eprRange: IEPRRange = eprRangeJson
    const constPeriodLevel = this.calculateConstPeriodLevel(constructionPeriod)
    return {
      min: eprRange[countyCode][constPeriodLevel].min,
      max: eprRange[countyCode][constPeriodLevel].max
    }
  }

  // 計算營造物價指數調整率
  // (建物交易屋齡) => 營造物價指數調整率
  // ※有參照外部資料
  // ※尚未實作
  public getConstAdjRatio = (transactionAge: number) => {
    return 1.0489
  }

  // 計算資本利息綜合利率
  // (建築期間(年)) => 資本利息綜合利率
  // ※有參照外部資料 - bankLoanTable
  public getICRRatio = (
    constructionPeriod: number
  ) => {
    const ICRRatio = (constructionPeriod - this._ICRConstant1) * (
      this._ICROwnRatio * bankLoanTable.ownRatio +
      this._ICRLoanRation * bankLoanTable.loanRatio
    ) / this._ICRConstant2
    return ICRRatio
  }


  /////////////////////////////////////////////////////////


  // 計算營造施工費(元)   - 區間
  // (縣市代碼, 建材, 用途, 地上樓, 建物面積, 房地總價, 是否鋼骨加價) => 營造施工費區間
  // ※有參照外部資料 - buildCostRangeJson
  public getConstBudgetInterval = (
    countyCode: string,
    material: Material,
    buildingPurpose: BuildingPurpose,
    groundFloor: string,
    buildingArea: number,
    price: number,
    steelCharge: boolean
  ): IInterval | undefined => {
    const steelChargePrice = steelCharge ? this._ConstBudgetSteelCharge2 : this._ConstBudgetSteelCharge1
    const buildCostRange: IBuildCostRange = buildCostRangeJson
    const costRangeTable = buildCostRange[countyCode][material][buildingPurpose][groundFloor]
    if (isFactory(costRangeTable)) {
      if (!costRangeTable.min || !costRangeTable.max) return undefined
      return {
        min: costRangeTable.min + steelChargePrice,
        max: costRangeTable.max + steelChargePrice
      }
    } else {
      const unitPriceLevel = this.calculateUnitPriceLevel(
        buildingArea, price
      )
      if (!unitPriceLevel) return undefined
      const min = costRangeTable[unitPriceLevel].min
      const max = costRangeTable[unitPriceLevel].max
      if (!min || !max) return undefined
      return {
        min: min + steelChargePrice,
        max: max + steelChargePrice
      }
    }
  }

  // 計算規劃設計費用(元) - 區間
  // (營造施工費區間, 營造物價指數調整率) => 規劃設計費用區間
  public getDesignBudgetInterval = (
    constBudgetInterval: IInterval,
    constAdjRatio: number
  ): IInterval => {
    const min = constBudgetInterval.min * constAdjRatio * this._designRatioInterval.min
    const max = constBudgetInterval.max * constAdjRatio * this._designRatioInterval.max
    // return { min: round4Decimal(min), max: round4Decimal(max) }
    return { min: min, max: max }
  }

  // 計算廣告銷售費用(元)   - 區間
  // 計算管理費用(元)       - 區間
  // 計算稅捐及其他費用(元) - 區間
  // (營造施工費區間, 規劃設計費用區間, 投資利潤率區間, 資本利息綜合利率
  //  費用類別) => 廣告銷售費用區間
  public getReverseBudgetInterval = (
    constBudgetInterval: IInterval,
    designBudgetInterval: IInterval,
    EPRInterval: IInterval,
    ICRRatio: number,
    constAdjRatio: number,
    budgetType: BudgetType
  ): IInterval | undefined => {
    const inputRatioMin =
      (budgetType === 'ad' && this._adRatioInterval.min) ||
      (budgetType === 'manage' && this._manageRatioInterval.min) ||
      (budgetType === 'tax' && this._taxRatioInterval.min)
    const inputRatioMax =
      (budgetType === 'ad' && this._adRatioInterval.max) ||
      (budgetType === 'manage' && this._manageRatioInterval.max) ||
      (budgetType === 'tax' && this._taxRatioInterval.max)

    if (!inputRatioMin || !inputRatioMax) return undefined
    const minNumerator = inputRatioMin *
      (constBudgetInterval.min * constAdjRatio + designBudgetInterval.min) *
      (this._AdConstant1 + ICRRatio) *
      (this._AdConstant2 + EPRInterval.min)
    const minDeNumerator = (this._AdConstant3 -
      (this._adRatioInterval.min + this._manageRatioInterval.min + this._taxRatioInterval.min) *
      (this._AdConstant4 + ICRRatio) *
      (this._AdConstant5 + EPRInterval.min)
    )
    const min = minNumerator / minDeNumerator
    const maxNumerator = inputRatioMax *
      (constBudgetInterval.max * constAdjRatio + designBudgetInterval.max) *
      (this._AdConstant1 + ICRRatio) *
      (this._AdConstant2 + EPRInterval.max)
    const maxDeNumerator = (this._AdConstant3 -
      (this._adRatioInterval.max + this._manageRatioInterval.max + this._taxRatioInterval.max) *
      (this._AdConstant4 + ICRRatio) *
      (this._AdConstant5 + EPRInterval.max)
    )
    const max = maxNumerator / maxDeNumerator
    // return {
    //   min: round4Decimal(min),
    //   max: round4Decimal(max)
    // }
    return {
      min: min,
      max: max
    }
  }

  // 計算費用合計(元)       - 區間
  // (營造施工費區間, 規劃設計費用區間, 廣告銷售費用區間,
  //  管理費用區間, 稅捐及其他費用區間, 營造物價指數調整率) => 費用合計區間
  public getTotalBudgetInterval = (
    constBudgetInterval: IInterval,
    designBudgetInterval: IInterval,
    adBudgetInterval: IInterval,
    manageBudgetInterval: IInterval,
    taxBudgetInterval: IInterval,
    constAdjRatio: number
  ): IInterval => {
    const min = constBudgetInterval.min * constAdjRatio + designBudgetInterval.min +
      adBudgetInterval.min + manageBudgetInterval.min + taxBudgetInterval.min;
    const max = constBudgetInterval.max * constAdjRatio + designBudgetInterval.max +
      adBudgetInterval.max + manageBudgetInterval.max + taxBudgetInterval.max;
    return {
      min: min,
      max: max
    }
  }

  // 建物成本單價(元/坪)    - 區間
  // (費用合計區間, 資本利息綜合利率, 投資利潤率區間) => 建物成本單價區間
  public getBuildingCostInterval = (
    totalBudgetInterval: IInterval,
    ICRRatio: number,
    EPRInterval: IInterval
  ): IInterval => {
    const min = totalBudgetInterval.min *
      (this._BuildingCostConstant1 + ICRRatio) * (this._BuildingCostConstant2 + EPRInterval.min)
    const max = totalBudgetInterval.max *
      (this._BuildingCostConstant1 + ICRRatio) * (this._BuildingCostConstant2 + EPRInterval.max)
    return {
      min: min,
      max: max
    }
  }


  /////////////////////////////////////////////////////////


  // 計算殘價率
  // (建材, 是否鋼骨加價)
  public getResidualPriceRatio = (
    material: Material,
    steelCharge: boolean
  ) => {
    let residualPriceRatio = 0
    if (material === 'steel') residualPriceRatio = 0.1
    if (material === 'concrete' && steelCharge) residualPriceRatio = 0.1
    if (material === 'concrete' && !steelCharge) residualPriceRatio = 0.05
    return residualPriceRatio
  }

  // 計算經濟耐用年數
  // (使用型態, 構造) => 經濟耐用年數
  public getDurableYears = (
    purpose: BuildingPurpose,
    material: Material
  ) => {
    let durableYears: number | undefined = undefined
    if (
      (purpose === 'resident' || purpose === 'office' || purpose === 'store') &&
      (material === 'concrete')
    ) {
      durableYears = 50
    } else {
      if (
        (purpose === 'resident' || purpose === 'office' || purpose === 'store') &&
        (material === 'brick')
      ) {
        durableYears = 35
      } else {
        if (
          (purpose === 'resident' || purpose === 'office' || purpose === 'store') &&
          (material === 'steel')
        ) {
          durableYears = 20
        } else {

          if (
            (purpose === 'factory') &&
            (material === 'concrete')
          ) {
            durableYears = 35
          } else {

            if (
              (purpose === 'factory') &&
              (material === 'brick')
            ) {
              durableYears = 30
            } else {

              if (
                (purpose === 'factory') &&
                (material === 'steel')
              ) {
                durableYears = 15
              }
            }
          }
        }
      }
    }
    return durableYears
  }

  // 計算建物殘值率
  // (經濟耐用年數, 殘價率, 延長耐用年數, 屋齡) => 建物殘值率
  public getBuildingResidualRation = (
    durableYears: number,
    residualPriceRatio: number,
    extendYears: number,
    age: number
  ) => {
    if (extendYears === 0) {
      return 1 - age * (1 - residualPriceRatio) / durableYears
    } else {
      return 1 - age * (1 - residualPriceRatio) / (age + extendYears)
    }
  }

  // 計算折舊後建物單價    -  區間
  // (建物成本單價區間, 建物殘值率) => 折舊後建物單價區間
  public getDepreciatedBuildingCostInterval = (
    buildingCostInterval: IInterval,
    buildingResidualRation: number
  ): IInterval => {
    const min = buildingCostInterval.min * buildingResidualRation
    const max = buildingCostInterval.max * buildingResidualRation
    return {
      min: min,
      max: max
    }
  }


  /////////////////////////////////////////////////////////

  // 計算土地成本價格(元) - 區間
  // (房地總價, 建物面積(平方公尺), 折舊後建物單價區間)
  public getLandPriceCostInterval = (
    price: number,
    buildingArea: number,
    depreciatedBuildingCostInterval: IInterval
  ): IInterval => {
    const minDBCtotal = depreciatedBuildingCostInterval.min * buildingArea / this._square
    const maxDBCtotal = depreciatedBuildingCostInterval.max * buildingArea / this._square
    const min = price - minDBCtotal
    const max = price - maxDBCtotal
    return {
      min: min,
      max: max
    }
  }

  // 計算土地折舊率
  // (延長耐用年數, 屋齡, 經濟耐用年數) => 土地折舊率
  public getLandDepreciationRatio = (
    extendYears: number,
    age: number,
    durableYears: number
  ) => {
    if (extendYears === 0) {
      return age * 1 / durableYears
    } else {
      return age * 1 / (age + extendYears)
    }
  }

  // 計算土地的資本利息綜合利率
  // ※有參照外部資料 - bankLoanTable
  // (建築期間(年)) => 土地的資本利息綜合利率
  public getLandICRRatio = (
    constructionPeriod: number
  ) => {
    return constructionPeriod * (
      this._ICROwnRatio * bankLoanTable.ownRatio +
      this._ICRLoanRation * bankLoanTable.loanRatio
    )
  }


}

const costConditioner = container.resolve(CostConditioner)
export default costConditioner