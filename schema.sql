/*
 * Sledge - A judging system for hackathons
 * Copyright (C) 2019 The Sledge Authors

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

-- We design the tables such that all are rowid tables with id being the rowid.
-- Since this requires id to always be the primary key, tables that have
-- conceptually different primary keys are just constrained as UNIQUE.
-- Additionally we avoid deleting rows by adding additional columns which marks
-- what otherwise would be marked by nonexistence.

-- The Status table is used to store the overall state of Sledge. Should always
-- have at least one entry.
CREATE TABLE IF NOT EXISTs Status (
  id INTEGER NOT NULL PRIMARY KEY,

  -- The unix timestamp of when the state was recorded. At any given time only
  -- the latest timestamp is valid.
  timestamp INTEGER NOT NULL,

  -- At any moment Sledge can be in one of three phases
  --    1 - Setup
  --    2 - Collection
  --    3 - Results
  phase INTEGER NOT NULL
);

-- A Submission is something that needs to be judged. All submissions are
-- considered for the overall prize, and may run for additional prizes as well.
CREATE TABLE IF NOT EXISTS Submission (
  id INTEGER NOT NULL PRIMARY KEY,

  -- A human-readable name shown to judges
  name TEXT NOT NULL,

  -- The physical location relative to other submissions. Judges are given the
  -- location to know where to go, and we prefer to give judges submissions that
  -- are close to their previous judged submission.
  location INTEGER NOT NULL
);

-- A Judge has the responsibility of rating or comparing submissions to
-- determine which is best
CREATE TABLE IF NOT EXISTS Judge (
  id INTEGER NOT NULL PRIMARY KEY,

  -- Name of the Judge, so they can differentiate themselves from other judges
  name TEXT NOT NULL
);

-- A Prize is a specific item a Submission is eligible to win
CREATE TABLE IF NOT EXISTS Prize (
  id INTEGER NOT NULL PRIMARY KEY,

  -- The name of the Submission
  name TEXT NOT NULL,

  -- Determines if the prize is the overall prize. There must be exactly one
  -- overall prize. A 1 indicates the prize is the overall prize, otherwise 0.
  isOverall INTEGER NOT NULL
);

-- A Category is a specific metric used to determine how good a submission is
-- overall. For the Judge's sake numeric ratings are collected as ratings of
-- multiple categories which are summed.
CREATE TABLE IF NOT EXISTS Category (
  id INTEGER NOT NULL PRIMARY KEY,

  -- The name of the Category (ex. Functionality)
  name TEXT NOT NULL
);

-- A SubmissionPrize denotes the eligibility of a submission to win a prize.
-- Submissions are not considered for a prize unless they are eligible. This
-- table is ignored for the overall prize, where all submissions are eligible.
CREATE TABLE IF NOT EXISTS SubmissionPrize (
  id INTEGER NOT NULL PRIMARY KEY,

  -- References the Submission
  submissionId INTEGER NOT NULL,

  -- References the Prize
  prizeId INTEGER NOT NULL,

  -- Whether the submission is eligible for the prize, and a 0 denotes the
  -- submission is not eligible for the prize. Implicitly this is 0 if no row
  -- exists for a judge and submission.
  eligibility INTEGER NOT NULL,

  FOREIGN KEY(submissionId) REFERENCES Submission(id),
  FOREIGN KEY(prizeId) REFERENCES Prize(id),
  UNIQUE(submissionId, prizeId)
);

-- An Assignment is a task for a Judge to complete
CREATE TABLE IF NOT EXISTS Assignment (
  id INTEGER NOT NULL PRIMARY KEY,

  -- References the Judge completing the Assignment
  judgeId INTEGER NOT NULL,

  -- The order the Judge should complete the assignment relative to his other
  -- assignments
  priority INTEGER NOT NULL,

  -- Which prize the judge is rating based on
  prizeId INTEGER NOT NULL,

  -- An assignment can be a numeric rating (1) or a comparative ranking (2).
  -- Rating assignments are based on Categories and uses the Rating table, while
  -- Ranking ranks multiple hacks and uses the Ranking table.  Rating
  -- assignments are only valid when prizeId references the overall prize.
  type INTEGER NOT NULL,

  -- Whether or not the assignment has been completed. Is 1 if completed,
  -- otherwise 0. A completed assignment should never become uncompleted.
  isComplete INTEGER NOT NULL,

  -- The ratingSubmissionId is NULL if type is 2, otherise it references the
  -- submission to be rated.
  ratingSubmissionId INTEGER,

  -- The rankingCount is NULL if type is 1, otherwise it is the number of
  -- submissions to be ranked (ie, 3 if the judge must give the top 3
  -- submissions).
  rankingCount INTEGER,

  FOREIGN KEY(judgeId) REFERENCES Judge(id),
  FOREIGN KEY(prizeId) REFERENCES Prize(id),
  FOREIGN KEY(ratingSubmissionId) REFERENCES Submission(id),
  UNIQUE(judgeId, priority)
);

-- A rating for a particular assignment and category. Generally, for every rated
-- assignment there will be one Rating per category.
CREATE TABLE IF NOT EXISTS Rating (
  id INTEGER NOT NULL PRIMARY KEY,

  -- References the assignment to complete this rating for
  assignmentId INTEGER NOT NULL,

  -- References the category to complete this rating for
  categoryId INTEGER NOT NULL,

  -- A number -1 to 5 indicating a judge's score or the current rating state. A
  -- -1 indicates the rating has not been filled out. A 0 indicates the
  -- submission could not receive a rating (eg, the submission did not show up)
  -- and 1-5 indicates the judge's score.  A score of 0 is special in that it
  -- will not be taken into account for weighting purposes.
  score INTEGER NOT NULL,

  FOREIGN KEY(assignmentId) REFERENCES Assignment(id),
  FOREIGN KEY(categoryId) REFERENCES Category(id),
  UNIQUE(assignmentId, categoryId)
);

-- A ranking for a particular assignment and submission. For a ranked assignment
-- there will be a Ranking for every Submission within that assignment.
CREATE TABLE IF NOT EXISTS Ranking (
  id INTEGER NOT NULL PRIMARY KEY,

  -- References the assignment to complete this ranking for
  assignmentId INTEGER NOT NULL,

  -- References the submission to rank
  submissionId INTEGER NOT NULL,

  -- A number from 0 to rankingCount (on the referenced Assignment), whereas 0
  -- is unranked and 1 or greater is the ranking where lower is better
  rank INTEGER NOT NULL
);
