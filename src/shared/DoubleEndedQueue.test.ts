import * as deq from "./DoubleEndedQueue";

describe("DoubleEndedQueue", () =>{
test("Checks whether the queue is empty or not", () =>{
    let q = new deq.DoubleEndedQueue();
    expect(q.hasNext()).toBe(false);
    q.append(5);
    expect(q.hasNext()).toBe(true);
    q.enqueue(10);
    expect(q.peek()).toBe(5);
    expect(q.next()).toBe(5);
  })
})
