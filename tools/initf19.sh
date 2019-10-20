#!/usr/bin/env bash
SQL_FILE="$(mktemp)"
tee "$SQL_FILE" << EOF
BEGIN;

INSERT INTO
  Track(id, name)
VALUES
  (2, "Education"),
  (3, "Environment"),
  (4, "Health"),
  (5, "Maverick");

INSERT INTO
  Category(trackId, name)
VALUES
  (1, "Default Track Category (should not display)"),
  (2, "Creativity"),
  (2, "Functionality"),
  (2, "Technical Difficulty"),
  (2, "Design"),
  (2, "[Education Track] Usefulness"),
  (3, "Creativity"),
  (3, "Functionality"),
  (3, "Technical Difficulty"),
  (3, "Design"),
  (3, "[Environment Track] Feasibility"),
  (4, "Creativity"),
  (4, "Functionality"),
  (4, "Technical Difficulty"),
  (4, "Design"),
  (4, "[Health Track] Impact"),
  (5, "Creativity"),
  (5, "Functionality"),
  (5, "Technical Difficulty"),
  (5, "Design"),
  (5, "[Maverick Track] Making a Difference");

INSERT INTO
  Judge(name)
VALUES
  ("Srikanth Sunkara (SPL)"),
  ("Lars"),
  ("George Berger"),
  ("Brian Russell"),
  ("Heena"),
  ("Mihai"),
  ("Brandon"),
  ("Sakib"),
  ("Carlin"),
  ("Qasim"),
  ("Srihari"),
  ("Heman"),
  ("Riggy"),
  ("Manny :)"),
  ("Lawrence "),
  ("Krysti"),
  ("Aneesh"),
  ("Jhanvi"),
  ("Additional Judge 1"),
  ("Additional Judge 2"),
  ("Additional Judge 3"),
  ("Additional Judge 4"),
  ("Additional Judge 5"),
  ("Additional Judge 6"),
  ("Additional Judge 7");

COMMIT;
EOF

sqlite3 "$1" ".read $SQL_FILE"

rm "$SQL_FILE"
