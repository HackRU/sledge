#!/usr/bin/env bash
sqlite3 "$1" "$(cat << EOF
update Assignment set priority=priority+100 where type=1;
EOF
)"
