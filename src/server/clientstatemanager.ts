import {ServerEventWrapper} from "./eventwrapper";
import {DatabaseConnection} from "./persistence";

/**
 * Manages in-memory state for connected clients
 */
export class ClientStateManager {
  private clients: Map<string, ClientState>;

  constructor() {
    this.clients = new Map();
  }

  registerClient(sid: string) {
    this.clients.set(sid, {
      sid,
      privilege: -1,
      syncGlobal: false,
      syncJudge: 0
    });
  }

  getClientState(sid: string): ClientState {
    return { ...this.clients.get(sid) }
  }

  setClientState(sid: string, newClientState: ClientState) {
    this.clients.set(sid, newClientState);
  }

  /**
   * Can the client perform the privileged action?
   */
  can(sid: string, testPrivilege: number): boolean {
    let clientPrivilege = this.clients.get(sid).privilege;
    return (
      clientPrivilege === 0 ||
      clientPrivilege === testPrivilege ||
      testPrivilege < 0
    );
  }

  setClientPrivilege(sid: string, newPrivilege: number) {
    let clientState = this.clients.get(sid);
    clientState.privilege = newPrivilege;
  }

  getClientPrivilege(sid: string): number {
    return this.clients.get(sid).privilege;
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

  getGloballySyncedClients(): Array<ClientState> {
    return this.getFilteredClients(c => c.syncGlobal);
  }

  getJudgeSyncedClients(judgeId: number): Array<ClientState> {
    return this.getFilteredClients(c => c.syncJudge === judgeId);
  }
}

export interface ClientState {
  sid: string;
  privilege: number;
  syncGlobal: boolean;
  syncJudge: number;
}
