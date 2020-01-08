export function catchOnly<A>(errType: string, f: () => A): A | Error {
  let result: A;
  try {
    result = f();
  } catch (e) {
    if (e.name === errType) {
      return e;
    } else {
      throw e;
    }
  }
  return result;
}

export function range(to: number): Array<number> {
  let result = [];
  for (let i=0;i<to;i++) {
    result.push(i);
  }
  return result;
}

export function isArray(data: any) {
  return (
    typeof data === "object" && data.constructor === Array
  );
}

/**
 * Calculates a number modulo another number. Modulus must be postive.[A
 *
 * This is necessary because Javascript's "%" operator doesn't perform the modulo correctly if num<0.
 */
export function modulo(num: number, modulus: number) {
  if (modulus <= 0) {
    throw new Error("modulus must be positive");
  } else if (modulus === Number.POSITIVE_INFINITY) {
    return Number.isFinite(num) ? num : Number.NaN;
  } else {
    return ((num % modulus) + modulus) % modulus;
  }
}

export function createIdMap<A extends {id: number}>(objs: A[]): Map<number, A> {
  return new Map<number, A>(
    objs.map(obj => [obj.id, obj])
  );
}

export type SuccErr =
  { success: true, error?: string } |
  { success: false, error: string };
