import io from "socket.io-client";

export type UpdateHandler = (data: object) => void;
export type ConnectionHandler = (socketioEventName: string) => void;

let singleton: Socket;

/**
 * Communicates with the Sledge server
 */
export class Socket {
  updateHandlers: Array<UpdateHandler>;
  connectionHandlers: Array<ConnectionHandler>;
  socket: SocketIOClient.Socket;
  resolvers: Map<string, (data: object) => void>;

  constructor() {
    if (singleton) {
      throw new Error("Socket should only have one instance");
    }
    singleton = this;

    this.updateHandlers = [];
    this.connectionHandlers = [];
    this.resolvers = new Map();

    this.socket = io(document.location.origin, {
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    });

    this.socket.on("update", (data: unknown) => this.handleUpdate(data));
    this.socket.on("response", (data: unknown) => this.handleResponse(data));

    [
      "connect",
      "connect_error",
      "connect_timeout",
      "error",
      "disconnect",
      "reconnect",
      "reconnect_attempt",
      "reconnecting",
      "reconnect_error",
      "reconnect_failed"
    ].forEach(
      evtName => this.socket.on(evtName, () => this.handleConnection(evtName))
    );
  }

  private handleUpdate(data: any) {
    for (let h of this.updateHandlers) {
      h(data);
    }
  }

  private handleConnection(eventName: string) {
    for (let h of this.connectionHandlers) {
      h(eventName);
    }
  }

  private handleResponse(data: any) {
    let returnId = data["returnId"];
    let resolver = this.resolvers.get(returnId);
    if (resolver) {
      if (data["error"]) {
        console.error(`Response gave error: ${data["error"]}`);
      }

      resolver(data);
      this.resolvers.delete(returnId);
    }
  }

  /**
   * Sends a request to the server and returns a Promise giving
   * the response. Before sending the returnId is set.
   */
  sendRequest(data: object): Promise<any> {
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

  onConnectionEvent(handler: ConnectionHandler) {
    this.connectionHandlers.push(handler);
  }
}

/**
 * Gets the socket singleton instance
 */
export function getSocket(): Socket {
  return singleton;
}

/**
 * Generates a unique string used as the returnId of a request.
 *
 * This is a combination of time and randomness.
 */
function generateUniqueReturnId(): string {
  let timePart = Date.now().toString(16).slice(-6);
  let randomPart = Math.random().toString(16).slice(-6);

  return timePart + randomPart;
}
