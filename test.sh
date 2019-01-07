#!/bin/sh
set -u

PATH="$PWD/bin:$PWD/node_modules/.bin:$PATH"
PORT=8123

sledge --port $PORT &
SLEDGE_PID=$!
echo "Sledge Started (PID $SLEDGE_PID, PORT $PORT)"
sleep 3
mocha-headless-chrome -f "http://localhost:$PORT/test.html" --timeout 5000 -a no-sandbox
RESULT=$?
kill $SLEDGE_PID
exit $RESULT
