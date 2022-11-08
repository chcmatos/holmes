import DNPath from "../../utils/dn-path"
import Uuid from "../../utils/uuid"

/**
 * Generate an `ID` (Unique Identifier) for `Target` object used
 * to resolve the `Match-Rule`.
 *
 * This `ID` is based at `ns:X500` pattern.
 *
 * see more about it here https://docs.oracle.com/javase/jndi/tutorial/ldap/models/x500.html
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, march 23 of 2022.
 *
 * @author Carlos Matos
 */
export default class MatchTargetId {
  private dnPath: DNPath

  constructor(target: any) {
    this.dnPath = DNPath.resolve(target)
  }

  public toJSON() {
    return this.toString()
  }

  public toString() {
    return Uuid.v5(
      "ns:X500",
      this.dnPath.asActiveDirectory().toString()
    ).format()
  }
}
