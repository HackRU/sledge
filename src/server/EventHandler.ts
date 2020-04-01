import {log} from "./log";
import {Database} from "./Database";
import {
  RequestHandler,
  StrictRequestHandler,
  RequestValidationError,
  ResponseObject
} from "./Request";
import {ServerSocket} from "./ServerSocket";

import {PopulateRequest} from "./PopulateRequest";
import {BeginJudgingRequest} from "./BeginJudgingRequest";
import {GlobalStatusRequest} from "./GlobalStatusRequest";
import {GetJudgesRequest} from "./GetJudgesRequest";
import {GetAssignmentRequest} from "./GetAssignmentRequest";
import {SubmitAssignmentRequest} from "./SubmitAssignmentRequest";
import {GetRatingScoresRequest} from "./GetRatingScoresRequest";
import {GetFullScoresRequest} from "./GetFullScoresRequest";
import {AssignPrizeToJudgeRequest} from "./AssignPrizeToJudgeRequest";
import { GetObjectsRequest } from "./GetObjectsRequest";

/**
 * Master event handler. When handling a request will go through all request handlers until it finds a match.
 */
export class EventHandler {
  handlers: Array<StrictRequestHandler>;

  constructor(private db: Database, socket: ServerSocket) {
    socket.bindRequestHandler((data: object) => this.handleRequest(data));

    const looseHandlers: Array<RequestHandler> = [
      new PopulateRequest(db),
      new BeginJudgingRequest(db),
      new GlobalStatusRequest(db),
      new GetJudgesRequest(db),
      new GetAssignmentRequest(db),
      new SubmitAssignmentRequest(db),
      new GetRatingScoresRequest(db),
      new GetFullScoresRequest(db),
      new AssignPrizeToJudgeRequest(db),
      new GetObjectsRequest(db)
    ];
    this.handlers = looseHandlers.map(toStrictHandler);
  }

  handleRequest(request: any): Promise<object> {
    if (typeof request !== "object") {
      throw new Error("Got request that is not an object");
    }

    if (typeof request.requestName !== "string") {
      return Promise.resolve({ error: "Got request with requestName not a string" });
    }

    const requestName: string = request.requestName;
    const handler = this.handlers.find(handler => handler.canHandle(requestName));

    if (handler === undefined) {
      log("WARN: Got request with no handler %O", request);

      return Promise.resolve({
        error: "No handler would take your request."
      });
    }

    const responsePromise = handler.handle(request);

    if (this.db.isInTransaction()) {
      throw new Error(`Still in transaction after request (requestName=${request["requestName"]})`);
    }

    responsePromise.then(response => {
      if (response.error) {
        log("WARN: Handler returned an error: %O", response);
      }
    });

    return responsePromise;
  }
}

function toStrictHandler(handler: RequestHandler): StrictRequestHandler {
  return {
    canHandle: requestName => handler.canHandle(requestName),
    validate: data => {
      if (handler.validate) {
        return handler.validate(data)
      } else if (handler.simpleValidate) {
        if (handler.simpleValidate(data)) {
          return { valid: true };
        } else {
          return { valid: false, error: "Simple validate returned false" };
        }
      } else {
        throw new Error("Neither validate nor simple validate defined on handler");
      }
    },
    handle: data => {
      if (handler.handle) {
        return handler.handle(data);
      } else if (handler.handleSync) {
        return Promise.resolve(handler.handleSync(data));
      } else {
        throw new Error("Neither handle nor handleSync defined on handler");
      }
    }
  };
}
