export interface GetJudgesRequestData {
  requestName: "REQUEST_GET_JUDGES";
}

export interface GetJudgesResponseData {
  judges: Array<{id: number, name: string}>;
}
