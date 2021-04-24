"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleEndedQueue = void 0;
class DoubleEndedQueue {
    constructor(initial) {
        if (initial) {
            this.middle = initial[Symbol.iterator]();
        }
        else {
            this.middle = {
                next: () => ({ done: true, value: null })
            };
        }
        this.top = [];
        this.middleDone = false;
        this.bottom = [];
        this.bottomIndex = 0;
    }
    next() {
        if (this.top.length > 0) {
            return this.top.pop();
        }
        if (!this.middleDone) {
            let n = this.middle.next();
            if (n.done) {
                this.middleDone = true;
            }
            else {
                return n.value;
            }
        }
        if (this.bottomIndex < this.bottom.length) {
            let next = this.bottom[this.bottomIndex];
            this.bottom[this.bottomIndex] = null;
            return next;
        }
        throw new Error("DoubleEndedQueue: Queue is empty!");
    }
    peek() {
        let c = this.next();
        this.top.push(c);
        return c;
    }
    hasNext() {
        if (this.top.length > 0 || this.bottomIndex < this.bottom.length) {
            return true;
        }
        if (this.middleDone) {
            return false;
        }
        let n = this.middle.next();
        if (n.done) {
            this.middleDone = true;
            return false;
        }
        this.top.push(n.value);
        return true;
    }
    append(value) {
        this.top.push(value);
    }
    enqueue(value) {
        this.bottom.push(value);
    }
}
exports.DoubleEndedQueue = DoubleEndedQueue;
//# sourceMappingURL=DoubleEndedQueue.js.map