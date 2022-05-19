
interface IStringMap {
  [key: string]: string
}

interface ICommiteeStringMap extends IStringMap {
  listTownAvg: string
  listCommiteeByExtent: string
}

export default class QueryStringStorer {
  public commitee: ICommiteeStringMap

  constructor() {
    this.commitee = {
      listTownAvg: `
        SELECT AVG(ap."unitPrice")
        FROM apr ap, taiwan_map ta
        WHERE ta.countyname = '{0}'
        AND ta.townname = '{1}' 
        AND ap."transactionTime" > '{2}' 
        AND ap."transactionTime" < '{3}' 
        AND ap.coordinate && ta.geom;
      `,
      listCommiteeByExtent: `
        SELECT 
          co.id,
          co.organization, 
          ST_X(co.coordinate::geometry) as longitude,
          ST_Y(co.coordinate::geometry) as latitude 
        FROM commitee co 
        WHERE ST_MakeEnvelope (
          {0}, {1}, 
          {2}, {3}, 4326
        ) && co.coordinate
      `
    }
  }

}
