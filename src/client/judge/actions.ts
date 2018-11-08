import {
  SynchronizeGlobal,
  SynchronizeJudge
} from "../../protocol/events";

import {
  SledgeClient,
  SledgeStatus
} from "../SledgeClient";

import {
  Action,
  AsyncAction,
  Type
} from "./types";

import {
  Session
} from "../session";

export function fail(message: string): Action {
  return {
    type: Type.Fail,
    message
  };
}

export function addLoadingMessage(message: string): Action {
  return {
    type: Type.AddLoadingMessage,
    message
  };
}

export function initialize(session: Session): AsyncAction {
  return (dispatch, getState, client) => {
    initializeAll(session, dispatch, client);
  }
}

async function initializeAll(
  session: Session,
  dispatch: (a:Action)=>void,
  client: SledgeClient
): Promise<void> {
  // Visible loading messages are important in case something goes wrong
  // during the hackathon, we can quickly diagnose what's happening. If a
  // fail occurs during loading, these will be prepended to the fail message.
  dispatch(addLoadingMessage("Loading..."));

  // Fail on disconnect
  client.subscribeStatus(s => {
    if ( s !== SledgeStatus.Connecting && s !== SledgeStatus.Connected ) {
      dispatch(fail(`Sledge Disconnected. Status: ${s}`));
    }
  });

  // Fail on ProtocolError
  client.subscribeProtocolError(data => {
    dispatch(fail(`ProtocolError for ${data.eventName}: ${data.message}`));
  });

  // First, we authenticate with the token from the session
  let authRes = await client.sendAuthenticate({
    secret: session.secret
  });
  if (!authRes.success) {
    dispatch(fail(authRes.message));
    return;
  }

  // If the session has a non-zero judgeId set, that's the judgeId we use
  // Otherwise, it's the privilege returned from auth
  let judgeId = session.judgeId || authRes.privilege;
  if (judgeId <= 0 || (authRes.privilege !== 0 && judgeId !== authRes.privilege)) {
    dispatch(fail(`Cannot use judgeId of ${judgeId} with privilege of ${authRes.privilege}`));
    return;
  }

  dispatch(addLoadingMessage(
    `Authentication successful with judgeId=${judgeId} and privilege=${authRes.privilege}`
  ));

  // Set up the handler for SynchronizedShared updates. This is a bit tricky because
  // there might be multiple updates before initialization is done.
  let initSyncData: SynchronizeGlobal;
  let removeInitialSyncHandler = client.subscribeSyncGlobal(data => {
    initSyncData = data;
  });

  // And now we can request shared sync
  let setSyncShareRes = await client.sendSetSynchronizeGlobal({syncShared: true});
  if (!setSyncShareRes.success) {
    dispatch(fail(setSyncShareRes.message));
    return;
  } else if (!initSyncData) {
    dispatch(fail("SetSynchronizeShared came back successful, but we have no data!"));
  }

  // Ensure judgeId is valid with sync data
  let judgeIdValid = false;
  for (let judge of initSyncData.judges) {
    if (judge.id === judgeId) {
      judgeIdValid = true;
      dispatch(addLoadingMessage(
        `You are ${judge.name} <${judge.email}>`
      ));
    }
  }
  if (!judgeIdValid) {
    dispatch(fail(`Can't find Judge if ID ${judgeId}`));
    return;
  }

  // We have all the information needed to prepare judging, so dispatch the event.
  dispatch({
    type: Type.PrepareJudging,
    syncData: initSyncData,
    myJudgeId: judgeId
  });

  // Setup permanent handlers for sync and hack data
  removeInitialSyncHandler();
  client.subscribeSyncGlobal(data => {
    dispatch({
      type: Type.SynchronizeShared,
      data
    });
  });
  client.subscribeSyncMyHacks(data => {
    dispatch({
      type: Type.SynchronizeMyHacks,
      data
    });
  });

  // And request My Hacks updates
  let syncMyHacksRes = await client.sendSetSynchronizeJudge({
    judgeId, syncMyHacks: true
  });
  if (!syncMyHacksRes.success) {
    dispatch(fail(syncMyHacksRes.message));
    return;
  }
}

export function openList(): AsyncAction {
  return (dispatch, getState, client) => {
    dispatch({
      type: Type.OpenList
    });
  }
}

export function openHack(hackId: number): AsyncAction {
  return (dispatch, getState, client) => {
    dispatch({
      type: Type.OpenHack,
      hackId
    });
  }
}

export function rateHack(judgeId: number, hackId: number, ratings: number[]): AsyncAction {
  return (dispatch, getState, client) => {
    client.sendRateHack({
      judgeId, hackId, ratings
    }).then(res => {
      if (!res.success) {
        dispatch(fail(res.message));
      }
    });
  }
}

export function setSuperlativeRanking(
  judgeId: number, superlativeId: number, firstChoiceId: number, secondChoiceId: number
): AsyncAction {
  return (dispatch, getState, client) => {
    client.sendRankSuperlative({
      judgeId, superlativeId, firstChoiceId, secondChoiceId
    }).then(res => {
      if (!res.success) {
        dispatch(fail(res.message));
      }
    });
  };
}
