import { IStrategyParameters } from "./strategy"
import StrategyPropertyDrillDown from "./strategyPropertyDrillDown"

/**
 * 💡 👇 Use this strategy to resolve objects access from `Object.getOwnPropertyNames` only.
 *
 * Created by chcmatos carlos.matos@capgemini.com, february 17 of 2022.
 *
 * @author Carlos Matos
 * @see StrategyPropertyDrillDown
 */
export default class StrategyOwnPropertyDrillDown extends StrategyPropertyDrillDown {
  run(params: IStrategyParameters): void {
    this.runWith(params, Object.getOwnPropertyNames)
  }
}
