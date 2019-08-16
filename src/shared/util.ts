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
