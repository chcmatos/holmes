import { Entity } from "./entity"
import { IRequestCounter } from "./interfaces/request-count"

class RootTarget extends Entity implements IRequestCounter {
  public requestCount: number
}
