import { MatchRule } from "../domain/model"
import {
  FetchStrategyFigmaComponentNode,
  FetchStrategyFigmaComponentSetNode,
  FetchStrategyFigmaDocumentNode,
  FetchStrategyFigmaFrameNode,
  FetchStrategyFigmaPageNode,
  FetchStrategyFigmaInstanceNode,
  FetchStrategyFigmaRoot,
  FetchStrategyFigmaVectorNode,
  FetchStrategyKeyPropertyDrillDown,
  FetchStrategyOwnPropertyDrillDown,
  IStrategyConstructor,
} from "../domain/model/strategies"
import {
  IAction,
  IConsumer,
  isNull,
  LinkedList,
  requireNonNull,
  STACK_LIMIT,
} from "../utils"
import { DataFound, Result } from "./model"
import { MrHolmesAttrs } from "./mr-holmes-attrs"
import { Toby } from "./mr-toby"

declare const figma: any

export type MrHolmesFigmaBuildParams = {
  closePlugin?: boolean
  messageTimeout?: number
  notify?: boolean
}

/**
 * 🕵 Mr. Holmes (`Sherlock Holmes`) is a class to execute a fetch using a group of strategies
 * and an attempt to solve the `MatchRule` to find one or more elements matching.
 *
 * Each match rule will be learned, generating experiences to find other datas fastlier in future executions.
 *
 * To build an instance of this class use the Builder Pattern by `Builder` class to mount an fetch approach appropriated.
 *
 * An analogy is to Sherlock Holmes tales.
 * Where Holmes has a mystery to solve and will requests support to
 * his `dog Toby` and your friend `Watson` taking notes about everything.
 *
 * Each requests of method `elementary` in an `MrHolmes` instanced class (non limited execution to one time only)
 * will create an isolated instance of `Toby` to use all `strategies` merged in all possible ways
 * to matching and find the object.
 *
 * `Watson` log will register every fetch progress.
 *
 * ![Sherlock Holmes Image](https://i.pinimg.com/originals/e6/2d/be/e62dbe4421f617e5598f5fae713de56a.jpg)
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, february 16 of 2022.
 * @author Carlos Matos
 */
export class MrHolmes extends MrHolmesAttrs {
  /**
   * 👷 A builder pattern to build the `MrHolmes (SherlockHolmes)` object.
   */
  public static readonly Builder = class extends MrHolmesAttrs {
    constructor() {
      super()
    }

    public useLimitResult(limit: number = 1): this {
      this._limit = Math.max(limit, 1)
      return this
    }

    public useFetchCache(
      name: string = MrHolmesAttrs.DEFAULT_CACHE_NAME
    ): this {
      this._fetchCacheName = requireNonNull(name)
      return this
    }

    public useLog(): this {
      this._logEnabled = true
      return this
    }

    public useTarget(target: any): this {
      this._globalTarget = requireNonNull(target)
      return this
    }

    public useWhatToFind(rule: MatchRule): this {
      let newRule = requireNonNull(rule)
      this._whatToFindRule = !!this._whatToFindRule
        ? this._whatToFindRule.and(newRule)
        : newRule
      return this
    }

    public useHowDoIt(strategy: IStrategyConstructor): this {
      this._howDoItStrategies.indexOf(requireNonNull(strategy)) == -1
        ? this._howDoItStrategies.push(strategy)
        : this.logW(
            'The strategy "',
            strategy.name,
            "\" already added before, please don't repeat it!"
          )
      return this
    }

    private useOneTimeOnly(): this {
      this._runOneTimeOnly = true
      return this
    }

    public useDeepnessLimit(deepness: number): this {
      this._stackDeepnessLimit = Math.max(Math.min(deepness, STACK_LIMIT), 1)
      return this
    }

    public useFigma(args: MrHolmesFigmaBuildParams = {}): this {
      args.messageTimeout = args.messageTimeout ?? 2000
      args.closePlugin = args.closePlugin ?? true
      args.notify = args.notify ?? true

      return this.useTarget(figma)
        .useHowDoIt(FetchStrategyFigmaComponentNode)
        .useHowDoIt(FetchStrategyFigmaRoot)
        .useHowDoIt(FetchStrategyFigmaComponentSetNode)
        .useHowDoIt(FetchStrategyFigmaDocumentNode)
        .useHowDoIt(FetchStrategyFigmaFrameNode)
        .useHowDoIt(FetchStrategyFigmaPageNode)
        .useHowDoIt(FetchStrategyFigmaInstanceNode)
        .useHowDoIt(FetchStrategyFigmaVectorNode)
        .useHowDoIt(FetchStrategyKeyPropertyDrillDown)
        .useHowDoIt(FetchStrategyOwnPropertyDrillDown)
        .addOnPrev(
          () =>
            args.notify &&
            figma.notify("🕵 MrHolmes: Starting, Hold on....", {
              timeout: args.messageTimeout,
            })
        )
        .addOnPost((r) => {
          if (args.notify) {
            let message: string
            let arr: LinkedList<string | number> = new LinkedList()
            if (r.successfully) {
              arr
                .push("🕵  MrHolmes: Were found")
                .pushIf(r.values.length == 1, "only 1 (one) element!")
                .pushIf(r.values.length == 2, "a lot of 2 elements! :)")
                .pushIf(r.values.length > 2, r.values.length, "elements!")
                .push("(in ", r.workTime.toStringTime(), ")")
            } else {
              arr.push("🕵  MrHolmes: ").push(r.error.message)
            }
            message = arr.join(" ")
            figma.notify(message, {
              error: !r.successfully,
              timeout: args.messageTimeout,
            })
          }
          if (args.closePlugin) figma.closePlugin()
        })
    }

    public addOnPrev(callback: IAction): this {
      this._prevCallback = callback
      return this
    }

    public addOnProgress(callback: IConsumer<any>): this {
      return isNull(callback)
        ? this.addOnProgressWithRoute(null)
        : this.addOnProgressWithRoute((found) => callback(found.value))
    }

    public addOnProgressWithRoute(callback: IConsumer<DataFound>): this {
      this._progressCallback = callback
      return this
    }

    public addOnPost(callback: IConsumer<Result>): this {
      this._postCallback = callback
      return this
    }

    public addOnPostSuccess(callback: IConsumer<any[]>): this {
      this._postSuccessCallback = callback
      return this
    }

    public addOnPostError(callback: IConsumer<Error>): this {
      this._postErrorCallback = callback
      return this
    }

    public addOnError(callback: IConsumer<Error>): this {
      this._errorCallback = callback
      return this
    }

    /**
     * Build `MrHolmes` with current parameters.
     * After execute it, this builder is reseted.
     * @returns instance of MrHolmes
     */
    public build(): MrHolmes {
      try {
        return new MrHolmes(this)
      } finally {
        this.reset()
      }
    }

    /**
     * Build MrHolmes object to execute one time only and
     * after post result will be destroyed.
     *
     * Execute the `elementary` method to start the fetching
     * on target element.
     *
     * @param target target element, if not setup (null or undefined),
     * so must be implemented a global target by `useTarget` on `Builder`.
     */
    public elementary(target?: any): void {
      this.useOneTimeOnly().build().elementary(target)
    }

    /**
     * Build MrHolmes object to execute one time only and
     * after post result will be destroyed.
     *
     * Execute the `elementaryAsync` method and return a promise of start the fetching
     * on target element.
     *
     * @param target target element, if not setup (null or undefined),
     * so must be implemented a global target by `useTarget` on `Builder`.
     */
    public elementaryAsync<T>(target?: any): Promise<T[]> {
      return this.useOneTimeOnly().build().elementaryAsync(target)
    }
  }

