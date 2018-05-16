/**
 * For client-server "add-hack" events
 */
export interface AddHack {
  name : string;
  description : string;
  location : number;
};

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
};

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
};

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
 * For client-server "rank-superlative" events
 */
export interface RankSuperlative {
  judgeId : number;
  superId : number;
  firstId : number;
  secondId : number;
};

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
 * For client-server "rate-hack" events
 */
export interface RateHack {
  judgeId : number;
  hackId : number;
  rating : number;
};

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
 * For server-client "protocol-error" events
 */
export interface ProtocolError {
  original : string;
  message : string;
};

export const protocolErrorSchema = {
  "type": "object",
  "properties": {
    "original": {
        "type": "string"
    },
    "message": {
        "type": "string"
    }
  },

  "additionalProperties": false,
  "required": ["judgeId", "hackId", "rating"]
};
