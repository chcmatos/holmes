import { IStrategyCallback } from './strategy'
import StrategyFigmaNode from './strategyFigmaNode'

/**
 * ![Figma Logo](https://cdn.iconscout.com/icon/free/png-128/figma-1-682085.png)
 *
 * Use this strategy to resolve objects of type `VectorNode` from `figma` API.
 *
 * Created by chcmatos carlos.matos@capgemini.com, february 23 of 2022.
 *
 * @author Carlos Matos
 * @see Strategy
 */
export default class StrategyFigmaVectorNode extends StrategyFigmaNode {
  constructor(handler: IStrategyCallback) {
    super(handler, 'VectorNode', 'vectorPaths')
  }
}
