import {log} from "./log";
import {Database} from "./Database";
import {RequestHandler} from "./Request";
import {ServerSocket} from "./ServerSocket";

import {PopulateRequest} from "./PopulateRequest";
import {BeginJudgingRequest} from "./BeginJudgingRequest";
import {GlobalStatusRequest} from "./GlobalStatusRequest";
import {GetJudgesRequest} from "./GetJudgesRequest";
import {GetAssignmentRequest} from "./GetAssignmentRequest";
import {SubmitAssignmentRequest} from "./SubmitAssignmentRequest";

export class EventHandler {
  handlers: Array<RequestHandler>;

  constructor(private db: Database, socket: ServerSocket) {
    socket.bindRequestHandler((data: object) => this.handleRequest(data));

    this.handlers = [
      new PopulateRequest(db),
      new BeginJudgingRequest(db),
      new GlobalStatusRequest(db),
      new GetJudgesRequest(db),
      new GetAssignmentRequest(db),
      new SubmitAssignmentRequest(db)
    ];
  }

  handleRequest(request: object): Promise<object> {
    const handler = this.handlers.find(handler => handler.canHandle(request));

    if (handler === undefined) {
      log("WARN: Got request with no handler %O", request);

      return Promise.resolve({
        error: "No handler would take your request."
      });
    }

    const responsePromise = handler.handle(request);

    responsePromise.then(response => {
      if (response["error"]) {
        log("WARN: Handler returned an error: %O", response);
      }
    });

    return responsePromise;
  }
}
