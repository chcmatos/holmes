import { hasProperty, isString, isNonNull } from "../../utils/object-utils"

/**
 * Compare String Result values
 *
 * ➦  0, values are equals;
 *
 * ➦  1, left compared value is greater then right value
 *
 * ➦ -1, left compared value is lower then right value
 */
type CompareStringResult = 0 | 1 | -1

/**
 * 📏 📐 Match function to {@link MatchRule}
 */
interface MatchFun {
  (obj: any): boolean
}

/**
 * 📏 📐 Match rule handlers
 *
 * Use this class to created an chain sequence of
 * rules to validate a target object.
 *
 * Created by chcmatos <carlos.matos@capgemini.com>, february 16 of 2022.
 *
 * @author Carlos Matos
 */
class MatchRule {
  private readonly handler: MatchFun
  public readonly desc: string
  public readonly toString = (): string => this.desc

  private constructor(handler: MatchFun, desc: string) {
    this.handler = handler || ((e) => false)
    this.desc = desc ?? "not specified"
  }

  /**
   * match rules to target input object
   * @param obj target input
   * @returns true, target input is matching all rules, otherwise false.
   */
  public isMatch(obj: any): boolean {
    return this.handler.call(this, obj)
  }

  /**
   * Combine current rule with other applying condition rule
   * @param rule other match rule
   * @param operationCallback callback operation
   * @returns new match rule combined with current
   */
  private condition(
    rule: MatchRule | MatchFun,
    descCallback: (self: MatchRule, other: MatchRule) => string,
    operationCallback: (self: MatchRule, other: MatchRule, e: any) => boolean
  ): MatchRule {
    if ((<MatchRule>rule).handler) {
      const self = this
      const other = <MatchRule>rule
      const callback = operationCallback
      return new MatchRule(
        (e) => callback(self, other, e),
        descCallback(self, other)
      )
    } else {
      return this.condition(
        new MatchRule(<MatchFun>rule, ""),
        descCallback,
        operationCallback
      )
    }
  }

  /**
   * Combine current rule with other applying operator AND
   * @param rule other match rule
   * @returns new match rule combined with current.
   */
  public and(rule: MatchRule | MatchFun): MatchRule {
    return this.condition(
      rule,
      (self, other) => `${self} and ${other}`,
      (self, other, e) =>
        self.handler.call(this, e) && other.handler.call(this, e)
    )
  }

  /**
   * Combine current rule with other applying operator OR
   * @param rule other match rule
   * @returns new match rule combined with current.
   */
  public or(rule: MatchRule | MatchFun): MatchRule {
    return this.condition(
      rule,
      (self, other) => `${self} or ${other}`,
      (self, other, e) =>
        self.handler.call(this, e) || other.handler.call(this, e)
    )
  }

  /**
   * Combine current rule with other applying operator XOR
   * @param rule other match rule
   * @returns new match rule combined with current.
   */
  public xor(rule: MatchRule | MatchFun): MatchRule {
    return this.condition(
      rule,
      (self, other) => `${self}, different of, ${other}`,
      (self, other, e) =>
        !!(
          (self.handler.call(this, e) ? 1 : 0) ^
          (other.handler.call(this, e) ? 1 : 0)
        )
    )
  }

  /**
   * Create a new match rule
   * @param fun  match callback function
   * @param desc match function description
   * @returns new match rule
   */
  static rule(fun: MatchFun, desc: string): MatchRule {
    return new MatchRule(fun, desc)
  }

  /**
   * Create a match rule to check if target is null.
   * @returns null target match rule.
   */
  static isNull(): MatchRule {
    return MatchRule.rule((e) => e === null || e === undefined, "is null")
  }

  /**
   * Create a match rule to check if target is not null.
   * @returns not null target match rule.
   */
  static isNotNull(): MatchRule {
    return MatchRule.rule((e) => e !== null && e !== undefined, "is not null")
  }

  /**
   * Create a match rule to check if target and input argument are equals.
   * @param obj input object to compare with target
   * @returns equals match rule
   */
  static equals(obj: any): MatchRule {
    const other = obj
    return MatchRule.rule((e) => e === other, `equals to ${other}`)
  }

  /**
   * Create a match rule to check if target and input argument are no equals.
   * @param obj input object to compare with target
   * @returns not equals match rule
   */
  static notEquals(obj: any): MatchRule {
    const other = obj
    return MatchRule.rule((e) => e !== other, `not equals to ${other}`)
  }

