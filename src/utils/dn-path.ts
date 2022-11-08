import {
  isNonNull,
  isNotFunction,
  isNumber,
  isString,
  requireNonNull,
  requireNonNullOrEmpty,
} from "./object-utils"

type DNSeparators = ", " | "/"

/**
 * Distinguished Name (`DN`) Path
 *
 * An entry is unambiguously identified by a distinguished name (`DN`).
 *
 * A distinguished name is the concatenation of selected attributes from each entry,
 * called the relative distinguished name (`RDN`),
 * in the tree along a path leading from the root down to the named entry.
 *
 * see more about it here https://docs.oracle.com/javase/jndi/tutorial/ldap/models/x500.html
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, march 23 of 2022.
 *
 * @author Carlos Matos
 */
export default abstract class DNPath {
  protected constructor(separator: DNSeparators = ", ") {
    Object.defineProperty(this, "_separator", {
      value: separator,
      writable: true,
      enumerable: false,
    })
    Object.defineProperty(this, "_next", {
      value: undefined,
      writable: true,
      enumerable: false,
    })
    Object.defineProperty(this, "_reverse", {
      value: true,
      writable: true,
      enumerable: false,
    })
    Object.defineProperty(this, "_prefix", {
      value: "",
      writable: true,
      enumerable: false,
    })
  }

  /**
   * Object path key access
   * @param path index
   */
  [path: string]: any

  /**
   * Iterator access
   * @returns iterator
   */
  [Symbol.iterator](): Iterator<string, string> {
    const self = this
    const keys: string[] = Object.keys(self)
    const kLen: number = keys.length
    let kIdx: number = -1
    return <Iterator<string, string>>{
      next() {
        let key = keys[++kIdx]
        return <IteratorReturnResult<string>>{
          value: `${key}=${self[key]}`,
          done: kIdx >= kLen,
        }
      },
    }
  }

  /**
   * Attach next DNPath solver
   * @param path other dnpath solver
   * @returns attached dnpath solver
   */
  protected next(path: DNPath): DNPath {
    return (this._next = requireNonNull(
      path,
      "DNPath: Next Distinguished Name Path can't be null!"
    ))
  }

  /**
   * Fire the chain-of-responsability rules to resolve DNPath for target
   * @param target target object
   * @returns generated Distinguished Name (DN) Path for target object
   */
  protected handle(target: any): DNPath {
    let dnpath: DNPath = this.onHandle(target) ?? this._next?.handle(target)
    if (!dnpath) {
      throw new Error(
        "DNPath: Target is unresolvable for any DNPath chain of responsibility handle implementation!"
      )
    }
    return dnpath
  }

  /**
   * Add new key pair value, or update an existent key changing it value, than
   * return the old value or `undefined` when not exists an old value.
   * @param key access key
   * @param value new value
   * @returns old value of key
   */
  public put(key: string, value: any): any {
    requireNonNullOrEmpty(key, "Key can not be null or empty!")
    let old = this[key]
    this[key] = value
    return old
  }

  /**
   * Get value from key-pair-value
   * @param key access key
   * @returns value of key or `undefined` if not exists
   */
  public get(key: string): any {
    return this[key]
  }

  /**
   * Change current DNPath to be compatible with Microsoft Active Directory.
   * @returns current DNPath updated
   */
  public asActiveDirectory(): DNPath {
    this._separator = this._prefix = "/"
    this._reverse = false
    return this
  }

  /**
   * Distinguished Name (`DN`) Path as literal string representation
   * @returns path as literal string representation
   */
  public toString() {
    let arr: string[] = Array.from(this)
    if (this._reverse) arr.reverse()
    return this._prefix + arr.join(this._separator)
  }

  /**
   * Apply `DNPath` implemented in `chain-of-responsability rule` to generate the path for target.
   * @param target target object
   * @returns return the `DNPath generated` after handled successfully,
   * otherwise return `null` to request next DNPath on `chain-of-responsability`.
   */
  protected abstract onHandle(target: any): DNPath

  /**
   * Generate a Distinguished Name (`DN`) Path for `target` input argument value
   * @param target target value
   * @returns Distinguished Name generated for target input value
   */
  static resolve(target: any): DNPath {
    requireNonNull(
      target,
      "DNPath: Can't resolve Distinguished Name Path for null reference as target!"
    )
    let dnPath = new DNPathImplFigma()
    dnPath.next(new DNPathImplDefault())
    return dnPath.handle(target)
  }
}

class DNPathImplDefault extends DNPath {
  private isValidKeyOrProperty(propValue: any) {
    return (
      isNotFunction(propValue) && (isNumber(propValue) || isString(propValue))
    )
  }

  protected onHandle(target: any): DNPath {
    const self = this
    Object.getOwnPropertyNames(target)
      .filter((p) => self.isValidKeyOrProperty(target[p]))
      .reduce(
        (acc, curr) => {
          if (!acc.includes(curr)) {
            acc.push(curr)
          }
          return acc
        },
        Object.keys(target).filter((k) => self.isValidKeyOrProperty(target[k]))
      )
      .forEach((key) => (self[key] = target[key]))
    return this
  }
}

class DNPathImplFigma extends DNPath {
  private static readonly properties = ["id", "name", "parent"]

  protected onHandle(target: any): DNPath {
    if (
      isNonNull(target) &&
      DNPathImplFigma.properties.every((prop) => prop in target)
    ) {
      this.onHandle(target.parent)
      this[`${target.constructor.name}:${target.id}`] = target.name
      return this
    }
    return null
  }
}
