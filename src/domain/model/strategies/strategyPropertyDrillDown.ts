import { IFunction } from "../../../utils/functions"
import {
  isNotFunction,
  isNotPrimitiveWrapper,
  requireNonNull,
} from "../../../utils/object-utils"
import { IStrategyParameters, Strategy } from "./strategy"

/**
 * 💡 👇 Use this strategy as base to resolve objects access from any function
 * that access target's properties.
 *
 * Created by chcmatos carlos.matos@capgemini.com, february 17 of 2022.
 *
 * @author Carlos Matos
 * @see Strategy
 */
export default abstract class StrategyPropertyDrillDown extends Strategy {
  protected runWith(
    params: IStrategyParameters,
    getProperties: IFunction<any, string[] | number[]>
  ): void {
    requireNonNull(params, "Strategy parameters can not be null!")
    requireNonNull(getProperties, "Callback to get properties can not be null!")
    if (
      isNotPrimitiveWrapper(
        requireNonNull(params.target, "Target object can't be null!")
      )
    ) {
      getProperties(params.target).forEach((keyName: string | number) => {
        let prop = null
        try {
          prop = params.target[keyName]
        } catch {
          /*avoid prop access permission*/
        }
        if (isNotFunction(prop)) {
          this.onHandled(
            new Strategy.HandlerEventArgs()
              .addParams(params)
              .addKeyName(keyName)
              .addValue(prop)
          )
        }
      })
    }
  }
}