  /**
   * Compare strings with sensitivity type.
   * @param comp string to be compared with target matching value.
   * @param sensitivity sensitivity types (default value `base`) ![sensitive types](https://i.stack.imgur.com/tTMud.png).
   * @param result 0 = values are equals; -1 = matching value is greater; 1 = input comp argument is greater.
   */
  static compareString(
    comp: string,
    sensitivity: string = "base",
    result: CompareStringResult = 0
  ): MatchRule {
    return MatchRule.rule(
      (e) =>
        comp == e ||
        (!!comp &&
          comp.localeCompare(e, undefined, { sensitivity }) === result),
      result == 0
        ? `compare as ${sensitivity} text and must be equals to "${comp}"`
        : result == -1
        ? `compare as ${sensitivity} text and must be greater then "${comp}"`
        : `compare as ${sensitivity} text and must be lower then "${comp}"`
    )
  }

  /**
   * Create a match rule to check if target and input string are equals.
   * @param comp input string
   * @param sensitivity sensistivity type ![sensitive types](https://i.stack.imgur.com/tTMud.png).
   * @returns string equals match rule.
   */
  static stringEquals(comp: string, sensitivity: string = "base"): MatchRule {
    return MatchRule.rule(
      (e) =>
        comp == e ||
        (!!comp && comp.localeCompare(e, undefined, { sensitivity }) === 0),
      `as text is equals to ${comp} (sensitivity mode as "${sensitivity}")`
    )
  }

  /**
   * Create a match rule to check if target and input string are not equals.
   * @param comp input string
   * @param sensitivity sensistivity type (default value `base`) ![sensitive types](https://i.stack.imgur.com/tTMud.png).
   * @returns string not equals match rule.
   */
  static stringNotEquals(
    comp: string,
    sensitivity: string = "base"
  ): MatchRule {
    return MatchRule.rule(
      (e) => !!comp && comp.localeCompare(e, undefined, { sensitivity }) !== 0,
      `string not equals to ${comp} (ignoring case)`
    )
  }

  /**
   * Create a match rule to check if target object contains input property by name
   * @param propName property name
   * @returns contains property by name match rule
   */
  static containsProperty(propName: string | number): MatchRule {
    return MatchRule.rule(
      (e) => hasProperty(e, propName),
      `contains property named "${propName}"`
    )
  }

  /**
   * Create a match rule to check if target object contains any input properties by name
   * @param propNames properties name values
   * @returns contains property by name match rule
   * @throws Throws error if propNames is not set or empty.
   */
  static containsAnyProperty(...propNames: (string | number)[]): MatchRule {
    if (propNames.length == 0) {
      throw new Error("Property names is required!")
    }
    return propNames
      .slice(1)
      .reduce(
        (acc, curr) => acc.or(MatchRule.containsProperty(curr)),
        MatchRule.containsProperty(propNames[0])
      )
  }

  /**
   * Create a match rule to check if target object contains all input properties by name
   * @param propNames properties name values
   * @returns contains property by name match rule
   * @throws Throws error if propNames is not set or empty.
   */
  static containsAllProperty(...propNames: (string | number)[]): MatchRule {
    if (propNames.length == 0) {
      throw new Error("Property names is required!")
    }
    return propNames
      .slice(1)
      .reduce(
        (acc, curr) => acc.and(MatchRule.containsProperty(curr)),
        MatchRule.containsProperty(propNames[0])
      )
  }

  /**
   * Create a match rule to check if target object contains the property and
   * this property contains the input value.
   * @param propName property name
   * @param propValue property value
   * @returns contains property name and value match rule
   */
  static containsPropertyValue(
    propName: string | number,
    propValue: any
  ): MatchRule {
    return MatchRule.containsProperty(propName).and(
      MatchRule.rule(
        (e) => e[propName] == propValue,
        `${propName} value is "${propValue}"`
      )
    )
  }

  /**
   * Create a match rule to check if target object's property contains some of input values
   * @param propName property name
   * @param propValues property candidate values
   * @returns contains property by name match rule
   * @throws Throws error if propValues is not set or empty.
   */
  static containsPropertySomeValue(
    propName: string | number,
    ...propValues: any[]
  ): MatchRule {
    if (propValues.length == 0) {
      throw new Error("Property values is required!")
    }
    return propValues
      .slice(1)
      .reduce(
        (acc, curr) => acc.or(MatchRule.containsPropertyValue(propName, curr)),
        MatchRule.containsPropertyValue(propName, propValues[0])
      )
  }

