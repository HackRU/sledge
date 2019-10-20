#!/usr/bin/env bash
sqlite3 "$1" "$(cat << EOF
SELECT Prize.name, AVG(score), Submission.name
FROM Ranking
LEFT JOIN RankingAssignment ON RankingAssignment.id=rankingAssignmentId
LEFT JOIN Submission ON Submission.id=submissionId
LEFT JOIN Prize ON Prize.id=prizeId GROUP BY submissionId, prizeId
HAVING AVG(score)>0
ORDER BY prizeId, AVG(score)
EOF
)"
