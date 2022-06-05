
interface IStringMap {
  [key: string]: string
}

interface ICommiteeStringMap extends IStringMap {
  listTownAvg: string
  listCommiteeByExtent: string
  getSimpleInfo: string
  getAprInfo: string
}

interface IAprStringMap extends IStringMap {
  getTownInfo: string
}

export default class QueryStringStorer {
  public commitee: ICommiteeStringMap
  public apr: IAprStringMap

  constructor() {
    this.commitee = {
      listTownAvg: `
        SELECT 
          AVG(ap."unitPrice")
        FROM 
          apr ap, 
          taiwan_map ta
        WHERE 
          ta.countyname = '{0}'
          AND ta.townname = '{1}' 
          AND ap."transactionTime" > '{2}' 
          AND ap."transactionTime" < '{3}' 
          AND ap.coordinate && ta.geom;
      `,
      listCommiteeByExtent: `
        SELECT 
          co.id,
          co.organization, 
          co.address,
          ST_X(co.coordinate::geometry) as longitude,
          ST_Y(co.coordinate::geometry) as latitude 
        FROM 
          commitee co 
        WHERE 
          ST_MakeEnvelope (
            {0}, {1}, 
            {2}, {3}, 4326
          ) && co.coordinate
      `,
      getSimpleInfo: `
        SELECT 
          AVG(ap."unitPrice") as avg_unit_price,
          COUNT(ap) as apr_count,
          MIN(co.date) as completion_date,
          MIN(ap."buildingType") as building_type
        FROM 
          commitee co, 
          apr ap
        WHERE 
          co.id = '{0}'
          AND ST_Buffer(co.coordinate, {1}) && ap.coordinate
      `,
      getAprInfo: `
        SELECT 
          ap."transactionTime",
          ap."transferFloor",
          ap."unitPrice",
          ap."priceWithoutParking",
          ap."roomNumber",
          ap."hallNumber",
          ap."bathNumber",
          ap."buildingTransferArea",
          ap."parkingSpacePrice",
          ap."parkingSpaceTransferArea",
          ap."price"
        FROM 
          commitee co, 
          apr ap
        WHERE 
          co.id = '{0}'
          AND ST_Buffer(co.coordinate, {1}) && ap.coordinate;
      `
    }
    this.apr = {
      getTownInfo: `
        SELECT 
          ap."buildingType",
          ap."priceWithoutParking",
          ap."unitPrice",
          ap."completionTime",
          ap."transactionTime"
        FROM 
          apr ap, 
          taiwan_map ta
        WHERE 
          ta.countyname = '{0}'
          AND ta.townname = '{1}' 
          AND ap.coordinate && ta.geom ORDER BY ap."transactionTime";
      `
    }
  }

}
