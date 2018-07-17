export function getSession() : Session {
  let secret = localStorage.getItem("secret") || "";
  let judgeId = parseInt(localStorage.getItem("judgeId"));
  return {
    secret,
    judgeId: Number.isNaN(judgeId) ? undefined : judgeId
  };
}

export function setSession(session : Session) {
  localStorage.setItem("secret", session.secret);
  localStorage.setItem("judgeId", session.judgeId == null ?
    "" : session.judgeId.toString(10));
}

export interface Session {
  secret : string;
  judgeId? : number;
}
