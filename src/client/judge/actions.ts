import {
  SynchronizeShared
} from "../../protocol/events.js";

import {
  AsyncAction,
  Type
} from "./types.js";

import {
  Session
} from "../session.js";

export function initialize(session: Session): AsyncAction {
  return (dispatch, getState, client) => {
    dispatch({
      type: Type.AddLoadingMessage,
      message: "Loading..."
    });

    client.sendAuthenticate({secret: session.secret}).then(function (authRes) {
      if (!authRes.success) {
        dispatch({
          type: Type.Fail,
          message: authRes.message
        });
        return;
      }

      let judgeId = session.judgeId || authRes.privilege;

      if (judgeId <= 0) {
        dispatch({
          type: Type.Fail,
          message: `Cannot use judgeId of ${judgeId}`
        });
        return;
      }

      if (authRes.privilege !== 0 && judgeId !== authRes.privilege) {
        dispatch({
          type: Type.Fail,
          message: `Cannot act as judge ${judgeId} with privilege ${authRes.privilege}`
        });
        return;
      }

      dispatch({
        type: Type.AddLoadingMessage,
        message: `Authenticated with privilege ${authRes.privilege} and judgeId ${judgeId}`
      });

      client.sendSetSynchronizeShared({syncShared: true}).then(function (syncShareRes) {
        if (!syncShareRes.success) {
          dispatch({
            type: Type.Fail,
            message: syncShareRes.message
          });
        }
      });

      // TODO: Unsubscribe after the first sync so we lose the closure

      let firstSync = true;
      client.subscribeSyncShared(syncData => {
        if (firstSync) {
          dispatch({
            type: Type.AddLoadingMessage,
            message: "Got first Sync"
          });

          let myself;
          for (let judge of syncData.judges) {
            if (judge.id === judgeId) myself = judge;
          }

          if (!myself) {
            dispatch({
              type: Type.Fail,
              message: `Cannot find judge with ID ${judgeId}`
            });
            return;
          }

          dispatch({
            type: Type.AddLoadingMessage,
            message: `You are ${myself.name} <${myself.email}>!`
          });

          // TODO:
          //  - Sync My Hacks
          //  - Add permanent handlers
          //  - dispatch PrepareJudging
        }
        firstSync = false;
      });
    });
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
