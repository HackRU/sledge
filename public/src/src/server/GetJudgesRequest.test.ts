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
    let response: any = requestHandler.handleSync({
      requestName: "REQUEST_GET_JUDGES"
    });

    expect(response.judges).toContainEqual({id: 1, name: "Walter White"});
    expect(response.judges).toContainEqual({id: 4, name: "Mike Ehrmantraut"});
    expect(response.judges).toContainEqual({id: 8, name: "Saul Goodman"});
  });
  test("Returns the correct number of judges", () => {
    let response: any = requestHandler.handleSync({
      requestName: "REQUEST_GET_JUDGES"
    });
    expect(response.judges.length).toBe(12);
  });
});
