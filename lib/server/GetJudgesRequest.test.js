"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetJudgesRequest_1 = require("./GetJudgesRequest");
const MockDatabase_1 = require("./MockDatabase");
describe("GetJudgesRequest", () => {
    let database;
    let requestHandler;
    beforeAll(() => {
        database = MockDatabase_1.createPreCollectionMockDatabase();
        requestHandler = new GetJudgesRequest_1.GetJudgesRequest(database);
    });
    afterAll(() => {
        database = null;
        requestHandler = null;
    });
    test("Handles REQUEST_GET_JUDGES", () => {
        expect(requestHandler.canHandle("REQUEST_GET_JUDGES")).toBe(true);
    });
    test("Returns list with proper judge names and ids", () => {
        let response = requestHandler.handleSync({
            requestName: "REQUEST_GET_JUDGES"
        });
        expect(response.judges).toContainEqual({ id: 1, name: "Walter White" });
        expect(response.judges).toContainEqual({ id: 4, name: "Mike Ehrmantraut" });
        expect(response.judges).toContainEqual({ id: 8, name: "Saul Goodman" });
    });
    test("Returns the correct number of judges", () => {
        let response = requestHandler.handleSync({
            requestName: "REQUEST_GET_JUDGES"
        });
        expect(response.judges.length).toBe(12);
    });
});
//# sourceMappingURL=GetJudgesRequest.test.js.map