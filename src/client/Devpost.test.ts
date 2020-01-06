import { mergeDevpostToSetupData, DevpostData } from "./Devpost";
import { SetupData, getDefaultSetupData } from "./SetupData";

const devpostSampleData: DevpostData = {
  error: null,
  prizes: ["Prize 1", "Prize 2", "Prize 3"],
  submissions: [{
    name: "Submission 1",
    table: 10,
    prizes: [1,2]
  }, {
    name: "Submission 2",
    table: 5,
    prizes: [0]
  }]
};
const setupSampleData: SetupData = {
  submissions: [{
    name: "Submission 1",
    location: 10,
    track: 0,
    prizes: [1,2]
  }, {
    name: "Submission 2",
    location: 5,
    track: 0,
    prizes: [0],
  }],
  categories: [],
  prizes: [{name: "Prize 1"}, {name: "Prize 2"}, {name: "Prize 3"}],
  judges: [],
  tracks: [{name: "Default Track"}]
};

describe("Devpost", () => {
  test("mergeDevpostToSetupData", () => {
    expect(mergeDevpostToSetupData(
      devpostSampleData,
      getDefaultSetupData()
    )).toEqual(
      setupSampleData
    );
  });
});