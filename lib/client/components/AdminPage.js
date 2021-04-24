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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPage = void 0;
const react_1 = __importStar(require("react"));
const react_admin_1 = require("react-admin");
exports.AdminPage = (props) => (react_1.default.createElement(react_admin_1.Admin, { dataProvider: props.dataProvider, dashboard: Dashboard },
    react_1.default.createElement(react_admin_1.Resource, { name: "Status", list: StatusList }),
    react_1.default.createElement(react_admin_1.Resource, { name: "Submission", list: SubmissionList }),
    react_1.default.createElement(react_admin_1.Resource, { name: "Track", list: TrackList }),
    react_1.default.createElement(react_admin_1.Resource, { name: "Judge", list: JudgeList }),
    react_1.default.createElement(react_admin_1.Resource, { name: "Prize", list: PrizeList }),
    react_1.default.createElement(react_admin_1.Resource, { name: "Category", list: CategoryList }),
    react_1.default.createElement(react_admin_1.Resource, { name: "Assignment", list: AssignmentList })));
const Dashboard = () => (react_1.default.createElement("div", null,
    react_1.default.createElement("p", null, `Welcome to the admin's page!`),
    react_1.default.createElement("ul", null,
        react_1.default.createElement("li", null,
            react_1.default.createElement("a", { href: "/populate" }, `Import a Devpost CSV`)),
        react_1.default.createElement("li", null,
            react_1.default.createElement("a", { href: "/controlpanel" }, `Perform Admin Actions`)),
        react_1.default.createElement("li", null,
            react_1.default.createElement("a", { href: "/debug" }, `Send a raw request to Sledge`)),
        react_1.default.createElement("li", null,
            react_1.default.createElement("a", { href: "/visualizeratings" }, `View a table relating Judges and Submissions`)),
        react_1.default.createElement("li", null,
            react_1.default.createElement("a", { href: "/visualizeprizes" }, `View a table relating Judges and Submissions by Prize`)))));
const StatusList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.DateField, { showTime: true, source: "timestamp", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "phase", sortable: false }))));
const SubmissionList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.TextField, { source: "name", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "trackId", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "location", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "active", sortable: false }))));
const TrackList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.TextField, { source: "name", sortable: false }))));
const JudgeList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.TextField, { source: "name", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "anchor", sortable: false }))));
const PrizeList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.TextField, { source: "name", sortable: false }))));
const CategoryList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.TextField, { source: "name", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "trackId", sortable: false }))));
const AssignmentList = (props) => (react_1.default.createElement(react_admin_1.List, Object.assign({}, props, { bulkActionButtons: react_1.default.createElement(react_1.Fragment, null) }),
    react_1.default.createElement(react_admin_1.Datagrid, null,
        react_1.default.createElement(react_admin_1.NumberField, { source: "id", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "judgeId", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "priority", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "type", sortable: false }),
        react_1.default.createElement(react_admin_1.NumberField, { source: "active", sortable: false }))));
//# sourceMappingURL=AdminPage.js.map