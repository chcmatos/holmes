/**
 * An object that represents an unsigned 64-bits number.
 */
export default class UInt64 implements Iterable<number> {
  //#region constants
  /**
   * Number of digits (8)
   */
  public static readonly DIGITS: number = 8

  /**
   * Number of bits in a digit (8)
   */
  public static readonly DIGIT_BITS: number = 8

  /**
   * The numerical base of a digit (256)
   */
  public static readonly DIGIT_BASE: number = 256
  //#endregion

  /**
   * Constructor `UInt64`
   * @param items uint64 digits
   */
  private constructor(...items: number[]) {
    UInt64.requireValidLength(items).forEach((e, i) => (this[i] = e))
  }

  //#region key access and iterator
  /**
   * Object key access
   * @param key index
   */
  [key: number]: number

  /**
   * Iterator access
   * @returns iterator
   */
  [Symbol.iterator](): Iterator<number, number> {
    let step: number = -1
    const self = this
    return <Iterator<number, number>>{
      next() {
        return <IteratorReturnResult<number>>{
          value: self[++step],
          done: step >= UInt64.DIGITS,
        }
      },
    }
  }
  //#endregion

  //#region UInt64 behavior functions

  /**
   * Generate a clone of Uint64
   * @returns new reference of Uint64 with same digits
   */
  public clone(): UInt64 {
    return new UInt64(...this.toArray())
  }

  /**
   * Convert `Uint64` representation to `number`
   * @returns return number
   */
  public toNumber(): number {
    return Math.floor(
      this.reduceRight((acc, curr) => {
        acc *= UInt64.DIGIT_BASE
        return acc + curr
      }, 0)
    )
  }

  /**
   * Convert `UInt64` representation to number array.
   * @returns return number array
   */
  public toArray(): number[] {
    return Array.from(this)
  }

  /**
   * add `Uint64` (`other`) to current `Uint64` (`this`) and
   * return the overflow (out of `Uint64` capacity).
   * @param other `Uint64` number to be added to current number.
   * @return return the overflow `number`, this happens when the sum is out of `Uint64` capacity, otherwise 0.
   */
  public add(other: UInt64 | number): number {
    if (other instanceof UInt64) {
      let overflow: number = 0
      if (!!other) {
        for (let i = 0; i < UInt64.DIGITS; i++) {
          overflow += this[i] + other[i]
          this[i] = Math.floor(overflow % UInt64.DIGIT_BASE)
          overflow = Math.floor(overflow / UInt64.DIGIT_BASE)
        }
      }
      return overflow
    } else {
      return this.add(UInt64.parse(<number>other))
    }
  }

  /**
   * if `condition` was accepted, then add `Uint64` (`other`) to current `Uint64` (`this`) and
   * return the overflow (out of `Uint64` capacity), otherwise only return 0.
   * @param other `Uint64` number to be added to current number.
   * @param condition add condition
   * @return return the overflow `number`, this happens when the sum is out of `Uint64` capacity, otherwise 0.
   */
  public addIf(
    other: UInt64 | number,
    condition: (i: UInt64 | number) => boolean
  ): number {
    return condition(other) ? this.add(other) : 0
  }

  /**
   * Multiply target `number|Uint64` (other) to current `Uint64` (this) and
   * return overflow (out of `Uint64` capacity)
   * @param other target number
   * @return return the overflow `number`, this happens when the sum is out of `Uint64` capacity, otherwise 0.
   */
  public mult(other: UInt64 | number): number {
    if (other instanceof UInt64) {
      return this.multUI64(<UInt64>other).toNumber()
    } else {
      let overflow = 0
      for (let i = 0; i < UInt64.DIGITS; i++) {
        overflow += this[i] * other
        this[i] = Math.floor(overflow % UInt64.DIGIT_BASE)
        overflow = Math.floor(overflow / UInt64.DIGIT_BASE)
      }
      return overflow
    }
  }

