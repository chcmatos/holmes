import DNPath from "./dn-path"
import Uuid, { UuidKeyAccess, UuidVersion } from "./uuid"

/**
 *
 * An object that represents an `Uuid` (v5) by namespace `ns:X500` based
 * the `DNPath` on `target properties`.
 *
 * see more about it here https://docs.oracle.com/javase/jndi/tutorial/ldap/models/x500.html
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, march 23 of 2022.
 *
 * @see Uuid
 * @see DNPath
 */
export default class UuidX500 extends Uuid {
  constructor(target: any) {
    super(5)
    let dnPath: DNPath = DNPath.resolve(target ?? "null")
    let uuidV5 = Uuid.v5("ns:X500", dnPath.asActiveDirectory().toString())
    this.copy(uuidV5)
  }

  protected init(_: UuidKeyAccess): void {}

  public static newUuid(target: any): UuidX500 {
    return new UuidX500(target)
  }
}
