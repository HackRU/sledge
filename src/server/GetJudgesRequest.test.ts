import {GetJudgesRequest} from "./GetJudgesRequest";
import {Database} from "./Database";
import {createPreCollectionMockDatabase} from "./MockDatabase";

describe("GetJudgesRequest", () => {
  let database: Database;
  let requestHandler: GetJudgesRequest;

  beforeAll(() => {
    database = createPreCollectionMockDatabase();
    requestHandler = new GetJudgesRequest(database);
  });
  afterAll(() => {
    database = null as any;
    requestHandler = null as any;
  });

  test("Handles REQUEST_GET_JUDGES", () => {
    expect(requestHandler.canHandle("REQUEST_GET_JUDGES")).toBe(true);
  });
  test("Returns list with proper judge names and ids", () => {
    let response: Promise<any> = requestHandler.handle({
      requestName: "REQUEST_GET_JUDGES"
    });

    expect(response).resolves.toContain({id: 1, name: "Walter White"});
    expect(response).resolves.toContain({id: 4, name: "Mike Ehrmantraut"});
    expect(response).resolves.toContain({id: 8, name: "Saul Goodman"});
  });
  test("Returns the correct number of judges", () => {
    let response: Promise<any> = requestHandler.handle({
      requestName: "REQUEST_GET_JUDGES"
    });
    expect(response).resolves.toHaveProperty("length", 12);
  });
});
