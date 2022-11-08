import { MatchRule } from "../domain/model"
import { IStrategyConstructor } from "../domain/model/strategies"
import { IAction, IConsumer, STACK_LIMIT } from "../utils"
import { DataFound } from "./model/data-found"
import { Result } from "./model/result"
import { NotifyWatsonLog } from "./mr-watson-log-notify"

/**
 * ⚙ Attributes shared between MrHolmes objects context
 */
export abstract class MrHolmesAttrs extends NotifyWatsonLog {
  protected static readonly DEFAULT_CACHE_NAME = "mrHolmesBrain"
  protected static readonly SECURE_STACK_LIMIT = STACK_LIMIT * 0.5
  protected static readonly DEFAULT_STACK_LIMIT = Math.min(
    100,
    MrHolmesAttrs.SECURE_STACK_LIMIT
  )

  protected _limit: number = 0
  protected _fetchCacheName?: string = MrHolmesAttrs.DEFAULT_CACHE_NAME
  protected _whatToFindRule?: MatchRule
  protected _howDoItStrategies: IStrategyConstructor[] = []
  protected _runOneTimeOnly: boolean = false
  protected _globalTarget: any
  protected _stackDeepnessLimit: number = MrHolmesAttrs.DEFAULT_STACK_LIMIT
  protected _prevCallback?: IAction
  protected _progressCallback?: IConsumer<DataFound>
  protected _postCallback?: IConsumer<Result>
  protected _postSuccessCallback: IConsumer<any[]>
  protected _postErrorCallback: IConsumer<Error>
  protected _errorCallback?: IConsumer<Error>

  get limit(): number {
    return this._limit
  }

  get fetchCacheName(): string {
    return this._fetchCacheName
  }

  get whatToFindRule(): MatchRule {
    return this._whatToFindRule
  }

  get howDoItStrategies(): IStrategyConstructor[] {
    return this._howDoItStrategies
  }

  get runOneTimeOnly(): boolean {
    return this._runOneTimeOnly
  }

  get globalTarget(): any {
    return this._globalTarget
  }

  get stackDeepnessLimit(): number {
    return this._stackDeepnessLimit
  }

  protected constructor(other?: MrHolmesAttrs) {
    super()
    if (!!other) {
      this._limit = other.limit
      this._whatToFindRule = other.whatToFindRule
      this._fetchCacheName = other.fetchCacheName
      this._howDoItStrategies = other.howDoItStrategies
      this._runOneTimeOnly = other.runOneTimeOnly
      this._logEnabled = other._logEnabled
      this._globalTarget = other._globalTarget
      this._stackDeepnessLimit = other._stackDeepnessLimit
      this._prevCallback = other._prevCallback
      this._progressCallback = other._progressCallback
      this._postCallback = other._postCallback
      this._postSuccessCallback = other._postSuccessCallback
      this._postErrorCallback = other._postErrorCallback
      this._errorCallback = other._errorCallback
    }
  }

  protected reset(): void {
    this._whatToFindRule = null
    this._fetchCacheName = null
    this._howDoItStrategies = null
    this._globalTarget = null
    this._prevCallback = null
    this._progressCallback = null
    this._postCallback = null
    this._postSuccessCallback = null
    this._postErrorCallback = null
    this._errorCallback = null
  }

  protected destroy(): void {
    delete this._limit
    delete this._whatToFindRule
    delete this._fetchCacheName
    delete this._howDoItStrategies
    delete this._runOneTimeOnly
    delete this._globalTarget
    delete this._prevCallback
    delete this._progressCallback
    delete this._postCallback
    delete this._postSuccessCallback
    delete this._postErrorCallback
    delete this._errorCallback
  }
}
