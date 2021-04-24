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
const deq = __importStar(require("./DoubleEndedQueue"));
describe("DoubleEndedQueue", () => {
    test("Testing all the functions in DoubleEndedQueue", () => {
        let q = new deq.DoubleEndedQueue();
        expect(q.hasNext()).toBe(false);
        q.append(5);
        expect(q.hasNext()).toBe(true);
        q.enqueue(10);
        expect(q.peek()).toBe(5);
        expect(q.next()).toBe(5);
    });
});
//# sourceMappingURL=DoubleEndedQueue.test.js.map