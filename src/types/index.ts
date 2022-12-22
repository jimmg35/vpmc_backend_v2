
export enum buildingType {
  apartmentComplex = 0, // 住宅大樓(11層含以上有電梯)
  officeBuilding = 1,   // 辦公商業大樓
  other = 2,            // 其他
  flat = 3,             // 公寓(5樓含以下無電梯)
  apartment = 4,        // 華廈(10層含以下有電梯)
  suite = 5,              // 套房(1房1廳1衛)
  townhouse = 6,        // 透天厝
  store = 7,            // 店面(店鋪)
  factoryOffice = 8,     // 廠辦
  warehouse = 9,        // 倉庫
  factory = 10,         // 工廠
  farmhouse = 11        // 農舍
}

export const square = 3.305785

export type BuildingPurpose = 'resident' | 'factory'
export type Material = 'concrete' | 'brick' | 'steel'
export type UnitPriceLevel = '50below' | '50-75' | '75-100' | '100-125' |
  '125-150' | '150-180' | '180-210' | '210up'

export interface IMinMax {
  min: number | null
  max: number | null
}
export interface IInterval { min: number; max: number }
export function isFactory (object: any): object is IMinMax {
  return 'min' in object;
}

export interface IBuildCostRange {
  [key: string]: {
    [key in Material]: {
      [key in BuildingPurpose]: {
        [key: string]: {
          [key in UnitPriceLevel]: IMinMax
        } | IMinMax
      }
    }
  }
}

export interface IEPRRange {
  [key: string]: {
    [key: string]: IInterval
  }
}
