#!/bin/sh
set -u

PATH="$PWD/bin:$PWD/node_modules/.bin:$PATH"
export DEBUG=sledge

sledge &
SLEDGE_PID=$!

while inotifywait -r -e close_write ./src
do
  kill $SLEDGE_PID
  make -j2
  sledge &
  SLEDGE_PID=$!
done

kill $SLEDGE_PID
