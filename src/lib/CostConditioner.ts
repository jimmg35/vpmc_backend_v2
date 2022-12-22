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

export class CostConditioner {

  // **** 常數 ****
  //
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


  // 計算單價等級 - 用於計算營造施工費區間
  private calculateUnitPriceLevel = (buildingArea: number, price: number): UnitPriceLevel | undefined => {
    const pyeong = buildingArea / square
    const unitPriceInPyeong = price / pyeong
    let unitPriceLevel: UnitPriceLevel | undefined = undefined
    if (unitPriceInPyeong <= 50) {
      unitPriceLevel = '50below'
    } else if (unitPriceInPyeong > 50 && unitPriceInPyeong <= 75) {
      unitPriceLevel = '50-75'
    } else if (unitPriceInPyeong > 75 && unitPriceInPyeong <= 100) {
      unitPriceLevel = '75-100'
    } else if (unitPriceInPyeong > 100 && unitPriceInPyeong <= 125) {
      unitPriceLevel = '100-125'
    } else if (unitPriceInPyeong > 125 && unitPriceInPyeong <= 150) {
      unitPriceLevel = '125-150'
    } else if (unitPriceInPyeong > 150 && unitPriceInPyeong <= 180) {
      unitPriceLevel = '150-180'
    } else if (unitPriceInPyeong > 180 && unitPriceInPyeong <= 210) {
      unitPriceLevel = '180-210'
    } else if (unitPriceInPyeong > 210) {
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

  // 計算投資利潤率
  // (建築期間(年), 縣市代碼) => 投資利潤率
  // ※有參照外部資料
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
  // ※有參照外部資料
  public getICRRatio = (
    constructionPeriod: number
  ) => {
    const ICRRatio = (constructionPeriod - this._ICRConstant1) * (
      this._ICROwnRatio * bankLoanTable.ownRatio +
      this._ICRLoanRation * bankLoanTable.loanRatio
    ) / this._ICRConstant2
    return ICRRatio
  }


  // 計算營造施工費(元)   - 區間
  // (縣市代碼, 建材, 用途, 地上樓, 建物面積, 房地總價) => 營造施工費區間
  // ※有參照外部資料
  public getConstructionBudgetInterval = (
    countyCode: string,
    material: Material,
    buildingPurpose: BuildingPurpose,
    groundFloor: string,
    buildingArea: number,
    price: number
  ): IInterval | undefined => {
    const buildCostRange: IBuildCostRange = buildCostRangeJson
    const costRangeTable = buildCostRange[countyCode][material][buildingPurpose][groundFloor]
    if (isFactory(costRangeTable)) {
      if (!costRangeTable.min || !costRangeTable.max) return undefined
      return { min: costRangeTable.min, max: costRangeTable.max }
    } else {
      const unitPriceLevel = this.calculateUnitPriceLevel(
        buildingArea, price
      )
      if (!unitPriceLevel) return undefined
      const min = costRangeTable[unitPriceLevel].min
      const max = costRangeTable[unitPriceLevel].max
      if (!min || !max) return undefined
      return { min: min, max: max }
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
      (constBudgetInterval.min + designBudgetInterval.min) *
      (this._AdConstant1 + ICRRatio) *
      (this._AdConstant2 + EPRInterval.min)
    const minDeNumerator = (this._AdConstant3 -
      (this._adRatioInterval.min + this._manageRatioInterval.min + this._taxRatioInterval.min) *
      (this._AdConstant4 + ICRRatio) *
      (this._AdConstant5 + EPRInterval.min)
    )
    const min = minNumerator / minDeNumerator
    const maxNumerator = inputRatioMax *
      (constBudgetInterval.max + designBudgetInterval.max) *
      (this._AdConstant1 + ICRRatio) *
      (this._AdConstant2 + EPRInterval.max)
    const maxDeNumerator = (this._AdConstant3 -
      (this._adRatioInterval.max + this._manageRatioInterval.max + this._taxRatioInterval.max) *
      (this._AdConstant4 + ICRRatio) *
      (this._AdConstant5 + EPRInterval.max)
    )
    const max = maxNumerator / maxDeNumerator
    return {
      min: min,
      max: max
    }
  }

}

const costConditioner = container.resolve(CostConditioner)
export default costConditioner