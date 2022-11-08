import { Duration, requireNonNull } from "../../utils"

/**
 * 📦 Research result
 */
export class Result {
  /**
   * Values found
   */
  public readonly values: any[]
  /**
   * Result successfuly
   */
  public readonly successfully: boolean
  /**
   * Result error
   */
  public readonly error: Error
  /**
   * Duration work time
   */
  public readonly workTime: Duration

  private constructor(values: any[], error: Error, workTime: Duration) {
    this.values = values
    this.successfully = !!values?.length && !error
    this.error = error
    this.workTime = workTime
  }

  public static successfuly(values: any[], workTime: Duration) {
    return new Result(requireNonNull(values), null, workTime)
  }

  public static error(error: Error, workTime: Duration) {
    return new Result([], requireNonNull(error), workTime)
  }
}
