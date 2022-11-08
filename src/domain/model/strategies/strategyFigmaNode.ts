import {
  isNotFunction,
  requireNonNull,
  requireNonNullOrEmpty,
} from "../../../utils/object-utils"
import { IStrategyCallback, IStrategyParameters, Strategy } from "./strategy"

/**
 * ![Figma Logo](https://cdn.iconscout.com/icon/free/png-128/figma-1-682085.png)
 *
 * Use this strategy to resolve typed objects access from `figma` API and figma.
 *
 * Created by chcmatos carlos.matos@capgemini.com, february 23 of 2022.
 *
 * @author Carlos Matos
 * @see Strategy
 */
export default abstract class StrategyFigmaNode extends Strategy {
  private readonly figmaNodeCnstrName: string
  private readonly keyName: string

  constructor(
    handler: IStrategyCallback,
    figmaNodeCnstrName: string,
    keyName: string = "children"
  ) {
    super(handler)
    this.figmaNodeCnstrName = requireNonNull(figmaNodeCnstrName)
    this.keyName = requireNonNullOrEmpty(keyName)
  }

  run(params: IStrategyParameters): void {
    let prop: any
    if (
      params.target.constructor.name == this.figmaNodeCnstrName &&
      !!(prop = params.target[this.keyName]) &&
      isNotFunction(prop)
    ) {
      this.onHandled(
        new Strategy.HandlerEventArgs()
          .addParams(params)
          .addKeyName(this.keyName)
          .addValue(prop)
      )
    }
  }
}
