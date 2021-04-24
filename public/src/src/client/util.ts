export function segue(to: string) {
  if (to[0] === "/") {
    const base = window.location.protocol + "//" + window.location.host;
    const url = base + to;
    window.location.href = url;
  } else {
    window.location.href = to;
  }
}