  /**
   * Multiply the current `Uint64` to target `Uint64` (y),
   * proving a result at current `Uint64` and
   * return overflow (out of `Uint64` capacity)
   * @param y target Uint64 to be the mutiplier of `current UInt64`
   * @return return the overflow `number`, this happens when the sum is out of `Uint64` capacity, otherwise 0.
   */
  public multUI64(y: UInt64): UInt64 {
    let i: number
    let j: number

    // #region temporary result buffer
    const bufferLength = UInt64.DIGITS * 2
    let resultBuffer = new Array<number>(bufferLength)
    for (i = 0; i < bufferLength; i++) {
      resultBuffer[i] = 0
    }
    //#endregion

    //#region perform multiplication operation
    let carry: number
    for (i = 0; i < UInt64.DIGITS; i++) {
      /*  calculate partial product and immediately add to `result buffer`  */
      carry = 0
      for (j = 0; j < UInt64.DIGITS; j++) {
        carry += this[i] * y[j] + resultBuffer[i + j]
        resultBuffer[i + j] = carry % UInt64.DIGIT_BASE
        carry /= UInt64.DIGIT_BASE
      }

      /*  add carry to remaining digits in `result buffer`  */
      for (; j < bufferLength - i; j++) {
        carry += resultBuffer[i + j]
        resultBuffer[i + j] = carry % UInt64.DIGIT_BASE
        carry /= UInt64.DIGIT_BASE
      }
    }
    //#endregion

    //#region provide result by splitting `resultBuffer` into `current UInt64`
    for (i = 0; i < UInt64.DIGITS; i++) {
      this[i] = resultBuffer[i]
    }
    //#endregion

    //#region return overflow/carry
    let ov = resultBuffer.slice(UInt64.DIGITS, UInt64.DIGITS)
    return new UInt64(
      ...Array.from({ length: UInt64.DIGITS }, (_, i) => ov[i] ?? 0)
    )
    //#endregion
  }
  //#endregion

  //#region UInt64 bitwise operations
  /**
   * Apply AND operator and return a new `Uint64` result
   *
   * See more about it here: https://en.wikipedia.org/wiki/Bitwise_operation#AND
   *
   * Formula: `n0 & n1`
   *
   * @param other other Uint64 instance to apply comparation.
   * @returns new `Uint64` instance result of AND operator comparation.
   */
  public and(other: UInt64): UInt64 {
    return new UInt64(...this.map((e, i) => e & other[i]))
  }

  /**
   * Apply OR operator and return a new `Uint64` result
   *
   * See more about it here: https://en.wikipedia.org/wiki/Bitwise_operation#OR
   *
   * Formula: `n0 | n1`
   *
   * @param other other Uint64 instance to apply comparation.
   * @returns new `Uint64` instance result of OR operator comparation.
   */
  public or(other: UInt64): UInt64 {
    return new UInt64(...this.map((e, i) => e | other[i]))
  }

  /**
   * Apply XOR operator and return a new `Uint64` result
   *
   * See more about it here: https://en.wikipedia.org/wiki/Bitwise_operation#XOR
   *
   * Formula: `n0 ^ n1`
   *
   * @param other other Uint64 instance to apply comparation.
   * @returns new `Uint64` instance result of XOR operator comparation.
   */
  public xor(other: UInt64): UInt64 {
    return new UInt64(...this.map((e, i) => e ^ other[i]))
  }

  /**
   * Rotate right the current `Uint64` (this) by a number of `bits` and return overflow.
   *
   * See more about it here: https://en.wikipedia.org/wiki/Bitwise_operation#Rotate
   *
   * Formula: `target >> bits`
   *
   * @param bits bits rotations, must be multiple of {@link DIGIT_BITS}, otherwise throws error. Default value = {@link DIGIT_BITS}
   * @returns the carry/overflow value, otherwise 0.
   * @throws Throws error when `bits` is not a multiple of {@link DIGIT_BITS}.
   */
  public rotateRight(bits: number = UInt64.DIGIT_BITS): number {
    let ov = UInt64.zero()
    if (bits % UInt64.DIGIT_BITS !== 0)
      throw new Error(
        "Bit rotations supported with a multiple of digit bits only"
      )
    for (
      let i = 0, j = 0, k = Math.floor(bits / UInt64.DIGIT_BITS);
      i < k;
      i++
    ) {
      for (j = UInt64.DIGITS - 2; j >= 0; j--) {
        ov[j + 1] = ov[j]
      }
      ov[0] = this[0]
      for (j = 0; j < UInt64.DIGITS - 1; j++) {
        this[j] = this[j + 1]
      }
      this[j] = 0
    }
    return ov.toNumber()
  }

