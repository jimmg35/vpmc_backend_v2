import { Material, BuildingPurpose } from "../../../types"

export interface ICostQuickParam {
  countyCode: string
  buildingArea: number
  buildingPurpose: BuildingPurpose
  material: Material
  age: number
  groundFloor: string
  underGroundFloor: string
  price: number
  steelCharge: boolean | string
  extendYears: number
}