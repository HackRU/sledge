import {resolve} from "path";

import {SetupOptions, start} from "./server/setup";

const DEFAULT_PORT = 8080;

const publicDir = resolve(__dirname, "../public");
const dataDir = resolve(process.cwd(), "data");

export function cli(argv: string[]) {
  let opts : SetupOptions = {
    port: DEFAULT_PORT,
    publicDir, dataDir
  };

  if (argv.length === 3 && argv[2] === "--version") {
    console.log("0.0.1");
    process.exit(0);
  } else if (argv.length === 3 && argv[2] === "--help") {
    console.log("usage: node %s [port]", argv[1]);
    process.exit(0);
  } else if (argv.length === 3) {
    let port = parseInt(argv[2]);
    if (isNaN(port)) {
      console.error("Invalid port!");
      process.exit(1);
    } else {
      opts.port = port;
    }
  } else if (argv.length > 2) {
    console.error("Too many arguments!");
    process.exit(1);
  }

  start(opts);
}
