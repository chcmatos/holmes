//#region UI32 functionalities for the MD5 and SHA1 digests
class UI32 {
  /**
   * Safely add two integers (with wrapping at 2^32)
   */
  static add(x: number, y: number) {
    let lsw = (x & 0xffff) + (y & 0xffff)
    let msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  /**
   * Bitwise rotate 32-bit number to the left
   */
  static rotateLeft(num: number, bits: number) {
    return ((num << bits) & 0xffffffff) | ((num >>> (32 - bits)) & 0xffffffff)
  }
}
//#endregion

//#region Big/Little Endian Converter

type EndianBits = 8 | 16 | 32

/**
 * Big/Little Endian Convertion options
 */
type BigLittleEndianOption = {
  ibits?: EndianBits
  obits?: EndianBits
  ibigendian?: boolean
  obigendian?: boolean
}

/**
 * Provides a conversions between `8/16/32-bit` character strings
 * and `8/16/32-bit` big/little-endian word arrays
 */
class BigLittleEndianConverter {
  static stringToArray(
    str: string,
    options: BigLittleEndianOption = {
      ibits: 8,
      obits: 8,
      obigendian: true,
      ibigendian: false,
    }
  ): number[] {
    /*  determine options  */
    options.ibits = options.ibits ?? 8
    options.obits = options.obits ?? 8
    options.obigendian = options.obigendian ?? true
    options.ibigendian = options.ibigendian ?? false

    let arr: number[] = []
    let index: number = 0
    let c: number, charAt: number
    let ck: number = 0
    let w: number
    let wk: number = 0
    const strLength: number = str.length
    const bits = 8

    while (true) {
      /*  fetch next octet from string  */
      if (ck === 0) {
        charAt = str.charCodeAt(index++)
      }
      c = (charAt >> (options.ibits - (ck + bits))) & 0xff
      ck = (ck + bits) % options.ibits

      /*  place next word into array  */
      if (options.obigendian) {
        if (wk === 0) {
          w = c << (options.obits - bits)
        } else {
          w |= c << (options.obits - bits - wk)
        }
      } else {
        if (wk === 0) {
          w = c
        } else {
          w |= c << wk
        }
      }
      wk = (wk + bits) % options.obits
      if (wk === 0) {
        arr.push(w)
        if (index >= strLength) {
          break
        }
      }
    }
    return arr
  }

  static arrayToString(
    arr: number[],
    options: BigLittleEndianOption = {}
  ): string {
    let str: string[] = []
    /*  determine options  */
    options.ibits = options.ibits ?? 32
    options.obits = options.obits ?? 8
    options.ibigendian = options.ibigendian ?? true
    options.obigendian = options.obigendian ?? true

    let imask = 0xffffffff
    if (options.ibits < 32) {
      imask = (1 << options.ibits) - 1
    }

    const bits = 8
    for (let i = 0, l = arr.length; i < l; i++) {
      //fetch next word from array
      let w = arr[i] & imask
      //place next octet into string
      for (let j = 0; j < options.ibits; j += bits) {
        if (options.ibigendian) {
          str.push(
            String.fromCharCode((w >> (options.ibits - bits - j)) & 0xff)
          )
        } else {
          str.push(String.fromCharCode((w >> j) & 0xff))
        }
      }
    }

    return str.join("")
  }
}
//#endregion

//#region Hashing
export type HashingType = "MD5" | "SHA-1"

/**
 * `UUID Hashing` algorithms (`MD5` or `SHA-1`).
 *
 * A hash function takes an input as a key, which is associated with a datum or record and used to identify it to the data storage and retrieval application.
 * The keys may be fixed length, like an integer, or variable length, like a name.
 *
 * In some cases, the key is the datum itself.
 *
 * The output is a hash code used to index a hash table holding the data or records, or pointers to them.
 *
 * Usage sample:
 *
 * `Hashing.get(Hashing.SHA1).hash('test')`
 *
 * `Hashing.get(Hashing.MD5).hash('test')`
 *
 * see more about hash function here https://en.wikipedia.org/wiki/Hash_function
 *
 */
export default abstract class Hashing {
  //#region factory
  public static readonly MD5: HashingType = "MD5"
  public static readonly SHA1: HashingType = "SHA-1"

