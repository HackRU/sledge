import {start}  from "./server";

export function main(argv) {
  if (argv.length > 2) {
    console.error("Too many arguments!");
    process.exit(1);
  }

  start();
}
