
export interface IMarketCompare {
  longitude: number
  latitude: number
  bufferRadius: number

  buildingType: number

  transactionTimeStart?: string
  transactionTimeEnd?: string

  buildingAreaStart?: number
  buildingAreaEnd?: number

  landAreaStart?: number
  landAreaEnd?: number

  ageStart?: number
  ageEnd?: number

  parkingSpaceType?: number
}
