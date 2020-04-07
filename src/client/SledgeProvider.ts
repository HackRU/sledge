import {DataProvider, GetListParams, GetOneParams, GetListResult, GetOneResult, GetManyParams, GetManyResult} from "react-admin";
import { Socket } from "./Socket";
import { GetObjectsResponseData } from "../shared/GetObjectsRequestTypes";

export class SledgeProvider implements DataProvider {
  constructor(private socket: Socket) {}

  getList(resource: string, params: GetListParams): Promise<GetListResult> {
    return this.socket.sendRequest({
      requestName: "REQUEST_GET_OBJECTS",
      table: resource,
      params: params
    }).then((res: GetObjectsResponseData) => Promise.resolve({
      data: res.rows,
      total: res.total
    }));
  }

  getOne(resource: string, params: GetOneParams): Promise<GetOneResult> {
    throw new Error("NYI");
  }

  getMany(resource: string, params: GetManyParams): Promise<GetManyResult> {
    throw new Error("NYI");
  }

  getManyReference(resource: string, params: any): any {
    throw new Error("NYI");
  }

  update(resource: string, params: any): any {
    throw new Error("NYI");
  }

  updateMany(resource: string, params: any): any {
    throw new Error("nyi");
  }

  create(resource: string, params: any): any {
    throw new Error("NYI");
  }

  delete(resource: string, params: any): any {
    throw new Error("Operation Not Supported");
  }

  deleteMany(resource: string, params: any): any {
    throw new Error("Operation Not Supported");
  }
}
