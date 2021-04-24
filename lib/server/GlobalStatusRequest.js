"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalStatusRequest = void 0;
/**
 * Get the current phase
 */
class GlobalStatusRequest {
    constructor(db) {
        this.selectPhase = db.prepare("SELECT phase FROM Status ORDER BY timestamp DESC;");
    }
    canHandle(requestName) {
        return requestName === "REQUEST_GLOBAL_STATUS";
    }
    simpleValidate(data) {
        return true;
    }
    handle(_) {
        let phase = this.selectPhase.get().phase;
        return Promise.resolve({
            phase
        });
    }
}
exports.GlobalStatusRequest = GlobalStatusRequest;
//# sourceMappingURL=GlobalStatusRequest.js.map