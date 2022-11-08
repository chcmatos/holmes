import {
  isNumberInvalidIndex,
  isStringNullOrEmpty,
} from "../../utils/object-utils"

/**
 * 📌 Route Pin
 *
 * Each step to build a route to find
 * the target object by Sherlock Holmes's dog Toby.
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, february 22 of 2022.
 *
 * @author Carlos Matos
 */
export default class RoutePin {
  private _key: string | number
  private _value: any

  public readonly toString = (): string => this._key?.toString()

  /**
   * Key identification for this route pin.
   *
   * An analogy may be a street name
   */
  get key(): string | number {
    return this._key
  }

  /**
   * Value found in this key.
   */
  get value(): any {
    return this._value
  }

  constructor(key: string | number, value: any) {
    this._key = this.requireValidKey(key)
    this._value = value
  }

  private requireValidKey(key: string | number): string | number {
    if (isStringNullOrEmpty(key) || isNumberInvalidIndex(key)) {
      throw new Error("Key is invalid!")
    }
    return key
  }

  clear(): void {
    this._key = undefined
    this._value = undefined
  }
}
