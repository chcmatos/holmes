import { IStrategyCallback } from "./strategy"
import StrategyFigmaNode from "./strategyFigmaNode"

/**
 * ![Figma Logo](https://cdn.iconscout.com/icon/free/png-128/figma-1-682085.png)
 *
 * Use this strategy to resolve objects of type `InstanceNode` from `figma` API.
 *
 * Created by chcmatos carlos.matos@capgemini.com, july 11 of 2022.
 *
 * @author Carlos Matos
 * @see Strategy
 */
export default class StrategyFigmaInstanceNode extends StrategyFigmaNode {
  constructor(handler: IStrategyCallback) {
    super(handler, "InstanceNode")
  }
}
