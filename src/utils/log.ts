import { requireNonNull } from './object-utils'

interface ILogRegister {
  (message?: any, ...optionalParams: any[])
}

/**
 * 🧐 📝 This is a log class, singleton pattern.
 * 
 * In analogy for sherlock holmes tales, 
 * his friend `Watson` take notes about everythings thats happen, 
 * therefore this class is named as `Watson` to register all log in this lib.
 * 
 * Usage:
 * 
 * `Watson.Log.info("use", "how like", "console.log")`
 * 
 * 
 */
class Watson {
  private static _instance: Watson
  private _logger?: Console

  /**
   * Log singleton instance
   */
  public static get Log() {
    return this._instance || (this._instance = new Watson(console))
  }

  private constructor(_logger: Console) {
    this._logger = _logger
  }

  /**
   * Setup logger
   * @param _logger logger non null to register the log info
   */
  public setLogger(_logger: Console) {
    this._logger = requireNonNull(_logger)
  }

  private _log(
    log?: ILogRegister,
    watsonComment?: string,
    message?: any,
    ...optionalParams: any[]
  ) {
    log?.(watsonComment, message, ...optionalParams)
  }

  public verb(message?: any, ...optionalParams: any[]) {
    this._log(
      this._logger?.log,
      '🕵',
      message,
     ...optionalParams,
    )
  }

  public info(message?: any, ...optionalParams: any[]) {
    this._log(
      this._logger?.info,
      '🕵 ✅ I am a Brain Watson The Rest of Me is a mere Appendix:\n\t',
      message,
     ...optionalParams,
    )
  }

  public warn(message?: any, ...optionalParams: any[]) {
    this._log(
      this._logger?.warn,
      '🧐 ⚠️ My Dear Holmes, how you say "The small details are the most important.":\n\t',
      message,
      ...optionalParams,
    )
  }

  public error(message?: any, ...optionalParams: any[]) {
    this._log(
      this._logger?.error,
      '🧐 🐞 My Dear Holmes, "They sees, but their don\'t observe.":\n\t',
      message,
      ...optionalParams,
    )
  }
}

export { Watson }
