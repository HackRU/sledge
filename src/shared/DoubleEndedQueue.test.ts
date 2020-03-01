import * as deq from "./DoubleEndedQueue";

describe("DoubleEndedQueue", () =>{
test("Testing all the functions in DoubleEndedQueue", () =>{
    let q = new deq.DoubleEndedQueue();
    expect(q.hasNext()).toBe(false);
    q.append(5);
    expect(q.hasNext()).toBe(true);
    q.enqueue(10);
    expect(q.peek()).toBe(5);
    expect(q.next()).toBe(5);
  })
})