  /**
   * Rotate right the `current` `Uint64` by a number of `bits` and return overflow.
   *
   * See more about it here: https://en.wikipedia.org/wiki/Bitwise_operation#Rotate
   *
   * Formula: `target >> bits`
   *
   * @param bits bits rotations, must be less or equals then 64bits, otherwise throws error.
   * @returns the carry/overflow value, otherwise 0 in `Uint64`.
   * @throws Throws error when `bits` is larger then {@link UInt64.DIGITS} * {@link DIGIT_BITS}, so not valid to shift.
   */
  public rotateRightShift = function (bits: number): UInt64 {
    /*  sanity check shifting  */
    if (bits > UInt64.DIGITS * UInt64.DIGIT_BITS) {
      throw new Error("Invalid number of bits to shift")
    }

    //#region temporary buffer zx
    const resultLength = UInt64.DIGITS * 2
    let result = new Array(resultLength)

    let i: number
    for (i = 0; i < UInt64.DIGITS; i++) {
      result[i + UInt64.DIGITS] = this[i]
      result[i] = 0
    }
    //#endregion

    /*  shift bits inside result Buffer  */
    let k1 = Math.floor(bits / UInt64.DIGIT_BITS)
    let k2 = bits % UInt64.DIGIT_BITS
    for (i = k1; i < resultLength - 1; i++) {
      result[i - k1] =
        ((result[i] >>> k2) | (result[i + 1] << (UInt64.DIGIT_BITS - k2))) &
        ((1 << UInt64.DIGIT_BITS) - 1)
    }

    result[resultLength - 1 - k1] =
      (result[resultLength - 1] >>> k2) & ((1 << UInt64.DIGIT_BITS) - 1)
    for (i = resultLength - 1 - k1 + 1; i < resultLength; i++) {
      result[i] = 0
    }

    /*  provide result by splitting `result Buffer` into `current` and return overflow  */
    for (i = 0; i < UInt64.DIGITS; i++) {
      this[i] = result[i + UInt64.DIGITS]
    }

    let ov = result.slice(0, UInt64.DIGITS)
    return new UInt64(
      ...Array.from({ length: UInt64.DIGITS }, (_, i) => ov[i] ?? 0)
    )
  }

  /**
   * Rotate left the `current` `Uint64` by a number of `bits` and return overflow.
   *
   * See more about it here: https://en.wikipedia.org/wiki/Bitwise_operation#Rotate
   *
   * Formula: `target << bits`
   *
   * @param bits bits rotations, must be less or equals then 64bits, otherwise throws error.
   * @returns the carry/overflow value, otherwise 0 in `Uint64`.
   * @throws Throws error when `bits` is larger then {@link UInt64.DIGITS} * {@link DIGIT_BITS}, so not valid to shift.
   */
  public rotateLeftShift(bits: number) {
    /*  sanity check shifting  */
    if (bits > UInt64.DIGITS * UInt64.DIGIT_BITS) {
      throw new Error("Invalid number of bits to shift")
    }

    /*  prepare temporary buffer zx  */
    let zxLength = UInt64.DIGITS + UInt64.DIGITS
    let zx = new Array(zxLength)
    let i: number
    for (i = 0; i < UInt64.DIGITS; i++) {
      zx[i + UInt64.DIGITS] = 0
      zx[i] = this[i]
    }

    /*  shift bits inside zx  */
    let k1 = Math.floor(bits / UInt64.DIGIT_BITS)
    let k2 = bits % UInt64.DIGIT_BITS
    for (i = UInt64.DIGITS - 1 - k1; i > 0; i--) {
      zx[i + k1] =
        ((zx[i] << k2) | (zx[i - 1] >>> (UInt64.DIGIT_BITS - k2))) &
        ((1 << UInt64.DIGIT_BITS) - 1)
    }
    zx[0 + k1] = (zx[0] << k2) & ((1 << UInt64.DIGIT_BITS) - 1)
    for (i = 0 + k1 - 1; i >= 0; i--) {
      zx[i] = 0
    }

    /*  provide result by splitting `result Buffer` into `current` and return overflow  */
    for (i = 0; i < UInt64.DIGITS; i++) {
      this[i] = zx[i]
    }
    let ov = zx.slice(UInt64.DIGITS, UInt64.DIGITS)
    return new UInt64(
      ...Array.from({ length: UInt64.DIGITS }, (_, i) => ov[i] ?? 0)
    )
  }
  //#endregion

