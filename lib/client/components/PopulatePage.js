"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopulatePage = void 0;
const react_1 = __importDefault(require("react"));
const reactstrap_1 = require("reactstrap");
const TabularActions_1 = require("./TabularActions");
const InputItem_1 = require("./InputItem");
;
exports.PopulatePage = (props) => (react_1.default.createElement(reactstrap_1.Container, { id: "PopulatePage" },
    react_1.default.createElement("h1", null, `Populate Data from Devpost`),
    react_1.default.createElement("h2", null, `Import Devpost CSV`),
    react_1.default.createElement("p", null,
        `Devpost CSVs will be merged into existing data. Go to the `,
        react_1.default.createElement("a", { href: "/devpost" }, `Devpost import page`),
        ` to start.`),
    react_1.default.createElement("h2", null, `Load Data`),
    react_1.default.createElement(InputItem_1.InputItem, { name: "From JSON", fields: ["JSON Data"], onAdd: json => props.onLoadFromJson(json[0]) }),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onReloadFromLocalStorage() }, `Reload from LocalStorage`),
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onReset() }, `Reset`)),
    react_1.default.createElement("h2", null, `Submissions`),
    react_1.default.createElement(TabularActions_1.TabularActions, { headings: ["Location", "Name", "URL", "Track", "Prizes"], data: props.submissions.map(submission => [
            submission.location.toString(),
            submission.name,
            submission.url,
            props.tracks[submission.track].name,
            submission.prizes.map(idx => props.prizes[idx].name).join(", ")
        ]), actions: [{
                name: "Remove",
                cb: idx => props.onRemoveSubmission(idx)
            }, {
                name: "Assign All Prizes",
                cb: idx => props.onAssignSubmissionAllPrizes(idx)
            }, {
                name: "Change Location",
                cb: idx => {
                    let newTableNumber = parseInt(prompt("New Loaction") || "0");
                    if (!Number.isNaN(newTableNumber)) {
                        props.onChangeSubmissionLocation(idx, newTableNumber);
                    }
                }
            }] }),
    react_1.default.createElement("h2", null, `Tracks`),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => {
                const name = prompt("New Track", "name");
                if (name) {
                    props.onAddTrack(name);
                }
            } }, `Add Track`)),
    react_1.default.createElement(TabularActions_1.TabularActions, { headings: ["name"], data: props.tracks.map(track => [track.name]), actions: [{
                name: "Remove",
                cb: idx => props.onRemoveTrack(idx)
            }, {
                name: "Rename",
                cb: idx => {
                    const name = prompt("Rename Track");
                    if (name) {
                        props.onRenameTrack(idx, name);
                    }
                }
            }] }),
    react_1.default.createElement("h2", null, `Prizes`),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => {
                const name = prompt("New Prize", "name");
                if (name) {
                    props.onAddPrize(name);
                }
            } }, `Add Prize`)),
    react_1.default.createElement(TabularActions_1.TabularActions, { headings: ["Name"], data: props.prizes.map(prize => [prize.name]), actions: [{
                name: "Remove",
                cb: idx => props.onRemovePrize(idx)
            }, {
                name: "Rename",
                cb: idx => {
                    let newName = prompt("New Prize Name");
                    if (newName !== null) {
                        props.onRenamePrize(idx, newName);
                    }
                }
            }, {
                name: "Convert to Track",
                cb: props.onConvertPrizeToTrack
            }, {
                name: "Assign to All",
                cb: props.onAssignPrizeToAll
            }] }),
    react_1.default.createElement("h2", null, `Judges`),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => {
                let name = prompt("Name for New Judge");
                if (name !== null) {
                    props.onAddJudge(name);
                }
            } }, `Add Judge`)),
    react_1.default.createElement(TabularActions_1.TabularActions, { headings: ["Name"], data: props.judges.map(judge => [judge.name]), actions: [{
                name: "Remove",
                cb: idx => props.onRemoveJudge(idx)
            }] }),
    react_1.default.createElement("h2", null, `Categories`),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => {
                let name = prompt("New Category Name");
                if (name !== null) {
                    props.onAddCategory(name);
                }
            } }, `Add Category`)),
    react_1.default.createElement(TabularActions_1.TabularActions, { headings: ["Name", "Track"], data: props.categories.map(cat => [
            cat.name,
            props.tracks[cat.track].name
        ]), actions: [{
                name: "Remove",
                cb: idx => props.onRemoveCategory(idx)
            }, {
                name: "Expand",
                cb: idx => props.onExpandCategory(idx)
            }, {
                name: "Cycle Track",
                cb: props.onCycleTrackOnCategory
            }] }),
    react_1.default.createElement("h2", null, `Populate on Server`),
    react_1.default.createElement(reactstrap_1.ButtonGroup, null,
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onPopulateServer() }, `Populate Server`),
        react_1.default.createElement(reactstrap_1.Button, { onClick: () => props.onStartJudging() }, `Start Judging`)),
    react_1.default.createElement(reactstrap_1.Input, { type: "textarea", readOnly: true, value: props.json }),
    react_1.default.createElement(reactstrap_1.Input, { type: "textarea", readOnly: true, value: props.status })));
//# sourceMappingURL=PopulatePage.js.map