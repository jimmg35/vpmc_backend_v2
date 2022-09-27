import { container } from "tsyringe"

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
  getCommiteeByAprId: string
}

interface IUtilityMap extends IStringMap {
  listCountiesByRegion: string
  listTownsByCounty: string
  getVillageGeographyByTown: string
  getCountyTownNameByCoordinate: string
  getCoordinateByCountyTownName: string
}

interface IAnalysisMap extends IStringMap {
  marketCompare: string
  marketCompareStatistic: string
}

export class QueryStringStorer {
  public commitee: ICommiteeStringMap
  public apr: IAprStringMap
  public utility: IUtilityMap
  public analysis: IAnalysisMap

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
      `,
      getCommiteeByAprId: `
        SELECT
          co.organization,
          co."licenseYear",
          co."licenseCode"
        FROM
          apr ap,
          commitee co
        WHERE 
          ap."id" = '{0}'
        AND
          ST_Buffer(
            ap.coordinate, 35
          ) && co.coordinate
      `
    }
    this.utility = {
      listCountiesByRegion: `
        SELECT DISTINCT countyname FROM "taiwan_map"
      `,
      listTownsByCounty: `
        SELECT DISTINCT townname FROM "taiwan_map" WHERE countyname = '{0}'
      `,
      getVillageGeographyByTown: `
        SELECT
          json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(ST_AsGeoJSON(t.*)::json)
          )
        FROM 
          (
            SELECT
              villname,
              geom
            FROM "taiwan_map" WHERE countyname = '{0}' AND townname = '{1}'
          ) AS t
        `,
      getCountyTownNameByCoordinate: `
          SELECT 
            ta.countyname, 
            ta.townname 
          FROM 
            taiwan_map ta 
          WHERE 
            ST_SetSRID(
              ST_Point({0}, {1})::geography, 4326) && ta.geom
        `,
      getCoordinateByCountyTownName: `
          SELECT 
            ST_X(st_centroid(st_union(geom))) as longitude,
            ST_Y(st_centroid(st_union(geom))) as latitude 
          FROM 
            "taiwan_map" 
          WHERE 
            countyname = '{0}' 
          AND
            townname = '{1}'
        `
    }
    this.analysis = {
      marketCompare: `
        SELECT
          ap.id,
          ap."transactionTime" as transactionTime,
          ap."completionTime" as completionTime,
          ap."transferFloor",
          ap."unitPrice",
          ap."priceWithoutParking",
          ap."roomNumber",
          ap."hallNumber",
          ap."bathNumber",
          ap."buildingTransferArea",
          ap."parkingSpacePrice",
          ap."parkingSpaceTransferArea",
          ap."price",
          ap."landAmount",
          ap."buildingAmount",
          ap."parkAmount",
          ap."buildingType",
          ap."floor",
          ap."urbanLandUse",
          ap."buildingArea",
          ap."subBuildingArea",
          ap."belconyArea",
          ap."landTransferArea",
          ap."parkingSpaceType",
          ap."address",
          ST_X(ap.coordinate::geometry) as longitude,
          ST_Y(ap.coordinate::geometry) as latitude 
        FROM 
          apr ap
        WHERE
      `,
      marketCompareCountyTown: `
        SELECT
          ap.id,
          ap."transactionTime" as transactionTime,
          ap."completionTime" as completionTime,
          ap."transferFloor",
          ap."unitPrice",
          ap."priceWithoutParking",
          ap."roomNumber",
          ap."hallNumber",
          ap."bathNumber",
          ap."buildingTransferArea",
          ap."parkingSpacePrice",
          ap."parkingSpaceTransferArea",
          ap."price",
          ap."landAmount",
          ap."buildingAmount",
          ap."parkAmount",
          ap."buildingType",
          ap."floor",
          ap."urbanLandUse",
          ap."buildingArea",
          ap."subBuildingArea",
          ap."belconyArea",
          ap."landTransferArea",
          ap."parkingSpaceType",
          ap."address",
          ST_X(ap.coordinate::geometry) as longitude,
          ST_Y(ap.coordinate::geometry) as latitude 
        FROM 
          apr ap,
          taiwan_map ta
        WHERE
      `,
      marketCompareStatistic: `
        SELECT
          ap."buildingType",
          ap."priceWithoutParking",
          ap."unitPrice",
          ap."transactionTime" as transactionTime,
          ap."completionTime" as completionTime
        FROM 
          apr ap
        WHERE
      `,
      marketCompareStatisticCountyTown: `
        SELECT
          ap."buildingType",
          ap."priceWithoutParking",
          ap."unitPrice",
          ap."transactionTime" as transactionTime,
          ap."completionTime" as completionTime
        FROM 
          apr ap,
          taiwan_map ta
        WHERE
      `
    }
  }
}

const queryStringStorer = container.resolve(QueryStringStorer)
export default queryStringStorer