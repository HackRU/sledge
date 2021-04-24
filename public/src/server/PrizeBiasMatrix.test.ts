import { calcJudgePrizeMatrix } from "./PrizeBiasMatrix";

describe("PrizeBiasMatrix", () =>{
  test("calcJudgePrizeMatrix assigns every prize of there are only 2 judges", () =>{
    let t = true;
    let f = false;
    expect(calcJudgePrizeMatrix(
      2, 5, 5, [
        [t, f, f, f, f],
        [f, t, f, f, f],
        [f, f, t, f, f],
        [f, f, f, t, f],
        [f, f, f, f, t]
      ]
    )).toEqual([
      [t, t, t, t, t],
      [t, t, t, t, t]
    ]);
    expect(calcJudgePrizeMatrix(
      2, 5, 5, [
        [f, f, f, f, f],
        [f, f, f, f, f],
        [f, f, f, f, f],
        [f, f, f, f, f],
        [f, f, f, f, f]
      ]
    )).toEqual([
      [t, t, t, t, t],
      [t, t, t, t, t]
    ]);
    expect(calcJudgePrizeMatrix(
      2, 5, 5, [
        [t, t, t, t, t],
        [t, t, t, t, t],
        [t, t, t, t, t],
        [t, t, t, t, t],
        [t, t, t, t, t]
      ]
    )).toEqual([
      [t, t, t, t, t],
      [t, t, t, t, t]
    ]);
  });
});
