import { container } from "tsyringe"
import {
  square, UnitPriceLevel, isFactory,
  IMinMax, IBuildCostRange, Material,
  BuildingPurpose, IEPRRange, IInterval
} from "../types"
import buildCostRangeJson from '../controllers/CostController/tables/buildCostRange.json'
import eprRangeJson from '../controllers/CostController/tables/eprRange.json'



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

  // 計算營造施工費 - 區間
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
  public getEPRInterval = (constructionPeriod: number, countyCode: string) => {
    const eprRange: IEPRRange = eprRangeJson
    const constPeriodLevel = this.calculateConstPeriodLevel(constructionPeriod)
    return [
      eprRange[countyCode][constPeriodLevel].min,
      eprRange[countyCode][constPeriodLevel].max
    ]
  }

  // 計算營造物價指數調整率
  // (建物交易屋齡) => 營造物價指數調整率
  // ※有參照外部資料
  // ※尚未實作
  public getConstAdjRatio = (transactionAge: number) => {
    return 1.0489
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

}

const costConditioner = container.resolve(CostConditioner)
export default costConditioner