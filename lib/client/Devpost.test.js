"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Devpost_1 = require("./Devpost");
const SetupData_1 = require("./SetupData");
const devpostSampleData = {
    error: null,
    prizes: ["Prize 1", "Prize 2", "Prize 3"],
    submissions: [{
            name: "Submission 1",
            url: "https://hackru-s19.devpost.com/submissions/115191-boba-connect",
            table: 10,
            prizes: [1, 2]
        }, {
            name: "Submission 2",
            url: "https://hackru-s19.devpost.com/submissions/115289-modularsensor",
            table: 5,
            prizes: [0]
        }]
};
const setupSampleData = {
    submissions: [{
            name: "Submission 1",
            url: "https://hackru-s19.devpost.com/submissions/115191-boba-connect",
            location: 10,
            track: 0,
            prizes: [1, 2]
        }, {
            name: "Submission 2",
            url: "https://hackru-s19.devpost.com/submissions/115289-modularsensor",
            location: 5,
            track: 0,
            prizes: [0],
        }],
    categories: [],
    prizes: [{ name: "Prize 1" }, { name: "Prize 2" }, { name: "Prize 3" }],
    judges: [],
    tracks: [{ name: "Default Track" }]
};
describe("Devpost", () => {
    test("mergeDevpostToSetupData", () => {
        expect(Devpost_1.mergeDevpostToSetupData(devpostSampleData, SetupData_1.getDefaultSetupData())).toEqual(setupSampleData);
    });
});
//# sourceMappingURL=Devpost.test.js.map