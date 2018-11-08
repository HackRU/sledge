import {log} from "./log";

/**
 * Manages in-memory state for connected clients
 */
export class ClientStore {
  private clients: Map<string, ClientState>;

  constructor() {
    this.clients = new Map();
  }

  /**
   * Registers a client with the store
   */
  registerClient(sid: string) {
    this.clients.set(sid, {
      sid,
      privilege: -1,
      syncGlobal: false,
      syncJudge: 0
    });

    log(`Client Registered: ${sid}`);
  }

  /**
   * Get a readonly copy of the client's state
   */
  getClientState(sid: string): ClientState {
    return this.clients.get(sid);
  }

  /**
   * Set the client state to a readonly value
   */
  setClientState(sid: string, newClientState: ClientState) {
    this.clients.set(sid, newClientState);
  }

  setClientPrivilege(sid: string, privilege: number) {
    let oldState = this.clients.get(sid);
    this.clients.set(sid, {
      ...oldState,
      privilege
    });
  }

  /**
   * Test if the client can perform a privileged action
   */
  can(sid: string, testPrivilege: number): boolean {
    let clientPrivilege = this.clients.get(sid).privilege;
    return (
      clientPrivilege === 0 ||
      clientPrivilege === testPrivilege ||
      testPrivilege < 0
    );
  }

  /**
   * Get states of clients who are synced globally
   */
  getGloballySyncedClients(): Array<ClientState> {
    return this.getFilteredClients(c => c.syncGlobal);
  }

  /**
   * Get states of clients who are synced to a judge
   */
  getJudgeSyncedClients(judgeId: number): Array<ClientState> {
    return this.getFilteredClients(c => c.syncJudge === judgeId);
  }

  private getFilteredClients(f: (c:ClientState) => boolean): Array<ClientState> {
    let filteredClients: Array<ClientState> = [];
    this.clients.forEach(client => {
      if ( f(client) ) {
        filteredClients.push(client);
      }
    });

    return filteredClients;
  }
}

export interface ClientState {
  /** The corresponding nodejs sid, which should be unique */
  sid: string;
  /** The privilige of the client (see src/protocol/events.ts) */
  privilege: number;
  /** Is client synced globaly? */
  syncGlobal: boolean;
  /** If synced to judge, ID of judge otherwise 0 */
  syncJudge: number;
}
