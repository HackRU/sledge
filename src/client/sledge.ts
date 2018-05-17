import * as io from "socket.io-client";

import * as evts from "../protocol/events.js";

export class SledgeClient {
  socket : SocketIOClient.Socket;
  subscribers : Array<Subscriber>;
  initialized : boolean;
  store : TableStore;

  constructor(opts : SledgeOptions) {
    this.store = {
      hacks: [],
      judges: [],
      judgeHacks: [],
      superlatives: [],
      superlativePlacements: []
    };

    this.socket = io(opts.host);

    this.socket.on("protocol-error",
      (data:evts.ProtocolError) => this.onProtocolError(data) );
  }

  private updateTables(data : TableStore) {
    let unsafeStore = <any>this.store;

    let tables = ["hacks", "judges", "judgeHacks", "superlatives", "superlativePlacements"];
    for (let table of tables) {
      let rows : LocalTable<{ id : number | undefined }> = unsafeStore[table];
      for (let row of rows) {
        if (row && row.id) {
          unsafeStore[table][row.id] = row;
        }
      }
    }
  }

  private sendChange(evt : SledgeEvent) {
    for (let sub of this.subscribers) {
      sub.notify(evt);
    }
  }

  private onProtocolError(data : evts.ProtocolError) {
    alert(data.message);
  }
};

export interface SledgeOptions {
  host : string;
};

export interface SledgeEvent {
};

interface Subscriber {
  notify : (e:SledgeEvent) => void;
};

class LocalDatabase {
  store : TableStore;

  constructor() {
  }
};

interface TableStore {
  hacks : LocalTable<{
    id : number,
    name : string,
    description : string,
    location : number
  }>;
  judges : LocalTable<{
    id : number,
    name : string,
    email : string
  }>;
  judgeHacks : LocalTable<{
    id : number,
    judgeId : number,
    hackId : number,
    priority : number
  }>;
  superlatives : LocalTable<{
    id : number,
    name : string
  }>;
  superlativePlacements : LocalTable<{
    id : number,
    judgeId : number,
    superlativeId : number,
    firstChoiceId : number,
    secondChoiceId : number
  }>;
};

type LocalTable<T> = Array<T | undefined>;
