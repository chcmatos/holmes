import { Entity } from "./entity"
import { IRequestCounter } from "./interfaces/request-count"

export class MatchRule extends Entity implements IRequestCounter {
  requestCount: number
  description: string
}
