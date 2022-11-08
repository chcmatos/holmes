import {
  isNotFunction,
  requireNonNull,
  requireNonNullOrEmpty,
} from "../../../utils/object-utils"
import { IStrategyCallback, IStrategyParameters, Strategy } from "./strategy"

declare const figma: any

/**
 * ![Figma Logo](https://cdn.iconscout.com/icon/free/png-128/figma-1-682085.png)
 *
 * Use this strategy to resolve `root` from `figma` API.
 *
 * Created by chcmatos carlos.matos@capgemini.com, february 25 of 2022.
 *
 * @author Carlos Matos
 * @see Strategy
 */
export default class StrategyFigmaRoot extends Strategy {
  constructor(handler: IStrategyCallback) {
    super(handler)
  }

  run(params: IStrategyParameters): void {
    if (
      typeof figma !== "undefined" &&
      requireNonNull(
        params.target,
        "StrategyFigmaRoot's target object can't be null"
      ) === figma
    ) {
      this.onHandled(
        new Strategy.HandlerEventArgs()
          .addParams(params)
          .addKeyName("root")
          .addValue(
            requireNonNull(
              figma.root,
              "StrategyFigmaRoot's target object is a figma API instance but does not contains the 'root' property!"
            )
          )
      )
    }
  }
}
