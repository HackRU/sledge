import { DataStore } from "./database.js";

//
// Client-Server events
//

/**
 * For client-server "add-hack" events
 */
export interface AddHack {
  name : string;
  description : string;
  location : number;
}

export const addHackSchema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "location": {
      "type": "integer"
    }
  },

  "additionalProperties": false,
  "required": ["name", "description", "location"]
};

/**
 * For client-server "add-judge" events
 */
export interface AddJudge {
  name : string;
  email : string;
}

export const addJudgeSchema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string"
    }
  },

  "additionalProperties": false,
  "required": ["name", "email"]
};

/**
 * For client-server "add-superlative" events
 */
export interface AddSuperlative {
  name : string;
}

export const addSuperlativeSchema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  },

  "additionalProperties": false,
  "required": ["name"]
};

/**
 * For client-server "authenticate" events
 */
export interface Authenticate {
  secret : string,
  userId : number
}

export const authenticateSchema = {
  "type": "object",
  "properties": {
    "secret": {
      "type": "string"
    },
    "userId": {
      "type": "integer"
    }
  },

  "additionalProperties": false,
  "required": ["secret", "userId"]
};

/**
 * For client-server "login" events
 */
export interface Login {
  judgeId : number,
  loginCode : string
}

export const loginSchema = {
  "type": "object",
  "properties": {
    "judgeId": {
      "type": "integer",
      "minimum": 1
    },
    "loginCode": {
      "type": "string"
    }
  }
};

/**
 * For client-server "rate-hack" events
 */
export interface RateHack {
  judgeId : number;
  hackId : number;
  rating : number;
}

export const rateHackSchema = {
  "type": "object",
  "properties": {
    "judgeId": {
      "type": "integer",
      "minimum": 0
    },
    "hackId": {
      "type": "integer",
      "minimum": 0
    },
    "rating": {
      "type": "integer"
    }
  },

  "additionalProperties": false,
  "required": ["judgeId", "hackId", "rating"]
};

/**
 * For client-server "rank-superlative" events
 */
export interface RankSuperlative {
  judgeId : number;
  superId : number;
  firstId : number;
  secondId : number;
}

export const rankSuperlativeSchema = {
  "type": "object",
  "properties": {
    "judgeId": {
      "type": "integer",
      "minimum": 0
    },
    "superId": {
      "type": "integer",
      "minimum": 0
    },
    "firstId": {
      "type": "integer",
      "minimum": 0
    },
    "secondId": {
      "type": "integer",
      "minimum": 0
    }
  },

  "additionalProperties": false,
  "required": ["judgeId", "superId", "firstId", "secondId"]
};

/**
 * For client-server "subscribe-database" events
 *
 * Note: There is no data associated with this event, so the client should
 *       send an empty object
 */
export interface SubscribeDatabase {
};

export const subscribeDatabaseSchema = {
  "type": "object",
  "maxProperties": 0
};

//
// Server-Client events
//
// Note: Since the client doesn't check schemas, we don't maintain schemas for
//       server-client events.
//

/**
 * For server-client "authenticate-response" events
 */
export interface AuthenticateResponse {
  success : boolean;
  userId : number;
  judgeId : number;
}

/**
 * For server-client "login-response" events
 */
export interface LoginResponse {
  secret : string;
  userId : number;
}

/**
 * For server-client "protocol-error" events
 */
export interface ProtocolError {
  original : string;
  message : string;
}

/**
 * For server-client "transient-response" events
 */
export interface TransientResponse {
  original : string;
  message : string;
}

/**
 * For server-client "update-full" events
 */
export interface UpdateFull {
  database : DataStore;
}

/**
 * For server-client "update-partial" events
 */
export interface UpdatePartial {
  diff : DataStore;
}
