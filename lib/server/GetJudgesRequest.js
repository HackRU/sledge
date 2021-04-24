"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetJudgesRequest = void 0;
/**
 * Get the current list of judges and their associated ids
 */
class GetJudgesRequest {
    constructor(db) {
        this.db = db;
    }
    canHandle(requestName) {
        return requestName === "REQUEST_GET_JUDGES";
    }
    simpleValidate(data) {
        return true;
    }
    handleSync(data) {
        let judges = this.db.all("SELECT id, name FROM Judge ORDER BY name;", []);
        return {
            judges
        };
    }
}
exports.GetJudgesRequest = GetJudgesRequest;
//# sourceMappingURL=GetJudgesRequest.js.map