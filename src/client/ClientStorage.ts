export class ClientStorage {
  judgeId: number;

  constructor() {
    this.loadJudgeId();
  }

  loadJudgeId() {
    this.judgeId = parseJudgeId(localStorage["judgeId"]);
  }

  getJudgeId() {
    return this.judgeId;
  }
}

function parseJudgeId(stored: string) {
  const parsed = parseInt(stored);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0;
  } else {
    return parsed;
  }
}
