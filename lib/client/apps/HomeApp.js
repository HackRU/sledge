"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeApp = void 0;
const react_1 = __importDefault(require("react"));
const HomePage_1 = require("../components/HomePage");
const util_1 = require("../util");
const Application_1 = require("../Application");
class HomeApp extends Application_1.Application {
    constructor(props) {
        super(props);
    }
    getPageProps() {
        return {
            onSegue: util_1.segue
        };
    }
    render() {
        return react_1.default.createElement(HomePage_1.HomePage, this.getPageProps());
    }
}
exports.HomeApp = HomeApp;
//# sourceMappingURL=HomeApp.js.map