  private constructor(other: MrHolmesAttrs) {
    super(other)
  }

  /**
   * Check if this instance was built to run one time only,
   * then destroy it, otherwise to do nothing.
   */
  private checkIfOneTimeOnlyAndDestroyIt(): void {
    if (this.runOneTimeOnly) {
      this.destroy()
    }
  }

  /**
   * Clone current instance
   * @returns clone of current instance
   */
  private clone(): MrHolmes {
    return new MrHolmes(this)
  }

  /**
   * Get current instance if was built to run one time only, otherwise
   * create a clone of it self and setup to run one time only.
   * @returns run one time only instance.
   */
  private getRunOneTimeOnlyOrClone() {
    if (this.runOneTimeOnly) {
      return this
    }
    let c = this.clone()
    c._runOneTimeOnly = true
    return c
  }

  /**
   * Get global target or throws exception.
   */
  protected getGlobalTarget(): any {
    if (isNull(this._globalTarget)) {
      throw new Error(`Target can not be null or empty! If requested method \"elementary\" 
      without a target input value, must build the MrHolmes class with an 'useTarget' setup by 'Builder'.`)
    }
    return this._globalTarget
  }

  /**
   * Unique accessible method type to execute a fetch to
   * try find some data inner target element.
   * @param target root node to start the fetch.
   */
  public elementary(target?: any): void {
    new Toby(this)
      .onSniffedOut(() => this.checkIfOneTimeOnlyAndDestroyIt())
      .sniff(target ?? this.getGlobalTarget())
  }

  /**
   * Unique accessible method type to create a promise to execute a fetch to
   * try find some data inner target element.
   * @param target root node to start the fetch.
   */
  public elementaryAsync<T>(target?: any): Promise<T[]> {
    //preserve original state
    const self = this.getRunOneTimeOnlyOrClone()
    return new Promise((res, rej) => {
      const postSuccessfully = self._postSuccessCallback
      self._postSuccessCallback = (result) => {
        postSuccessfully?.(result)
        res(result)
      }

      const postError = self._postErrorCallback
      self._postErrorCallback = (error) => {
        postError?.(error)
        rej(error)
      }

      self.elementary(target)
    })
  }
}
