"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pages = void 0;
const DebugApp_1 = require("./apps/DebugApp");
const PopulateApp_1 = require("./apps/PopulateApp");
const DevpostApp_1 = require("./apps/DevpostApp");
const LoginApp_1 = require("./apps/LoginApp");
const JudgeApp_1 = require("./apps/JudgeApp");
const VisualizeRatingsApp_1 = require("./apps/VisualizeRatingsApp");
const ControlPanelApp_1 = require("./apps/ControlPanelApp");
const VisualizePrizesApp_1 = require("./apps/VisualizePrizesApp");
const SubmissionManagementApp_1 = require("./apps/SubmissionManagementApp");
const AdminApp_1 = require("./apps/AdminApp");
const OverallRatingsApp_1 = require("./apps/OverallRatingsApp");
;
exports.pages = [{
        name: "Socket Debugger",
        path: "debug",
        component: DebugApp_1.DebugApp
    }, {
        name: "Populate",
        path: "populate",
        component: PopulateApp_1.PopulateApp
    }, {
        name: "Devpost Importer",
        path: "devpost",
        component: DevpostApp_1.DevpostApp
    }, {
        name: "Login",
        path: "login",
        component: LoginApp_1.LoginApp
    }, {
        name: "Judge",
        path: "judge",
        component: JudgeApp_1.JudgeApp
    }, {
        name: "Visualize Ratings",
        path: "visualizeratings",
        component: VisualizeRatingsApp_1.VisualizeRatingsApp
    }, {
        name: "Visualize Prizes",
        path: "visualizeprizes",
        component: VisualizePrizesApp_1.VisualizePrizesApp
    }, {
        name: "Control Panel",
        path: "controlpanel",
        component: ControlPanelApp_1.ControlPanelApp
    }, {
        name: "Submission Management",
        path: "submissionmanagement",
        component: SubmissionManagementApp_1.SubmissionManagementApp
    }, {
        name: "Admin",
        path: "admin",
        component: AdminApp_1.AdminApp
    }, {
        name: "Overall Ratings",
        path: "overallratings",
        component: OverallRatingsApp_1.OverallRatingsApp
    }];
//# sourceMappingURL=directory.js.map