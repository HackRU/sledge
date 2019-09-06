export interface AssignPrizeToJudgeRequestData {
  judgeId: number;
  prizeId: number;
}

export function checkAssignPrizeToJudgeRequestData(data: any): boolean {
  return (
    typeof data === "object" &&
      Number.isInteger(data["judgeId"]) &&
      data["judgeId"] > 0 &&
      Number.isInteger(data["prizeId"]) &&
      data["prizeId"] > 0
  );
}
