import {
  AsyncAction
} from "./types.js";

export function initialize(secret: string): AsyncAction {
  return (dispatch, getState, client) => {
    client.sendAuthenticate({secret}).then(function (res) {
      if (!res.success) {
        fail(res.message)(dispatch, getState, client);
      }
    });
  };
}

export function fail(message: string, error?: Error): AsyncAction {
  return (dispatch, getState, client) => {
    alert("ERROR: "+message+" (details in console)");
    if (error) console.error(error);
  };
}

export function prevHack(): AsyncAction {
  throw new Error("NYI");
}

export function openList(): AsyncAction {
  throw new Error("NYI");
}

export function nextHack(): AsyncAction {
  throw new Error("NYI");
}
