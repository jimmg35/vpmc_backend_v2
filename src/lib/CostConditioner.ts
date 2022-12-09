import { container } from "tsyringe"

export class CostConditioner {

  public determineUnitPriceRange = () => {

  }

}

const costConditioner = container.resolve(CostConditioner)
export default costConditioner