  /**
   * Create an instance of Hashing algorithm by type.
   * @param type hashing algorithm type ({@link MD5}, {@link SHA1}).
   * @returns instance of hashing.
   */
  public static get(type: HashingType): Hashing {
    switch (type) {
      case Hashing.MD5:
        return new HashingImplMD5()
      case Hashing.SHA1:
        return new HashingImplSHA1()
      default:
        throw new Error(`Hashing algorithm ${type} not implemented yet!`)
    }
  }
  //#endregion

  /**
   * Hash result as Uuid Octets.
   *
   * Calculate the Hashing Algorithm of an array of [little/big]-endian words, and a bit length
   *
   * @param input string to be hashed
   * @returns hashed value
   */
  public abstract hash(input: string): string

  /**
   * Hash result as Uuid Octets.
   *
   * Calculate the Hashing Algorithm of an array of [little/big]-endian words, and a bit length
   *
   * @param input object to be hashed
   * @returns hashed value
   */
  public hashData(input: any): string {
    return this.hash(!!input ? JSON.stringify(input) : "null")
  }
}

/**
 * Hashing implementation using `MD5` algorithm
 *
 * see more about here https://en.wikipedia.org/wiki/MD5
 *
 * @see Hashing
 */
class HashingImplMD5 extends Hashing {
  //#region basic operations the algorithm uses
  private md5_cmn(
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number
  ) {
    return UI32.add(
      UI32.rotateLeft(UI32.add(UI32.add(a, q), UI32.add(x, t)), s),
      b
    )
  }

  private md5FF(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return this.md5_cmn((b & c) | (~b & d), a, b, x, s, t)
  }

  private md5GG(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return this.md5_cmn((b & d) | (c & ~d), a, b, x, s, t)
  }

  private md5HH(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return this.md5_cmn(b ^ c ^ d, a, b, x, s, t)
  }

  private md5II(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    return this.md5_cmn(c ^ (b | ~d), a, b, x, s, t)
  }
  //#endregion

