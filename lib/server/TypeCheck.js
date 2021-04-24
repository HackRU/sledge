"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConstant = exports.isOptional = exports.oneOf = exports.hasShape = exports.isFixedLengthArrayOf = exports.isArrayOf = exports.isObject = exports.isArray = exports.isId = exports.isInteger = exports.isBoolean = exports.isString = exports.isNumber = void 0;
exports.isNumber = v => typeof v === "number";
exports.isString = v => typeof v === "string";
exports.isBoolean = v => typeof v === "boolean";
exports.isInteger = v => Number.isInteger(v) && Math.abs(v) < Number.MAX_SAFE_INTEGER;
exports.isId = v => Number.isInteger(v) && v < Number.MAX_SAFE_INTEGER && v > 0;
exports.isArray = value => typeof value === "object" && value.constructor === Array;
exports.isObject = v => typeof v === "object";
function isArrayOf(tc) {
    return value => {
        if (!exports.isArray(value)) {
            return false;
        }
        for (let i = 0; i < value.length; i++) {
            if (!tc(value[i])) {
                return false;
            }
        }
        return true;
    };
}
exports.isArrayOf = isArrayOf;
function isFixedLengthArrayOf(tc, length) {
    return value => {
        if (!exports.isArray(value) || value.length !== length) {
            return false;
        }
        for (let i = 0; i < value.length; i++) {
            if (!tc(value[i])) {
                return false;
            }
        }
        return true;
    };
}
exports.isFixedLengthArrayOf = isFixedLengthArrayOf;
function hasShape(shape) {
    return value => {
        if (!exports.isObject(value)) {
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
exports.hasShape = hasShape;
function oneOf(typeCheckers) {
    return value => {
        for (let tc of typeCheckers) {
            if (tc(value)) {
                return true;
            }
        }
        return false;
    };
}
exports.oneOf = oneOf;
function isOptional(tc) {
    return value => {
        if (value === null || value === undefined) {
            return true;
        }
        else {
            return tc(value);
        }
    };
}
exports.isOptional = isOptional;
function isConstant(prim) {
    return value => value === prim;
}
exports.isConstant = isConstant;
//# sourceMappingURL=TypeCheck.js.map