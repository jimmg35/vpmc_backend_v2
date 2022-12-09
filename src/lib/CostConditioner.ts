import { container } from "tsyringe"
import { square, UnitPriceLevel, isFactory, IMinMax } from "../types"

export class CostConditioner {

  // 常數
  // 設計費用占實際營造施工費用之比例
  private _designRatioInterval: number[] = [0.02, 0.03]
  private _adRatioInterval: number[] = [0.03, 0.07]
  private _manageRationInterval: number[] = [0.03, 0.07]


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

  public getConstructionBudgetInterval = (
    costRangeTable: IMinMax | {
      "50below": IMinMax; "50-75": IMinMax; "75-100": IMinMax; "100-125": IMinMax;
      "125-150": IMinMax; "150-180": IMinMax; "180-210": IMinMax; "210up": IMinMax;
    },
    buildingArea: number, price: number
  ) => {
    if (isFactory(costRangeTable)) {
      if (!costRangeTable.min || !costRangeTable.max) return undefined
      return [costRangeTable.min, costRangeTable.max]
    } else {
      const unitPriceLevel = this.calculateUnitPriceLevel(
        buildingArea, price
      )
      if (!unitPriceLevel) return undefined
      const min = costRangeTable[unitPriceLevel].min
      const max = costRangeTable[unitPriceLevel].max
      if (!min || !max) return undefined
      return [min, max]
    }
  }

}

const costConditioner = container.resolve(CostConditioner)
export default costConditioner