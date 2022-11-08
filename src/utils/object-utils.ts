import { Watson } from "./log"

const isNull = (obj: any): boolean => {
  return obj === null || obj === undefined
}

const isNonNull = (obj: any): boolean => {
  return !isNull(obj)
}

const requireNonNull = (obj: any, message: string = undefined): any => {
  if (isNull(obj)) {
    message =
      !!message && message.length
        ? message
        : "Object can't be null or undefined!"
    Watson.Log.error(message)
    throw new Error(`🐞 ${message}`)
  }
  return obj
}

const requireNonNullOrEmpty = (
  str: string,
  message: string = undefined
): string => {
  if (isNullOrEmpty(str)) {
    message =
      !!message && message.length
        ? message
        : "String can't be null, undefined or empty!"
    Watson.Log.error(message)
    throw new Error(`🐞 ${message}`)
  }
  return str
}

const hasProperty = (obj: any, propName: string | number) => {
  return (
    !!obj &&
    ((!!obj.hasOwnProperty && obj.hasOwnProperty(propName)) ||
      obj[propName] !== undefined)
  )
}

const hasFunction = (obj: any, propName: string | number) => {
  return hasProperty(obj, propName) && isFunction(obj[propName])
}

const isFunction = (obj: any): boolean => {
  return !!(
    obj &&
    (typeof obj === "function" ||
      (obj.constructor && obj.call && obj.apply && !Array.isArray(obj)))
  )
}

const isNotFunction = (obj: any): boolean => {
  return isNonNull(obj) && !isFunction(obj)
}

const isPrimitive = (obj: any): boolean => {
  return obj !== Object(obj)
}

const isNotPrimitive = (obj: any): boolean => {
  return !isPrimitive(obj)
}

const isBoolean = (obj: any): boolean => {
  return typeof obj === "boolean" || obj?.constructor?.name === "Boolean"
}

const isNumber = (obj: any): boolean => {
  return typeof obj === "number" || obj?.constructor?.name === "Number"
}

const isString = (obj: any): boolean => {
  return typeof obj === "string" || obj?.constructor?.name === "String"
}

const isPrimitiveWrapper = (obj: any): boolean => {
  return (
    isNonNull(obj) &&
    (isPrimitive(obj) || isBoolean(obj) || isNumber(obj) || isString(obj))
  )
}

const isNotPrimitiveWrapper = (obj: any): boolean => {
  return !isPrimitiveWrapper(obj)
}

const isNullOrEmpty = (str: string): boolean => {
  return isNull(str) || !str.length
}

const isStringNullOrEmpty = (obj: any): boolean => {
  return isNull(obj) || (isString(obj) && !obj?.length)
}

const isNumberInvalidIndex = (obj: any): boolean => {
  return isNull(obj) || (isNumber(obj) && new Number(obj) < 0)
}

const equals = (obj0: any, obj1: any): boolean => {
  "use strict"
  if (isNull(obj0) || isNull(obj1)) {
    return obj0 === obj1
  } else if (obj0.constructor !== obj1.constructor) {
    return false
  } else if (obj0 instanceof Function || obj0 instanceof RegExp) {
    return obj0 === obj1
  } else if (obj0 === obj1 || obj0.valueOf() === obj1.valueOf()) {
    return true
  } else if (Array.isArray(obj0) && obj0.length !== obj1.length) {
    return false
  } else if (obj0 instanceof Date) {
    //they must had equal valueOf
    return false
  } else if (!(obj0 instanceof Object) || !(obj1 instanceof Object)) {
    return false
  } else {
    const obj0Keys = Object.keys(obj0)
    return (
      Object.keys(obj1).every(function (i) {
        return obj0Keys.indexOf(i) !== -1
      }) &&
      obj0Keys.every(function (i) {
        return equals(obj0[i], obj1[i])
      })
    )
  }
}

export {
  requireNonNull,
  requireNonNullOrEmpty,
  isNull,
  isNonNull,
  isNullOrEmpty,
  isStringNullOrEmpty,
  isNumberInvalidIndex,
  isFunction,
  isNotFunction,
  isPrimitive,
  isPrimitiveWrapper,
  isNotPrimitive,
  isNotPrimitiveWrapper,
  isBoolean,
  isNumber,
  isString,
  hasProperty,
  hasFunction,
  equals,
}
