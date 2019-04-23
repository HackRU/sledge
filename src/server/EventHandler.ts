import {log} from "./log";
import {Database} from "./Database";
import {PopulateRequest} from "./PopulateRequest";
import {BeginJudgingRequest} from "./BeginJudgingRequest";
import {GlobalStatusRequest} from "./GlobalStatusRequest";

export class EventHandler {
  simpleHandlers: Array<(data: object) => object | null>;

  constructor(private db: Database) {
    let populateRequest = new PopulateRequest(db);
    let beginJudgingRequest = new BeginJudgingRequest(db);
    let globalStatusRequest = new GlobalStatusRequest(db);

    this.simpleHandlers = [
      populateRequest.handler.bind(populateRequest),
      beginJudgingRequest.handler.bind(beginJudgingRequest),
      globalStatusRequest.handler.bind(globalStatusRequest)
    ];
  }

  handleRequest(request: object): Promise<object> {
    let response = null;

    for (let handler of this.simpleHandlers) {
      response = handler(request);

      if (response != null) {
        break;
      }
    }

    if (response == null) {
      log("WARN: Got request with no handler %O", request);

      response = {
        error: "No handler would take your request"
      };
    } else if (response["error"] != null) {
      log("WARN: Handler returned an error: %O", response);
    }

    return Promise.resolve(response);
  }

  getRequestHandler(): (data: object) => Promise<object> {
    return r => this.handleRequest(r);
  }
}
