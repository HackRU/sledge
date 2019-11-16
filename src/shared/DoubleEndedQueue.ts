export class DoubleEndedQueue<T> {
  private top: Array<T>;
  private middle: Iterator<T>;
  private middleDone: boolean;
  private bottom: Array<T | null>;
  private bottomIndex: number;

  constructor(initial?: Iterable<T>) {
    if (initial) {
      this.middle = initial[Symbol.iterator]();
    } else {
      this.middle = {
        next: () => ({done: true, value: null})
      };
    }

    this.top = [];
    this.middleDone = false;
    this.bottom = [];
    this.bottomIndex = 0;
  }

  next(): T {
    if (this.top.length > 0) {
      return this.top.pop()!;
    }

    if (!this.middleDone) {
      let n = this.middle.next();
      if (n.done) {
        this.middleDone = true;
      } else {
        return n.value;
      }
    }

    if (this.bottomIndex < this.bottom.length) {
      let next = this.bottom[this.bottomIndex];
      this.bottom[this.bottomIndex] = null;
      return next!;
    }

    throw new Error("DoubleEndedQueue: Queue is empty!");
  }

  peek(): T {
    let c = this.next();
    this.top.push(c);
    return c;
  }

  hasNext(): boolean {
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

  append(value: T) {
    this.top.push(value);
  }

  enqueue(value: T) {
    this.bottom.push(value);
  }
}
