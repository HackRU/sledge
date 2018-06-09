export function getSession() : Session {
  return {
    secret: localStorage.getItem("secret") || ""
  };
}

export function setSession(session : Session) {
  localStorage.setItem("secret", session.secret);
}

export interface Session {
  secret : string;
}
