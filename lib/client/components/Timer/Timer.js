"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const timeFormat_1 = __importDefault(require("./timeFormat"));
class Timer extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            clock: 0
        };
        this.clock = 0;
        this.ticker = this.ticker.bind(this);
    }
    componentDidMount() {
        this.timer = setInterval(this.ticker, 1);
    }
    ticker() {
        this.setState({ clock: new Date().getTime() - this.props.start });
    }
    render() {
        var clock = this.state.clock;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("h2", null, timeFormat_1.default(clock))));
    }
}
exports.default = Timer;
//# sourceMappingURL=Timer.js.map