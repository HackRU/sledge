import {log} from "./log";
import {Database} from "./Database";
import {populateHandler} from "./PopulateRequest";

export class EventHandler {
  simpleHandlers: Array<(db: Database, data: object) => object | null>;

  constructor(private db: Database) {
    this.simpleHandlers = [
      populateHandler
    ];
  }

  handleRequest(request: object): Promise<object> {
    let response = null;

    for (let handler of this.simpleHandlers) {
      response = handler(this.db, request);

      if (response != null) {
        break;
      }
    }

    if (response == null) {
      log("Got request with no handler");

      response = {
        error: true,
        message: "No handler would take your request"
      };
    }

    return Promise.resolve(response);
  }

  getRequestHandler(): (data: object) => Promise<object> {
    return r => this.handleRequest(r);
  }
}
