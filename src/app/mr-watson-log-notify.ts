import { Watson } from "../utils"

/**
 * 🧐 📝 Local class to print logs
 */
export abstract class NotifyWatsonLog {
  protected _logEnabled: boolean = false

  protected logE(message?: any, ...optionalParams: any[]): void {
    if (this._logEnabled) Watson.Log.error(message, ...optionalParams)
  }

  protected logI(message?: any, ...optionalParams: any[]): void {
    if (this._logEnabled) Watson.Log.info(message, ...optionalParams)
  }

  protected logV(message?: any, ...optionalParams: any[]): void {
    if (this._logEnabled) Watson.Log.verb(message, ...optionalParams)
  }

  protected logW(message?: any, ...optionalParams: any[]): void {
    if (this._logEnabled) Watson.Log.warn(message, ...optionalParams)
  }
}
