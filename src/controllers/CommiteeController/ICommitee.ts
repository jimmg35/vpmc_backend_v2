
export interface IListTownAvgProps {
  county?: string
  town?: string
  startDate?: string
  endDate?: string
}

export interface IListCommiteeByExtent {
  xmin?: number
  ymin?: number
  xmax?: number
  ymax?: number
}

export interface IGetSimpleInfo {
  commiteeId?: string
  bufferRadius?: number
}

export interface IGetAprInfo {
  commiteeId?: string
  bufferRadius?: number
}
