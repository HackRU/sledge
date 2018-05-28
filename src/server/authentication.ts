import {randomFillSync} from "crypto";

import {DatabaseConnection} from "./persistence";

export class AuthenticationManager {
  clients : Map<string, ClientAuthData>;

  constructor(private db : DatabaseConnection) {
    this.clients = new Map();
  }

  registerClient(id : string) {
    this.clients.set(id, {
      userId: -1
    });
  }

  getClientAuthData(clientId : string) {
    let client = this.clients.get(clientId);
    if (!client) {
      throw new Error("Client ID "+clientId+" has not been registered.");
    }
    return client;
  }

  setUserId(clientId : string, userId : number) {
    let client = this.getClientAuthData(clientId);
    client.userId = userId;
    this.clients.set(clientId, client);
  }

  hasPermission(clientId : string, actionUserId : number) {
    let userId = this.getClientAuthData(clientId).userId;
    return (
      // Admins can perform actions as any user
      (userId === 0) ||
      // User is authed, and action doesn't pertain to particular user
      (userId >= 0 && actionUserId === 0) ||
      // User is authed, and action pertains to that user
      (userId === actionUserId)
    );
  }

  generateToken(userId : number) : string {
    let token = randomHexToken(10);
    this.db.addToken({
      judgeId: userId,
      secret: token
    });
    return token;
  }
}

interface ClientAuthData {
  userId : number;
}

function randomHexToken(size : number) : string {
  const buffer = Buffer.alloc(size);
  randomFillSync(buffer);
  return buffer.toString("hex");
}
