"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginApp = void 0;
const react_1 = __importDefault(require("react"));
const Socket_1 = require("../Socket");
const LoginPage_1 = require("../components/LoginPage");
const util_1 = require("../util");
const Application_1 = require("../Application");
class LoginApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            judges: []
        };
        this.socket = new Socket_1.Socket();
        this.socket.sendRequest({
            requestName: "REQUEST_GET_JUDGES"
        }).then(res => {
            this.setState({
                judges: res["judges"],
                loading: false
            });
        });
    }
    selectJudge(judgeId) {
        localStorage["judgeId"] = judgeId.toString();
        util_1.segue("/judge");
    }
    getPageProps() {
        return {
            loading: this.state.loading,
            judges: this.state.judges,
            onSelectJudge: id => this.selectJudge(id)
        };
    }
    render() {
        return react_1.default.createElement(LoginPage_1.LoginPage, this.getPageProps());
    }
}
exports.LoginApp = LoginApp;
//# sourceMappingURL=LoginApp.js.map