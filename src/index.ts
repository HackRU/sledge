import {start} from "./server/setup";

export function cli(argv: string[]) {
  if (argv.length > 2) {
    console.error("Too many arguments!");
    process.exit(1);
  }
}
