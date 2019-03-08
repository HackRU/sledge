#!/bin/sh
# Current directory should be the sledge toplevel

set -e
set -u

if [ "$#" -eq 0 ]; then
  TOKEN="$(head -c5 </dev/random | xxd -p)"
else
  TOKEN="$1"
fi

sqlite3 data/sledge.db "INSERT INTO Token(secret, privilege) VALUES(\"$TOKEN\", 0);"
echo "Token Added: $TOKEN"
