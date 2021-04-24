"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
const log_1 = require("./log");
const PopulateRequest_1 = require("./PopulateRequest");
const BeginJudgingRequest_1 = require("./BeginJudgingRequest");
const GlobalStatusRequest_1 = require("./GlobalStatusRequest");
const GetJudgesRequest_1 = require("./GetJudgesRequest");
const GetAssignmentRequest_1 = require("./GetAssignmentRequest");
const SubmitAssignmentRequest_1 = require("./SubmitAssignmentRequest");
const GetRatingScoresRequest_1 = require("./GetRatingScoresRequest");
const GetFullScoresRequest_1 = require("./GetFullScoresRequest");
const AssignPrizeToJudgeRequest_1 = require("./AssignPrizeToJudgeRequest");
const GetObjectsRequest_1 = require("./GetObjectsRequest");
/**
 * Master event handler. When handling a request will go through all request handlers until it finds a match.
 */
class EventHandler {
    constructor(db, socket) {
        this.db = db;
        socket.bindRequestHandler((data) => this.handleRequest(data));
        const looseHandlers = [
            new PopulateRequest_1.PopulateRequest(db),
            new BeginJudgingRequest_1.BeginJudgingRequest(db),
            new GlobalStatusRequest_1.GlobalStatusRequest(db),
            new GetJudgesRequest_1.GetJudgesRequest(db),
            new GetAssignmentRequest_1.GetAssignmentRequest(db),
            new SubmitAssignmentRequest_1.SubmitAssignmentRequest(db),
            new GetRatingScoresRequest_1.GetRatingScoresRequest(db),
            new GetFullScoresRequest_1.GetFullScoresRequest(db),
            new AssignPrizeToJudgeRequest_1.AssignPrizeToJudgeRequest(db),
            new GetObjectsRequest_1.GetObjectsRequest(db)
        ];
        this.handlers = looseHandlers.map(toStrictHandler);
    }
    handleRequest(request) {
        if (typeof request !== "object") {
            throw new Error("Got request that is not an object");
        }
        if (typeof request.requestName !== "string") {
            return Promise.resolve({ error: "Got request with requestName not a string" });
        }
        const requestName = request.requestName;
        const handler = this.handlers.find(handler => handler.canHandle(requestName));
        if (handler === undefined) {
            log_1.log("WARN: Got request with no handler %O", request);
            return Promise.resolve({
                error: "No handler would take your request."
            });
        }
        let validation = handler.validate(request);
        if (!validation.valid) {
            return Promise.resolve({
                error: validation.error
            });
        }
        const responsePromise = handler.handle(request);
        if (this.db.isInTransaction()) {
            throw new Error(`Still in transaction after request (requestName=${request["requestName"]})`);
        }
        responsePromise.then(response => {
            if (response.error) {
                log_1.log("WARN: Handler returned an error: %O", response);
            }
        });
        return responsePromise;
    }
}
exports.EventHandler = EventHandler;
function toStrictHandler(handler) {
    return {
        canHandle: requestName => handler.canHandle(requestName),
        validate: data => {
            if (handler.validate) {
                return handler.validate(data);
            }
            else if (handler.simpleValidate) {
                if (handler.simpleValidate(data)) {
                    return { valid: true };
                }
                else {
                    return { valid: false, error: "Simple validate returned false" };
                }
            }
            else {
                throw new Error("Neither validate nor simple validate defined on handler");
            }
        },
        handle: data => {
            if (handler.handle) {
                return handler.handle(data);
            }
            else if (handler.handleSync) {
                return Promise.resolve(handler.handleSync(data));
            }
            else {
                throw new Error("Neither handle nor handleSync defined on handler");
            }
        }
    };
}
//# sourceMappingURL=EventHandler.js.map