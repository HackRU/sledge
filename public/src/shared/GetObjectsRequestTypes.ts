export interface GetObjectsRequestData {
  table: string
}

export interface GetObjectsResponseData {
  table: string,
  rows: {
    id: number,
    [field: string]: any
  }[]
}