  /**
   * calculate the MD5 of an array of little-endian words, and a bit length
   */
  private md5Hash(hash: number[], length: number): number[] {
    /*  append padding  */
    hash[length >> 5] |= 0x80 << length % 32
    hash[(((length + 64) >>> 9) << 4) + 14] = length

    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    for (let i = 0; i < hash.length; i += 16) {
      let olda: number = a
      let oldb: number = b
      let oldc: number = c
      let oldd: number = d

      a = this.md5FF(a, b, c, d, hash[i + 0], 7, -680876936)
      d = this.md5FF(d, a, b, c, hash[i + 1], 12, -389564586)
      c = this.md5FF(c, d, a, b, hash[i + 2], 17, 606105819)
      b = this.md5FF(b, c, d, a, hash[i + 3], 22, -1044525330)
      a = this.md5FF(a, b, c, d, hash[i + 4], 7, -176418897)
      d = this.md5FF(d, a, b, c, hash[i + 5], 12, 1200080426)
      c = this.md5FF(c, d, a, b, hash[i + 6], 17, -1473231341)
      b = this.md5FF(b, c, d, a, hash[i + 7], 22, -45705983)
      a = this.md5FF(a, b, c, d, hash[i + 8], 7, 1770035416)
      d = this.md5FF(d, a, b, c, hash[i + 9], 12, -1958414417)
      c = this.md5FF(c, d, a, b, hash[i + 10], 17, -42063)
      b = this.md5FF(b, c, d, a, hash[i + 11], 22, -1990404162)
      a = this.md5FF(a, b, c, d, hash[i + 12], 7, 1804603682)
      d = this.md5FF(d, a, b, c, hash[i + 13], 12, -40341101)
      c = this.md5FF(c, d, a, b, hash[i + 14], 17, -1502002290)
      b = this.md5FF(b, c, d, a, hash[i + 15], 22, 1236535329)

      a = this.md5GG(a, b, c, d, hash[i + 1], 5, -165796510)
      d = this.md5GG(d, a, b, c, hash[i + 6], 9, -1069501632)
      c = this.md5GG(c, d, a, b, hash[i + 11], 14, 643717713)
      b = this.md5GG(b, c, d, a, hash[i + 0], 20, -373897302)
      a = this.md5GG(a, b, c, d, hash[i + 5], 5, -701558691)
      d = this.md5GG(d, a, b, c, hash[i + 10], 9, 38016083)
      c = this.md5GG(c, d, a, b, hash[i + 15], 14, -660478335)
      b = this.md5GG(b, c, d, a, hash[i + 4], 20, -405537848)
      a = this.md5GG(a, b, c, d, hash[i + 9], 5, 568446438)
      d = this.md5GG(d, a, b, c, hash[i + 14], 9, -1019803690)
      c = this.md5GG(c, d, a, b, hash[i + 3], 14, -187363961)
      b = this.md5GG(b, c, d, a, hash[i + 8], 20, 1163531501)
      a = this.md5GG(a, b, c, d, hash[i + 13], 5, -1444681467)
      d = this.md5GG(d, a, b, c, hash[i + 2], 9, -51403784)
      c = this.md5GG(c, d, a, b, hash[i + 7], 14, 1735328473)
      b = this.md5GG(b, c, d, a, hash[i + 12], 20, -1926607734)

      a = this.md5HH(a, b, c, d, hash[i + 5], 4, -378558)
      d = this.md5HH(d, a, b, c, hash[i + 8], 11, -2022574463)
      c = this.md5HH(c, d, a, b, hash[i + 11], 16, 1839030562)
      b = this.md5HH(b, c, d, a, hash[i + 14], 23, -35309556)
      a = this.md5HH(a, b, c, d, hash[i + 1], 4, -1530992060)
      d = this.md5HH(d, a, b, c, hash[i + 4], 11, 1272893353)
      c = this.md5HH(c, d, a, b, hash[i + 7], 16, -155497632)
      b = this.md5HH(b, c, d, a, hash[i + 10], 23, -1094730640)
      a = this.md5HH(a, b, c, d, hash[i + 13], 4, 681279174)
      d = this.md5HH(d, a, b, c, hash[i + 0], 11, -358537222)
      c = this.md5HH(c, d, a, b, hash[i + 3], 16, -722521979)
      b = this.md5HH(b, c, d, a, hash[i + 6], 23, 76029189)
      a = this.md5HH(a, b, c, d, hash[i + 9], 4, -640364487)
      d = this.md5HH(d, a, b, c, hash[i + 12], 11, -421815835)
      c = this.md5HH(c, d, a, b, hash[i + 15], 16, 530742520)
      b = this.md5HH(b, c, d, a, hash[i + 2], 23, -995338651)

      a = this.md5II(a, b, c, d, hash[i + 0], 6, -198630844)
      d = this.md5II(d, a, b, c, hash[i + 7], 10, 1126891415)
      c = this.md5II(c, d, a, b, hash[i + 14], 15, -1416354905)
      b = this.md5II(b, c, d, a, hash[i + 5], 21, -57434055)
      a = this.md5II(a, b, c, d, hash[i + 12], 6, 1700485571)
      d = this.md5II(d, a, b, c, hash[i + 3], 10, -1894986606)
      c = this.md5II(c, d, a, b, hash[i + 10], 15, -1051523)
      b = this.md5II(b, c, d, a, hash[i + 1], 21, -2054922799)
      a = this.md5II(a, b, c, d, hash[i + 8], 6, 1873313359)
      d = this.md5II(d, a, b, c, hash[i + 15], 10, -30611744)
      c = this.md5II(c, d, a, b, hash[i + 6], 15, -1560198380)
      b = this.md5II(b, c, d, a, hash[i + 13], 21, 1309151649)
      a = this.md5II(a, b, c, d, hash[i + 4], 6, -145523070)
      d = this.md5II(d, a, b, c, hash[i + 11], 10, -1120210379)
      c = this.md5II(c, d, a, b, hash[i + 2], 15, 718787259)
      b = this.md5II(b, c, d, a, hash[i + 9], 21, -343485551)

      a = UI32.add(a, olda)
      b = UI32.add(b, oldb)
      c = UI32.add(c, oldc)
      d = UI32.add(d, oldd)
    }
    return [a, b, c, d]
  }

