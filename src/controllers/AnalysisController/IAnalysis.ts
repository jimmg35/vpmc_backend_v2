
export interface IMarketCompare {

  buildingType: number

  longitude?: number
  latitude?: number
  bufferRadius?: number

  geojson?: string

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
