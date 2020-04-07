import {GetListParams} from "react-admin";

export interface GetObjectsRequestData {
  table: string,
  params: GetListParams
}

export interface GetObjectsResponseData {
  table: string,
  rows: {
    id: number,
    [field: string]: any
  }[],
  total: number
}
