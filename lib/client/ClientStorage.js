"use strict";
/**
 * Sledge - A judging system for Hackathons
 * Copyright (C) 2019 The Sledge Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSetupData = exports.setSetupData = exports.getSetupData = exports.setLoggedInJudgeId = exports.getLoggedInJudgeId = void 0;
/**
 * Checks local storage for the id of the currently logged in Judge. If there's
 * a valid judge id, returns it. Otherwise returns 0.
 */
function getLoggedInJudgeId() {
    const storedJudgeId = parseInt(localStorage["judgeId"]);
    if (!Number.isInteger(storedJudgeId) || storedJudgeId < 0) {
        return 0;
    }
    else {
        return storedJudgeId;
    }
}
exports.getLoggedInJudgeId = getLoggedInJudgeId;
/**
 * Sets the given judge id as the currently logged in judge in localstorage
 */
function setLoggedInJudgeId(judgeId) {
    localStorage["judgeId"] = judgeId.toString();
}
exports.setLoggedInJudgeId = setLoggedInJudgeId;
/**
 * Gets the Setup data from local storage
 */
function getSetupData() {
    const localStorageJson = localStorage["setup"];
    if (localStorageJson) {
        return Object.assign(Object.assign({}, getDefaultSetupData()), JSON.parse(localStorageJson));
    }
    else {
        return getDefaultSetupData();
    }
}
exports.getSetupData = getSetupData;
/**
 * Sets the setup data in local storage
 */
function setSetupData(data) {
    localStorage["setup"] = JSON.stringify(data);
}
exports.setSetupData = setSetupData;
/**
 * Resets setup data in local storage to the default
 */
function resetSetupData() {
    localStorage["setup"] = JSON.stringify(getDefaultSetupData());
}
exports.resetSetupData = resetSetupData;
/**
 * Returns the default setup data
 */
function getDefaultSetupData() {
    return {
        submissions: [],
        prizes: [],
        judges: [],
        categories: [],
        tracks: []
    };
}
;
//# sourceMappingURL=ClientStorage.js.map