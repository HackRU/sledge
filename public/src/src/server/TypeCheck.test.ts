import * as tc from "./TypeCheck";

describe("TypeCheck", () => {
  test("isNumber", () => {
    expect(tc.isNumber(5)).toBe(true);
    expect(tc.isNumber(-5)).toBe(true);
    expect(tc.isNumber({})).toBe(false);
    expect(tc.isNumber([])).toBe(false);
  });
});
