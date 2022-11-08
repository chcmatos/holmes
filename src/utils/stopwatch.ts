import Duration from './duration'
import { requireNonNull } from './object-utils'

/**
 * ⏱ Stopwatch to check performance.
 * 
 * Created by chcmatos <carlos.matos@capgemini.com>, march 16 of 2022.
 * @author Carlos Matos
 */
export default class Stopwatch {
  private _startTime?: Date
  private _endTime?: Date

  constructor() {}

  public get startTime(): Date {
    return this._startTime
  }

  public get endTime(): Date {
    return this._endTime
  }

  private requireStartTime(): Date {
    return requireNonNull(
      this._startTime,
      'Stopwatch: Start function not required!',
    )
  }

  /**
   * Mark and return current duration without stop and without reset start time.
   * @returns duration mark.
   */
  public mark(): Duration {
    return new Duration(this.requireStartTime())
  }

  /**
   * Stop and return difference between start and end time.
   * @returns duration time
   */
  public stop(): Duration {
    return new Duration(this.requireStartTime(), (this._endTime = new Date()))
  }

  /**
   * Start a new time register.
   * @returns current stopwatch instance.
   */
  public start(): this {
    this._startTime = new Date()
    this._endTime = null
    return this
  }

  /**
   * Stop and clear time register.
   * @returns current stopwatch instance.
   */
  public reset(): this {
    this._startTime = null
    this._endTime = null
    return this
  }
}
