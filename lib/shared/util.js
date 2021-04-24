"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdMap = exports.modulo = exports.isArray = exports.range = exports.catchOnly = void 0;
function catchOnly(errType, f) {
    let result;
    try {
        result = f();
    }
    catch (e) {
        if (e.name === errType) {
            return e;
        }
        else {
            throw e;
        }
    }
    return result;
}
exports.catchOnly = catchOnly;
function range(to) {
    let result = [];
    for (let i = 0; i < to; i++) {
        result.push(i);
    }
    return result;
}
exports.range = range;
function isArray(data) {
    return (typeof data === "object" && data.constructor === Array);
}
exports.isArray = isArray;
/**
 * Calculates a number modulo another number. Modulus must be postive.[A
 *
 * This is necessary because Javascript's "%" operator doesn't perform the modulo correctly if num<0.
 */
function modulo(num, modulus) {
    if (modulus <= 0) {
        throw new Error("modulus must be positive");
    }
    else if (modulus === Number.POSITIVE_INFINITY) {
        return Number.isFinite(num) ? num : Number.NaN;
    }
    else {
        return ((num % modulus) + modulus) % modulus;
    }
}
exports.modulo = modulo;
function createIdMap(objs) {
    return new Map(objs.map(obj => [obj.id, obj]));
}
exports.createIdMap = createIdMap;
//# sourceMappingURL=util.js.map