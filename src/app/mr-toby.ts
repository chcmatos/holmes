import { Route, RoutePin } from "../domain/model"
import { IStrategyHandlerEventArgs, Strategy } from "../domain/model/strategies"
import { IAction, isNonNull, requireNonNull, Stopwatch } from "../utils"
import { DataFound, IStrategyHandledResults, Result } from "./model"
import { MrHolmesAttrs } from "./mr-holmes-attrs"

/**
 * 🐶 Toby is the sherlock holmes dog.
 *
 * Here, it is our fetcher, each instance of
 * this class will be in an enclosured context to fetching
 * the inputed target by search rule.
 */
export class Toby extends MrHolmesAttrs {
  private readonly unlimited: boolean
  private running: boolean
  private strategies: Strategy[]
  private _sniffedOutCallback: IAction

  constructor(owner: MrHolmesAttrs) {
    super(owner)
    this.unlimited = this.limit < 1
    this.strategies = this.howDoItStrategies.reduce((acc, curr) => {
      let strategy: Strategy = new curr(this.onStrategyHandled)
      acc.push(strategy)
      return acc
    }, [])
  }

  protected destroy(): void {
    super.destroy()
    delete this.strategies
    delete this._sniffedOutCallback
  }

  private requireNonRunning(): void {
    if (this.running) {
      throw new Error("Toby the dog already sniffing!")
    }
  }

  private fireOnCaughtIt(handled: IStrategyHandledResults) {
    this.logV(
      "🐶 Good Jobs Toby, you caught it!",
      "\n\t⤷ 📌 Route " + handled.route
    )
  }

  private fireOnUncaughtedIt(error: Error) {
    this.logW(error)
  }

  private fireOnLostTrack(error: Error) {
    this.logE(error)
  }

  private fireOnPrev(): void {
    this._prevCallback?.call(this)
  }

  private fireOnProgress(found: DataFound): void {
    this._progressCallback?.call(this, found)
  }

  private fireOnPostSuccess(results: Result): void {
    this._postCallback?.call(this, results)
    this._postSuccessCallback?.call(this, results.values)
  }

  private fireOnPostError(results: Result): void {
    this._postCallback?.call(this, results)
    this._postErrorCallback?.call(this, results.error)
    this.fireOnLostTrack(results.error)
  }

  private fireOnError(error: Error): void {
    this._errorCallback?.call(this, error)
    this.fireOnUncaughtedIt(error)
  }

  private fireOnSniffedOut(): void {
    this._sniffedOutCallback?.call(this)
  }

  private onStrategyHandled(evntArgs: IStrategyHandlerEventArgs): void {
    let currHandled: IStrategyHandledResults = evntArgs.handled
    let handled: IStrategyHandledResults = {
      stack: ++currHandled.stack,
      results: currHandled.results,
      route: currHandled.route
        .copy()
        .push(new RoutePin(evntArgs.keyName, evntArgs.value)),
    }
    currHandled.isMatch =
      handled.stack < this.stackDeepnessLimit &&
      this.running &&
      isNonNull(evntArgs.value) &&
      this.fetch(evntArgs.value, handled)
  }

  private fetch(target: any, handled: IStrategyHandledResults): boolean {
    if ((handled.isMatch = this.whatToFindRule.isMatch(target))) {
      let df: DataFound = new DataFound(target, handled.route)
      this.running =
        handled.results.some((e) => e.value == df.value) ||
        handled.results.push(df) < this.limit ||
        this.unlimited
      this.fireOnProgress(df)
      this.fireOnCaughtIt(handled)
      return handled.isMatch
    } else {
      return this.strategies.some((s: Strategy) => {
        try {
          s.run({ context: this, target, handled })
        } catch (e) {
          this.fireOnError(e)
        }
        return handled.isMatch
      })
    }
  }

  sniff(target: any): void {
    requireNonNull(
      target,
      "Is not possible start a fetch in a null object reference, please fix it!"
    )
    this.requireNonRunning()
    this.running = true
    const stopwatch: Stopwatch = new Stopwatch().start()
    this.fireOnPrev()
    Promise.allSettled(
      this.strategies.map(
        async (s: Strategy) =>
          await s.asPromise<IStrategyHandledResults>({
            context: this,
            target,
            handled: {
              results: [],
              route: new Route(),
              stack: 0,
            },
          })
      )
    )
      .then((promisesResult) => {
        promisesResult
          .filter((result) => result.status === "rejected")
          .forEach((error) =>
            this.fireOnError((<PromiseRejectedResult>error).reason)
          )

        let foundResult = promisesResult.find(
          (result) =>
            result.status === "fulfilled" && !!result.value?.results?.length
        )

        if (!!foundResult) {
          this.fireOnPostSuccess(
            Result.successfuly(
              (<PromiseFulfilledResult<IStrategyHandledResults>>(
                foundResult
              )).value.results.map((df) => df.value),
              stopwatch.stop()
            )
          )
        } else {
          this.fireOnPostError(
            Result.error(
              new Error("We haven't been able to resolve this case, yet!"),
              stopwatch.stop()
            )
          )
        }
      })
      .catch((e) => this.fireOnPostError(e))
      .finally(() => {
        this.running = false
        this.fireOnSniffedOut()
        this.destroy()
      })
  }

  onSniffedOut(callback: IAction): this {
    this._sniffedOutCallback = callback
    return this
  }
}
