"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmissionPrizes = exports.cycleTrackOnCategory = exports.expandCategory = exports.addCategory = exports.assignPrizeToAll = exports.renamePrize = exports.addPrize = exports.removeSubmission = exports.deserializeSetupData = exports.serializeSetupData = exports.copySetupData = exports.getDefaultSetupData = void 0;
;
function getDefaultSetupData() {
    return {
        submissions: [],
        categories: [],
        prizes: [],
        judges: [],
        tracks: []
    };
}
exports.getDefaultSetupData = getDefaultSetupData;
function copySetupData(data) {
    return {
        submissions: data.submissions.map(sub => (Object.assign(Object.assign({}, sub), { prizes: sub.prizes.slice() }))),
        categories: data.categories.map(cat => (Object.assign({}, cat))),
        prizes: data.prizes.map(prz => (Object.assign({}, prz))),
        judges: data.judges.map(jdg => (Object.assign({}, jdg))),
        tracks: data.tracks.map(trk => (Object.assign({}, trk)))
    };
}
exports.copySetupData = copySetupData;
function serializeSetupData(setupData) {
    return JSON.stringify(setupData);
}
exports.serializeSetupData = serializeSetupData;
function deserializeSetupData(serialized) {
    if (serialized) {
        return Object.assign(Object.assign({}, getDefaultSetupData()), JSON.parse(serialized));
    }
    else {
        return getDefaultSetupData();
    }
}
exports.deserializeSetupData = deserializeSetupData;
function removeSubmission(submissionIndex, setupData) {
    return Object.assign(Object.assign({}, setupData), { submissions: setupData.submissions.filter((_s, i) => i !== submissionIndex) });
}
exports.removeSubmission = removeSubmission;
function addPrize(name, data) {
    return Object.assign(Object.assign({}, data), { prizes: data.prizes.concat([{ name }]) });
}
exports.addPrize = addPrize;
function renamePrize(idx, newName, data) {
    return Object.assign(Object.assign({}, data), { prizes: data.prizes.map((p, i) => i === idx ? { name: newName } : p) });
}
exports.renamePrize = renamePrize;
function assignPrizeToAll(idx, data) {
    return Object.assign(Object.assign({}, data), { submissions: data.submissions.map(sub => (Object.assign(Object.assign({}, sub), { prizes: sub.prizes.indexOf(idx) < 0 ?
                sub.prizes.concat([idx]) : sub.prizes }))) });
}
exports.assignPrizeToAll = assignPrizeToAll;
function addCategory(name, data) {
    return Object.assign(Object.assign({}, data), { categories: data.categories.concat([{
                name,
                track: 0
            }]), tracks: data.tracks.length > 0 ? data.tracks : [{
                name: "Default Track"
            }] });
}
exports.addCategory = addCategory;
function expandCategory(idx, data) {
    let newCategories = [];
    for (let i = 0; i < data.categories.length; i++) {
        if (i === idx) {
            for (let track = 0; track < data.tracks.length; track++) {
                newCategories.push({
                    name: data.categories[idx].name,
                    track
                });
            }
        }
        else {
            newCategories.push(data.categories[i]);
        }
    }
    return Object.assign(Object.assign({}, data), { categories: newCategories });
}
exports.expandCategory = expandCategory;
function cycleTrackOnCategory(idx, data) {
    return Object.assign(Object.assign({}, data), { categories: data.categories.map((cat, i) => (Object.assign(Object.assign({}, cat), { track: idx === i ? (cat.track + 1) % data.tracks.length : cat.track }))) });
}
exports.cycleTrackOnCategory = cycleTrackOnCategory;
function getSubmissionPrizes(data) {
    let result = [];
    for (let i = 0; i < data.submissions.length; i++) {
        for (let prize of data.submissions[i].prizes) {
            result.push({
                submission: i,
                prize
            });
        }
    }
    return result;
}
exports.getSubmissionPrizes = getSubmissionPrizes;
//# sourceMappingURL=SetupData.js.map