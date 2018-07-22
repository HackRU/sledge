import m from "mocha";
import a from "assert";

import {SocketCommunication} from "./server.js";

m.describe("SocketCommunication", () => {
  m.describe("#constructor", () => {
    m.it("Can be constructed", () => {
      new SocketCommunication(null, null);
    });
  });
});
