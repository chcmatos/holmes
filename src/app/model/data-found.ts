import { Route } from "../../domain/model"

/**
 * 🍀 Data found at route matching to the rules.
 */
export class DataFound {
  /**
   * 🍍 Data matching to the rule
   */
  public readonly value: any

  /**
   * 🗺 Data route on target
   */
  public readonly route: Route

  constructor(value: any, route: Route) {
    this.value = value
    this.route = route
  }
}