  public hash(input: string): string {
    return BigLittleEndianConverter.arrayToString(
      this.md5Hash(
        BigLittleEndianConverter.stringToArray(input, {
          ibits: 8,
          obits: 32,
          ibigendian: false,
          obigendian: false,
        }),
        input.length * 8
      ),
      { ibits: 32, ibigendian: false }
    )
  }
}

/**
 * Hashing implementation using `SHA-1` algorithm
 *
 * see more about here https://en.wikipedia.org/wiki/SHA-1
 *
 * @see Hashing
 */
class HashingImplSHA1 extends Hashing {
  //#region basic operations the algorithm uses
  /**
   * Perform the appropriate triplet combination function for the current iteration
   */
  sha1FT(t: number, b: number, c: number, d: number) {
    if (t < 20) {
      return (b & c) | (~b & d)
    } else if (t < 40) {
      return b ^ c ^ d
    } else if (t < 60) {
      return (b & c) | (b & d) | (c & d)
    } else {
      return b ^ c ^ d
    }
  }

  /**
   * Determine the appropriate additive constant for the current iteration
   */
  sha1KT(t: number) {
    if (t < 20) {
      return 1518500249
    } else if (t < 40) {
      return 1859775393
    } else if (t < 60) {
      return -1894007588
    } else {
      return -899497514
    }
  }
  //#endregion

  /**
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  sha1Hash(arr: number[], length: number) {
    /*  append padding  */
    arr[length >> 5] |= 0x80 << (24 - (length % 32))
    arr[(((length + 64) >> 9) << 4) + 15] = length

    let w = Array(80)
    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878
    let e = -1009589776

    for (let i = 0; i < arr.length; i += 16) {
      let olda = a
      let oldb = b
      let oldc = c
      let oldd = d
      let olde = e
      for (let j = 0; j < 80; j++) {
        if (j < 16) {
          w[j] = arr[i + j]
        } else {
          w[j] = UI32.rotateLeft(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1)
        }
        let t = UI32.add(
          UI32.add(UI32.rotateLeft(a, 5), this.sha1FT(j, b, c, d)),
          UI32.add(UI32.add(e, w[j]), this.sha1KT(j))
        )
        e = d
        d = c
        c = UI32.rotateLeft(b, 30)
        b = a
        a = t
      }
      a = UI32.add(a, olda)
      b = UI32.add(b, oldb)
      c = UI32.add(c, oldc)
      d = UI32.add(d, oldd)
      e = UI32.add(e, olde)
    }
    return [a, b, c, d, e]
  }

  /**
   * Calculate the SHA-1 of an octet string
   */
  public hash(input: string): string {
    return BigLittleEndianConverter.arrayToString(
      this.sha1Hash(
        BigLittleEndianConverter.stringToArray(input, {
          ibits: 8,
          obits: 32,
          obigendian: true,
        }),
        input.length * 8
      ),
      { ibits: 32, ibigendian: true }
    )
  }
}
//#endregion
