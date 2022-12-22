import { Material, BuildingPurpose } from "../../../types"

export interface ICostQuickParam {
  countyCode: string
  buildingArea: number
  buildingPurpose: BuildingPurpose
  material: Material
  completionTime: string
  groundFloor: string
  underGroundFloor: string
  price: number
  steelCharge: boolean
}