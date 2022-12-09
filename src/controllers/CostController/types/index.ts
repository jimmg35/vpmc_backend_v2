import { buildingType } from "../../../types"

export interface ICostQuickParam {
  countyCode: string
  buildingArea: number
  buildingType: buildingType
  material: string
  completionTime: string
  groundFloor: number
  underGroundFloor: number
  price: number
}