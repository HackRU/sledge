#!/usr/bin/env bash
sqlite3 "$1" "$(cat << EOF
SELECT Track.name, AVG(score), Submission.name
FROM Rating
LEFT JOIN RatingAssignment ON RatingAssignment.id=ratingAssignmentId
LEFT JOIN Submission ON Submission.id=submissionId
LEFT JOIN Track ON Track.id=trackId
WHERE score > 0
GROUP BY trackId, submissionId
HAVING AVG(score)>0
ORDER BY trackId, AVG(score)
EOF
)"
