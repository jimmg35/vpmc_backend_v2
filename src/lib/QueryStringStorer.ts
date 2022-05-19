
interface IStringMap {
  [key: string]: string
}

interface ICommiteeStringMap extends IStringMap {
  listTownAvg: string
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
      `
    }
  }

}
