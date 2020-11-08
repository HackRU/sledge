#!/usr/bin/env bash
sqlite3 "$1" "$(cat << EOF
SELECT Prize.name, score, SubmissionPrize.id, Submission.name
FROM Rating
LEFT JOIN RatingAssignment ON RatingAssignment.id=ratingAssignmentId
LEFT JOIN Submission ON Submission.id=RatingAssignment.submissionId
LEFT JOIN SubmissionPrize ON Submission.id=SubmissionPrize.submissionId
LEFT JOIN Prize ON Prize.id=prizeId GROUP BY RatingAssignment.submissionId, prizeId
HAVING score>0
ORDER BY prizeId, score
EOF
)"