  //#region UInt64 Array functions

  /**
   * Performs the specified action for each element in an array.
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (value: number, index: number, array: UInt64) => void,
    thisArg?: any
  ): void {
    thisArg = thisArg ?? this
    for (let i = 0; i < UInt64.DIGITS; i++) {
      callbackfn.call(thisArg, this[i], i, this)
    }
  }

  /**
   * Calls a defined callback function on each element of an array,
   * and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments.
   * The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  map<U>(
    callbackfn: (value: number, index: number, array: UInt64) => U,
    thisArg?: any
  ): U[] {
    thisArg = thisArg ?? this
    let arr: U[] = []
    for (let i = 0; i < UInt64.DIGITS; i++) {
      arr[i] = callbackfn.call(thisArg, this[i], i, this)
    }
    return arr
  }

  /**
   * Calls the specified callback function for all the elements in an array.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments.
   * The reduce method calls the callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation.
   * The first call to the callbackfn function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      accumulatedValue: number,
      currentValue: number,
      currentIndex: number,
      array: UInt64
    ) => number,
    initialValue: number
  ): number {
    let i = 0
    let acc = initialValue ?? this[i++]
    for (; i < UInt64.DIGITS; i++) {
      acc = callbackfn(acc, this[i], i, this)
    }
    return acc
  }

  /**
   * Calls the specified callback function for all the elements in an array, in descending order.
   * The return value of the callback function is the accumulated result,
   * and is provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments.
   * The reduceRight method calls the callbackfn function one time for each element in the array.
   *
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   * the accumulation. The first call to the callbackfn function provides this value as an argument
   * instead of an array value.
   */
  reduceRight(
    callbackfn: (
      accumulatedValue: number,
      currentValue: number,
      currentIndex: number,
      array: UInt64
    ) => number,
    initialValue?: number
  ): number {
    let i = UInt64.DIGITS - 1
    let acc = initialValue ?? this[i--]
    for (; i >= 0; i--) {
      acc = callbackfn(acc, this[i], i, this)
    }
    return acc
  }

  //#endregion

  //#region UInt64 static functions

  /**
   * Require constructor input digits must be exaclty {@link DIGITS} or throws error.
   * @param items constructor input argument
   * @returns input argument if is valid, otherwise throws error
   * @throws Throws error when input length is different of required digits.
   */
  private static requireValidLength(items: number[]): number[] {
    if (items.length != UInt64.DIGITS) {
      throw new Error(`Uint64 must be exactly ${UInt64.DIGITS} only!`)
    }
    return items
  }

  /**
   * Convert between individual digits and to `Uint64` representation
   * @return `UInt64` representation
   */
  public static parseDigits(
    d7: number = 0,
    d6: number = 0,
    d5: number = 0,
    d4: number = 0,
    d3: number = 0,
    d2: number = 0,
    d1: number = 0,
    d0: number = 0
  ): UInt64 {
    return new UInt64(d0, d1, d2, d3, d4, d5, d6, d7)
  }

  /**
   * Convert number to `Uint64` representation.
   * @return UInt64 representation
   */
  public static parse(n: number): UInt64 {
    return new UInt64(
      ...Array.from({ length: UInt64.DIGITS }, (_) => {
        let v = Math.floor(n % UInt64.DIGIT_BASE)
        n /= UInt64.DIGIT_BASE
        return v
      })
    )
  }

  /**
   * The zero represented as an Uint64
   */
  public static zero(): UInt64 {
    return UInt64.parseDigits()
  }

  //#endregion
}
