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

BEGIN;

-------------------
-- CREATE TABLES --
-------------------

CREATE TABLE Status (
  id INTEGER NOT NULL PRIMARY KEY,

  timestamp INTEGER NOT NULL,

  phase INTEGER NOT NULL,

  CHECK(id=1)
);

CREATE TABLE Submission (
  id INTEGER NOT NULL PRIMARY KEY,

  name TEXT NOT NULL,
  location INTEGER NOT NULL,

  CHECK(location > 0)
);

CREATE TABLE Judge (
  id INTEGER NOT NULL PRIMARY KEY,

  name TEXT NOT NULL,

  anchor INTEGER
);

CREATE TABLE Prize (
  id INTEGER NOT NULL PRIMARY KEY,

  name TEXT NOT NULL,
  isOverall INTEGER
);

CREATE TABLE Category (
  id INTEGER NOT NULL PRIMARY KEY,

  name TEXT NOT NULL
);

CREATE TABLE SubmissionPrize (
  id INTEGER NOT NULL PRIMARY KEY,

  submissionId INTEGER NOT NULL,
  prizeId INTEGER NOT NULL,

  eligibility INTEGER NOT NULL,

  FOREIGN KEY(submissionId) REFERENCES Submission(id),
  FOREIGN KEY(prizeId) REFERENCES Prize(id),
  UNIQUE(submissionId, prizeId),
  CHECK((eligibility = 0) OR (eligibility = 1))
);

CREATE TABLE Assignment (
  id INTEGER NOT NULL PRIMARY KEY,

  judgeId INTEGER NOT NULL,
  priority INTEGER NOT NULL,

  -- Whereas 1 is numerical (RatingAssignment) and 2 is comparative (RankingAssignment)
  type INTEGER NOT NULL,
  active INTEGER NOT NULL,

  FOREIGN KEY(judgeId) REFERENCES Judge(id),
  UNIQUE(judgeId, priority),
  CHECK(priority > 0),
  CHECK((type = 1) OR (type = 2)),
  CHECK((active = 0) OR (active = 1))
);

CREATE TABLE RatingAssignment (
  id INTEGER NOT NULL PRIMARY KEY,

  assignmentId INTEGER NOT NULL,
  submissionId INTEGER NOT NULL,

  noShow INTEGER,
  rating INTEGER,

  FOREIGN KEY(assignmentId) REFERENCES Assignment(id),
  FOREIGN KEY(submissionId) REFERENCES Submission(id),
  UNIQUE(assignmentId),
  CHECK((noShow = 0) OR (noShow = 1))
);

CREATE TABLE Rating (
  id INTEGER NOT NULL PRIMARY KEY,

  ratingAssignmentId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  score INTEGER NOT NULL,

  FOREIGN KEY(ratingAssignmentId) REFERENCES RatingAssignment(id),
  FOREIGN KEY(categoryId) REFERENCES Category(id),
  UNIQUE(ratingAssignmentId, categoryId)
);

CREATE TABLE RankingAssignment (
  id INTEGER NOT NULL PRIMARY KEY,

  assignmentId INTEGER NOT NULL,
  prizeId INTEGER NOT NULL,

  FOREIGN KEY(assignmentId) REFERENCES Assignment(id),
  FOREIGN KEY(prizeId) REFERENCES Prize(id),
  UNIQUE(assignmentId)
);

CREATE TABLE Ranking (
  id INTEGER NOT NULL PRIMARY KEY,

  rankingAssignmentId INTEGER NOT NULL,
  submissionId INTEGER NOT NULL,

  rank INTEGER,
  score INTEGER,

  FOREIGN KEY(rankingAssignmentId) REFERENCES RankingAssignment(id),
  FOREIGN KEY(submissionId) REFERENCES Submission(id)
);

----------------
-- Data Setup --
----------------

-- We expect sqlite to automatically convert strftime to an integer
INSERT INTO Status(timestamp, phase) VALUES(strftime('%s', 'now'), 1);

COMMIT;
