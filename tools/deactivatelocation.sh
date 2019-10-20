#!/usr/bin/env bash
sqlite3 "$1" "$(cat << EOF
UPDATE Submission
SET active=0
WHERE location=$2;
EOF
)"
