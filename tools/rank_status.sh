#!/usr/bin/env bash
echo "incomple, priority, judgid, judge"
sqlite3 "$1" "$(cat << EOF
SELECT status, priority, judgeid, name from assignment left join judge on assignment.judgeid=judge.id where type=2; 
EOF
)"
