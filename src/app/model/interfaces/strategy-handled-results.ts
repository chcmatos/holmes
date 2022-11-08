import { Route } from "../../../domain/model"
import { DataFound } from "../data-found"

/**
 * Strategy handled results
 */
export interface IStrategyHandledResults {
  /**
   * Results found
   */
  results: DataFound[]
  /**
   * Route found for current last result
   */
  route: Route
  /**
   * Inform whether current element is matching to fetch condition
   */
  isMatch?: boolean
  /**
   * Current stack deepness
   */
  stack: number
}
