"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminApp = void 0;
const react_1 = __importDefault(require("react"));
const Socket_1 = require("../Socket");
const SledgeProvider_1 = require("../SledgeProvider");
const AdminPage_1 = require("../components/AdminPage");
const Application_1 = require("../Application");
class AdminApp extends Application_1.Application {
    constructor(props) {
        super(props);
        this.socket = new Socket_1.Socket();
        this.provider = new SledgeProvider_1.SledgeProvider(this.socket);
    }
    getPageProps() {
        return {
            dataProvider: this.provider
        };
    }
    render() {
        return react_1.default.createElement(AdminPage_1.AdminPage, this.getPageProps());
    }
}
exports.AdminApp = AdminApp;
//# sourceMappingURL=AdminApp.js.map