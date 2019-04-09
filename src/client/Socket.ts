import io from "socket.io-client";

export type UpdateHandler = (data: object) => void;

export class Socket {
  updateHandlers: Array<UpdateHandler>;
  socket: SocketIOClient.Socket;
  resolvers: Map<string, (data: object) => void>;

  constructor() {
    this.updateHandlers = [];
    this.resolvers = new Map();

    this.socket = io(document.location.origin);
    this.socket.on("update", data => this.handleUpdate(data));
    this.socket.on("response", data => this.handleResponse(data));
  }

  handleUpdate(data: object) {
    for (let h of this.updateHandlers) {
      h(data);
    }
  }

  handleResponse(data: object) {
    let returnId = data["returnId"];
    let resolver = this.resolvers.get(returnId);
    resolver(data);
    this.resolvers.delete(returnId);
  }

  sendRequest(data: object): Promise<object> {
    let returnId = generateUniqueReturnId();
    let wireData = {
      ...data, returnId
    };

    this.socket.emit("request", wireData);

    return new Promise(resolve => {
      this.resolvers.set(returnId, resolve);
    });
  }

  sendDebug(data: object): Promise<object> {
    let beforeTime = Date.now();
    let promise = this.sendRequest(data);
    promise.then(res => {
      let diffTime = Date.now() - beforeTime;
      console.log(`Got response after ${diffTime/1000} seconds!`);
      console.log(res);
    });
    return promise;
  }

  onUpdate(handler: UpdateHandler) {
    this.updateHandlers.push(handler);
  }
}

function generateUniqueReturnId() {
  let timePart = Date.now().toString(16).slice(-6);
  let randomPart = Math.random().toString(16).slice(-6);

  return timePart + randomPart;
}
