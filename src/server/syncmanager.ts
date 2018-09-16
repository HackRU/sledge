import {
  SynchronizeGlobal,
  SynchronizeJudge
} from "../protocol/events";

import {ServerEventWrapper} from "./eventwrapper";
import {DatabaseConnection} from "./persistence";
import {ClientStateManager} from "./clientstatemanager";

// TODO:
//  - Send global updates at most once every few seconds
//  - Have partial updates

// Minimum time allowed between global syncs
const MIN_SYNC_DELAY = 500;

export class SyncManager {
  private lastGlobalSync: number;
  private globalSyncTimer: NodeJS.Timer;

  constructor(
    private events: ServerEventWrapper,
    private db: DatabaseConnection,
    private clients: ClientStateManager
  ) {
    this.lastGlobalSync = 0;
    this.globalSyncTimer = null;
  };

  private getUnprivilegedGlobalData(): Partial<SynchronizeGlobal> {
    return {
      hacks: this.db.getAllHacks(),
      judges: this.db.getAllJudges(),
      superlatives: this.db.getAllSuperlatives(),
      superlativeHacks: this.db.getAllSuperlativeHacks(),
      categories: this.db.getAllCategories()
    };
  }

  private getAdminGlobalData(): Partial<SynchronizeGlobal> {
    return {
      judgeHackMatrix: this.db.getJudgeHackMatrix(),
      ratings: this.db.getRatingsOfAllJudges()
    };
  }

  private getJudgeData(judgeId: number): SynchronizeJudge {
    return {
      judgeId,
      hackIds: this.db.getHackIdsOfJudge(judgeId),
      ratings: this.db.getRatingsOfJudge(judgeId),
      superlativePlacements: this.db.getSuperlativePlacementsOfJudge(judgeId)
    };
  }

  sendGlobalSync(sid: string) {
    let data: SynchronizeGlobal;
    if (this.clients.can(sid, 0)) {
      data = {
        isFull: true,
        ...this.getUnprivilegedGlobalData(),
        ...this.getAdminGlobalData()
      } as SynchronizeGlobal;
    } else {
      data = {
        isFull: true,
        ...this.getUnprivilegedGlobalData()
      } as SynchronizeGlobal;
    }

    this.events.sendSynchronizeGlobal(sid, data);
  }

  sendJudgeSync(sid: string) {
    let client = this.clients.getClientState(sid);
    if (client.syncJudge <= 0) return;

    let data = this.getJudgeData(client.syncJudge);
    this.events.sendSynchronizeJudge(sid, data);
  }

  scheduleFullGlobalSync() {
    let now = Date.now();
    let diff = now - this.lastGlobalSync;
    if (diff > MIN_SYNC_DELAY) {
      if (this.globalSyncTimer) {
        clearTimeout(this.globalSyncTimer);
        this.globalSyncTimer = null;
      }

      this.lastGlobalSync = now;
      this.sendFullGlobalSync();
    } else if (!this.globalSyncTimer) {
      this.globalSyncTimer = setTimeout(() => {
        this.lastGlobalSync = now;
        this.sendFullGlobalSync();
        this.globalSyncTimer = null;
      }, diff);
    }
  }

  sendFullGlobalSync() {
    // Get list of clients we need to send updates to
    let clients = this.clients.getGloballySyncedClients();

    // Information we're sending in the update
    let {
      hacks, judges, superlatives, superlativeHacks, categories
    } = this.getUnprivilegedGlobalData() as any;
    let {
      judgeHackMatrix, ratings
    } = this.getAdminGlobalData() as any;

    // Sync data for admins
    let adminSync: SynchronizeGlobal = {
      isFull: true,
      hacks, judges, superlatives, superlativeHacks, categories,
      judgeHackMatrix, ratings
    };

    // Sync data for non-admins
    let regularSync: SynchronizeGlobal = {
      isFull: true,
      hacks, judges, superlatives, superlativeHacks, categories
    };

    // Send data to clients
    for (let client of clients) {
      let data = client.privilege === 0 ? adminSync : regularSync;
      this.events.sendSynchronizeGlobal(client.sid, data);
    }
  }

  // TODO: Buffer
  scheduleFullJudgeSync(judgeId: number) {
    let clients = this.clients.getJudgeSyncedClients(judgeId);
    let data = this.getJudgeData(judgeId);

    this.clients.getJudgeSyncedClients(judgeId).forEach(client => {
      this.events.sendSynchronizeJudge(client.sid, data);
    });
  }
}