  /**
   * Create a match rule to check if target object contains the property and
   * this property contains the string input value.
   * @param propName property name
   * @param propValue property value
   * @param sensitivity sensistivity type (default value `base`) ![sensitive types](https://i.stack.imgur.com/tTMud.png).
   * @returns contains property name and value match rule
   */
  static containsPropertyValueString(
    propName: string | number,
    propValue: string,
    sensitivity: string = "base"
  ): MatchRule {
    return MatchRule.containsProperty(propName).and(
      MatchRule.rule(
        (e) =>
          MatchRule.isNotNull()
            .and(MatchRule.stringEquals(propValue, sensitivity))
            .isMatch(e[propName]),
        `Property "${propName}" value as text is equals to "${propValue}" (sensitivity mode as ${sensitivity})`
      )
    )
  }

  /**
   * Create a match rule to check if target object's property contains some of input string values
   * @param propName property name
   * @param propValues property candidate values
   * @param sensitivity sensistivity type (default value `base`) ![sensitive types](https://i.stack.imgur.com/tTMud.png).
   * @returns contains property by name match rule
   * @throws Throws error if propValues is not set or empty.
   */
  static constainsPropertySomeValueString(
    propName: string | number,
    propValues: string[],
    sensitivity: string = "base"
  ): MatchRule {
    if (propValues.length == 0) {
      throw new Error("Property values is required!")
    }
    return propValues
      .slice(1)
      .reduce(
        (acc, curr) =>
          acc.or(
            MatchRule.containsPropertyValueString(propName, curr, sensitivity)
          ),
        MatchRule.containsPropertyValueString(
          propName,
          propValues[0],
          sensitivity
        )
      )
  }

  /**
   * Create a match rule to check if target object is of type of input argument.
   * @param typeName type name
   * @returns typeof match rule
   */
  static typeOf(typeName: string): MatchRule {
    return MatchRule.rule(
      (e) => typeof e === typeName,
      `type of equals ${typeName}`
    )
  }

  /**
   * Create a match rule to check if target object property is of type of input argument.
   * @param propName property name
   * @param typeName property type
   * @returns property type of match rule
   */
  static typeOfProperty(
    propName: string | number,
    typeName: string
  ): MatchRule {
    return MatchRule.containsProperty(propName).and(
      MatchRule.rule(
        (e) => typeof e[propName] === typeName,
        `${propName} is of type "${typeName}"`
      )
    )
  }

  /**
   * Create a constructor match rule to check if target object is of same constructor.
   * @param constrName constructor name
   * @returns constructor match rule.
   */
  static constructorName(constrName: string): MatchRule {
    return MatchRule.containsProperty("constructor").and(
      MatchRule.rule(
        (e) => !!constrName && e["constructor"]["name"] == constrName,
        `constructor name equals "${constrName}"`
      )
    )
  }

  /**
   * Create a constructor match rule to check if target object is some HTMLElement
   * and contains tagName.
   * @param tagName target tag name.
   */
  static tagName(tagName: string): MatchRule {
    return MatchRule.containsProperty("tagName").and(
      MatchRule.rule(
        (e) => !!tagName && e.tagName.toUpperCase() == tagName.toUpperCase(),
        `Tag name equals "${tagName}"`
      )
    )
  }

  /**
   * Create a match rule to check if target object's property value is matching to regexp.
   *
   * If property value is not a string type, then will be used toString to use by regexp.
   *
   * @param propName target property name
   * @param regexp regular expression
   */
  static matchPattern(propName: string, regexp: string | RegExp): MatchRule {
    return MatchRule.containsProperty(propName).and(
      MatchRule.rule((e) => {
        let value = e[propName]
        if (isNonNull(value)) {
          let strValue: string = isString(value)
            ? <string>value
            : value.toString()
          let match: RegExpMatchArray | null = strValue.match(regexp)
          return !!match && !!match.length
        }
        return false
      }, `value of property "${propName}" as "string" is matching to expression "${regexp}"`)
    )
  }
}

export { MatchRule, MatchFun }
