"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopulateApp = void 0;
const react_1 = __importDefault(require("react"));
const PopulatePage_1 = require("../components/PopulatePage");
const util_1 = require("../../shared/util");
const Socket_1 = require("../Socket");
const ClientStorage_1 = require("../ClientStorage");
const SetupData_1 = require("../SetupData");
const Application_1 = require("../Application");
class PopulateApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.socket = new Socket_1.Socket();
        let setupData = ClientStorage_1.getSetupData();
        this.state = {
            setupData,
            json: JSON.stringify(setupData),
            response: ""
        };
    }
    alterSetupData(f) {
        let oldSetupData = this.state.setupData;
        let newSetupData = f(Object.assign({}, oldSetupData));
        this.setState({
            setupData: newSetupData,
            json: JSON.stringify(newSetupData)
        });
        ClientStorage_1.setSetupData(newSetupData);
    }
    reloadSetupData() {
        let newSetupData = ClientStorage_1.getSetupData();
        this.setState({
            setupData: newSetupData,
            json: JSON.stringify(newSetupData)
        });
    }
    reset() {
        ClientStorage_1.resetSetupData();
        this.reloadSetupData();
    }
    removeHack(index) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { submissions: old.submissions.filter((x, i) => i !== index) })));
    }
    assignAllPrizesToHack(index) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { submissions: old.submissions.map((s, i) => i !== index ? s : Object.assign(Object.assign({}, s), { prizes: util_1.range(old.prizes.length) })) })));
    }
    changeTableNumber(index, table) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { submissions: old.submissions.map((s, i) => i !== index ? s : Object.assign(Object.assign({}, s), { table })) })));
    }
    removePrize(index) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { submissions: old.submissions.map((s, i) => (Object.assign(Object.assign({}, s), { prizes: s.prizes.filter(p => p !== index).map(p => p > index ? p - 1 : p) }))), prizes: old.prizes.filter((s, i) => i !== index) })));
    }
    addJudge(name) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { judges: old.judges.concat([{ name }]) })));
    }
    removeJudge(index) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { judges: old.judges.filter((j, i) => i !== index) })));
    }
    removeCategory(index) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { categories: old.categories.filter((c, i) => i !== index) })));
    }
    addTrack(name) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { tracks: old.tracks.concat([{ name }]) })));
    }
    removeTrack(index) {
        this.alterSetupData(old => {
            for (let sub of old.submissions) {
                if (sub.track === index) {
                    alert(`Can't remove track: submission ${sub.name} uses it`);
                    return old;
                }
            }
            return Object.assign(Object.assign({}, old), { tracks: old.tracks.filter((_t, i) => i !== index), submissions: old.submissions.map(sub => (Object.assign(Object.assign({}, sub), { track: sub.track > index ? sub.track - 1 : sub.track }))) });
        });
    }
    renameTrack(index, name) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { tracks: old.tracks.map((t, i) => i === index ? { name } : t) })));
    }
    convertPrizeToTrack(przIndex) {
        this.alterSetupData(old => (Object.assign(Object.assign({}, old), { tracks: old.tracks.concat([old.prizes[przIndex]]), submissions: old.submissions.map(sub => (Object.assign(Object.assign({}, sub), { track: sub.prizes.indexOf(przIndex) < 0 ?
                    sub.track : old.tracks.length }))) })));
    }
    populateServer() {
        let requestData = Object.assign(Object.assign({ requestName: "REQUEST_POPULATE" }, this.state.setupData), { submissionPrizes: SetupData_1.getSubmissionPrizes(this.state.setupData) });
        this.socket.sendRequest(requestData).then(res => {
            this.setState({
                response: JSON.stringify(res)
            });
        });
    }
    startJudging() {
        this.socket.sendRequest({
            requestName: "REQUEST_BEGIN_JUDGING"
        }).then(res => {
            this.setState({
                response: JSON.stringify(res)
            });
        });
    }
    getPageProps() {
        return {
            json: this.state.json,
            status: this.state.response,
            submissions: this.state.setupData.submissions,
            prizes: this.state.setupData.prizes,
            judges: this.state.setupData.judges,
            categories: this.state.setupData.categories,
            tracks: this.state.setupData.tracks,
            onLoadFromJson: json => this.alterSetupData(old => JSON.parse(json)),
            onReset: () => this.reset(),
            onReloadFromLocalStorage: () => this.alterSetupData(old => ClientStorage_1.getSetupData()),
            onRemoveSubmission: idx => this.removeHack(idx),
            onAssignSubmissionAllPrizes: idx => this.assignAllPrizesToHack(idx),
            onChangeSubmissionLocation: (idx, loc) => this.changeTableNumber(idx, loc),
            onAddPrize: name => this.alterSetupData(SetupData_1.addPrize.bind(null, name)),
            onRemovePrize: idx => this.removePrize(idx),
            onRenamePrize: (idx, name) => this.alterSetupData(SetupData_1.renamePrize.bind(null, idx, name)),
            onAssignPrizeToAll: idx => this.alterSetupData(SetupData_1.assignPrizeToAll.bind(null, idx)),
            onAddJudge: name => this.addJudge(name),
            onRemoveJudge: idx => this.removeJudge(idx),
            onAddCategory: name => this.alterSetupData(SetupData_1.addCategory.bind(null, name)),
            onRemoveCategory: idx => this.removeCategory(idx),
            onExpandCategory: idx => this.alterSetupData(SetupData_1.expandCategory.bind(null, idx)),
            onCycleTrackOnCategory: idx => this.alterSetupData(SetupData_1.cycleTrackOnCategory.bind(null, idx)),
            onAddTrack: this.addTrack.bind(this),
            onRemoveTrack: this.removeTrack.bind(this),
            onRenameTrack: this.renameTrack.bind(this),
            onConvertPrizeToTrack: this.convertPrizeToTrack.bind(this),
            onPopulateServer: () => this.populateServer(),
            onStartJudging: () => this.startJudging()
        };
    }
    render() {
        return react_1.default.createElement(PopulatePage_1.PopulatePage, this.getPageProps());
    }
}
exports.PopulateApp = PopulateApp;
//# sourceMappingURL=PopulateApp.js.map