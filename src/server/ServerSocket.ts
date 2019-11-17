import {SocketAttacher} from "./SocketAttacher";

export class ServerSocket {
  requestHandler?: RequestHandler;

  constructor(private socketAttacher: SocketAttacher) {
    socketAttacher.setRequestHandler((data: object, client: string) => this.handleRequest(data, client));
  }

  bindRequestHandler(requestHandler: RequestHandler) {
    if (typeof this.requestHandler !== "undefined") {
      throw new Error("A request handler may only be bound once.");
    }

    this.requestHandler = requestHandler;
  }

  sendUpdate(data: object) {
    this.socketAttacher.sendUpdate(data);
  }

  private handleRequest(data: any, client: string) {
    if (typeof this.requestHandler === "undefined") {
      throw new Error("Recieved request before requestHandler bound.");
    }

    this.requestHandler(data).then(response => {
      this.socketAttacher.sendResponse({
        returnId: data["returnId"],
        ...response
      }, client);
    });
  }
}

type RequestHandler = (data: object) => Promise<object>;
