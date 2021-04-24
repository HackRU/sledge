"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevpostApp = void 0;
const react_1 = __importDefault(require("react"));
const DevpostPage_1 = require("../components/DevpostPage");
const Socket_1 = require("../Socket");
const ClientStorage_1 = require("../ClientStorage");
const Devpost_1 = require("../Devpost");
const Application_1 = require("../Application");
class DevpostApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.socket = new Socket_1.Socket();
        this.state = {
            status: "nothing to report"
        };
    }
    importCsv(csv) {
        let devpost = Devpost_1.parseDevpostData(csv);
        if (devpost.error !== null) {
            console.warn(`parseDevpostData error: ${devpost.error}`);
            console.warn(devpost);
            this.setState({
                status: `${devpost.error} (object logged to console)`
            });
            return;
        }
        let oldSetup = ClientStorage_1.getSetupData();
        let newSetup = Devpost_1.mergeDevpostToSetupData(devpost, oldSetup);
        let newPrizes = newSetup.prizes.length - oldSetup.prizes.length;
        let newSubmissions = newSetup.submissions.length - oldSetup.submissions.length;
        function convertDevpostToSetupData(devpostData) {
            return {
                prizes: devpostData.prizes,
                submissions: devpostData.submissions.map(d => ({
                    name: d.name,
                    url: d.url,
                    location: d.table,
                    prizes: d.prizes
                }))
            };
        }
        ClientStorage_1.setSetupData(newSetup);
        this.setState({
            status: `Successfully imported ${newSubmissions} new submissions and ${newPrizes} new prizes`
        });
    }
    getPageProps() {
        return {
            status: this.state.status,
            onImport: csv => this.importCsv(csv)
        };
    }
    render() {
        return react_1.default.createElement(DevpostPage_1.DevpostPage, this.getPageProps());
    }
}
exports.DevpostApp = DevpostApp;
//# sourceMappingURL=DevpostApp.js.map