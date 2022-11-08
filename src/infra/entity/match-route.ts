import { Entity } from "./entity"
import { IRequestCounter } from "./interfaces/request-count"

export class MatchRoute extends Entity implements IRequestCounter {
  rootTargetId: string
  matchRuleId: string
  requestCount: number
  routes: Route
}

export class Route {
  name: string
  isArray: boolean
  next: Route
}
