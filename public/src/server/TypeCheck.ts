export type TypeChecker = (value: any) => boolean;

export const isNumber: TypeChecker = v =>
  typeof v === "number";

export const isString: TypeChecker = v =>
  typeof v === "string";

export const isBoolean: TypeChecker = v =>
  typeof v === "boolean";

export const isInteger: TypeChecker = v =>
  Number.isInteger(v) && Math.abs(v) < Number.MAX_SAFE_INTEGER;

export const isId: TypeChecker = v =>
  Number.isInteger(v) && v < Number.MAX_SAFE_INTEGER && v > 0;

export const isArray: TypeChecker = value =>
  typeof value === "object" && value.constructor === Array;

export const isObject: TypeChecker = v =>
  typeof v === "object";

export function isArrayOf(tc: TypeChecker): TypeChecker {
  return value => {
    if (!isArray(value)) {
      return false;
    }
    for (let i=0;i<value.length;i++) {
      if (!tc(value[i])) {
        return false;
      }
    }
    return true;
  };
}

export function isFixedLengthArrayOf(tc: TypeChecker, length: number): TypeChecker {
  return value => {
    if (!isArray(value) || value.length !== length) {
      return false;
    }
    for (let i=0;i<value.length;i++) {
      if (!tc(value[i])) {
        return false;
      }
    }
    return true;
  };
}

export function hasShape(shape: {[k: string]: TypeChecker}): TypeChecker {
  return value => {
    if (!isObject(value)) {
      return false;
    }

    const keys = Object.keys(shape);
    for (let key of keys) {
      if (!shape[key](value[key])) {
        return false;
      }
    }

    return true;
  };
}

export function oneOf(typeCheckers: Array<TypeChecker>): TypeChecker {
  return value => {
    for (let tc of typeCheckers) {
      if (tc(value)) {
        return true;
      }
    }

    return false;
  };
}

export function isOptional(tc: TypeChecker): TypeChecker {
  return value => {
    if (value === null || value === undefined) {
      return true;
    } else {
      return tc(value);
    }
  };
}

export function isConstant(prim: number | string | boolean): TypeChecker {
  return value => value === prim;
}
