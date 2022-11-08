import { requireNonNull } from "../../../utils/object-utils"

interface IStrategyCallback {
  (evntArgs: IStrategyHandlerEventArgs): void
}

interface IStrategyConstructor {
  new (handler: IStrategyCallback): Strategy
}

interface IStrategyEventArgs {
  context?: any
  handled?: any
}

interface IStrategyHandlerEventArgs extends IStrategyEventArgs {
  keyName?: string | number
  value?: any
}

interface IStrategyParameters extends IStrategyEventArgs {
  target: any
}

interface IStrategyGenericParameters<T> extends IStrategyParameters {
  handled?: T
}

/**
 * 💡 Strategy to solve and open object accessing each of it elements
 * and requests `onHandled` callback to notify each valid elements solved.
 *
 * Must implements only one method `run` to determine how access and solve
 * this inner target object elements.
 *
 * Each strategy have to be simple and short, executing a simple operation
 * to access the inner target object elements.
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, february 16 of 2022.
 *
 * @author Carlos Matos
 */
abstract class Strategy {
  protected static HandlerEventArgs = class
    implements IStrategyHandlerEventArgs
  {
    context: any
    keyName?: string | number
    value?: any
    handled?: any

    public addContext(context: any): this {
      this.context = requireNonNull(context)
      return this
    }

    public addParams(params: IStrategyParameters): this {
      this.context = this.context ?? params.context
      this.handled = params.handled
      return this
    }

    public addKeyName(keyName: string | number): this {
      this.keyName = keyName
      return this
    }

    public addValue(value: any): this {
      this.value = value
      return this
    }
  }

  private readonly handler: IStrategyCallback

  constructor(handler: IStrategyCallback) {
    this.handler = requireNonNull(
      handler,
      "Callback handler can no be null at Strategy"
    )
  }

  /**
   * Callback function to fires `handler` and notify that object was handled.
   * @param evntArgs event args with handled object and idetification key name and `handled` parameter from execution param.
   */
  protected onHandled(evntArgs: IStrategyHandlerEventArgs): void {
    this.handler.call(evntArgs.context ?? this, evntArgs)
  }

  /**
   * Schedule strategy to run as a `Promise`.
   * @param params input parameters that contains `target`, `context` and optional parameter `handled` - used as `onHandled` parameter.
   * @returns Strategy `Promise`
   */
  public asPromise<T>(params: IStrategyGenericParameters<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        this.run(params)
        resolve(params.handled)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Execute strategy
   * @param params  input parameters that contains `target`, `context` and optional parameter `handled` - used as `onHandled` parameter.
   */
  abstract run(params: IStrategyParameters): void
}

export {
  Strategy,
  IStrategyCallback,
  IStrategyConstructor,
  IStrategyHandlerEventArgs,
  IStrategyParameters,
}
