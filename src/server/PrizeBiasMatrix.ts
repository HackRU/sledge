import { range } from "../shared/util";

const JUDGES_PER_PRIZE = 2;

/**
 * Given a number of judges, a number of submissions, a number of
 * prizes and a matrix of whether a submission is eligible for a
 * given prize, returns a matrix of which judges should be assigned
 * to which prizes, such that at least two judges are assigned to
 * every prize.
 *
 * The goal is to minimize (or approximately minimize) the max number
 * of submissions a judge would need to visit if they were to visit
 * every submissions eligible for any prize they are assigned.
 *
 * I'm not sure what the best way to do this is, so I just take the
 * greedy approach and assign prizes one by one each time trying to
 * minimize the above.
 *
 * @param judges number of judges
 * @param submissions number of submissions
 * @param prizes number of prizes
 * @param submissionPrizesMatrx a boolean matrix such that
 *        `matrix[submission][prize]` is true iff the submission is
 *        eligible for that prize
 * @return A matrix such that `matrix[judge][prize]` is true iff in
 *         calculated assignments the judge is assigned to that prize
 */
export function calcJudgePrizeMatrix(
  judges: number,
  submissions: number,
  prizes: number,
  submissionPrizesMatrx: boolean[][]
): boolean[][] {
  if (judges < JUDGES_PER_PRIZE) {
    throw new Error("Very few judges");
  }

  // Max submissions a judge would need to visit so far
  let maxVisits = 0;
  // The matrix we will return of judge prize assignments
  let judgePrizes = range(judges).map(
    _s => range(prizes).map(_p => false)
  );
  // A set of the submissions eligible for each prize
  let prizeSubs = range(prizes).map(prz => {
    let s = new Set<number>();
    for (let sub=0;sub<submissions;sub++) {
      if (submissionPrizesMatrx[sub][prz]) {
        s.add(sub);
      }
    }
    return s;
  });
  // A set of all submissions a judge has been assigned
  // to so far, defined as number of submissions they
  // would have to visit
  let judgeSubmissions = range(judges).map(
    _j => new Set<number>()
  );

  for (let round=0;round<JUDGES_PER_PRIZE;round++) {
    for (let prz=0;prz<prizes;prz++) {
      // Calculate a new max visit for each judge
      let visits = range(judges).map(j => {
        // If we don't want to assign a judge to the same
        // prize twice
        if (judgePrizes[j][prz]) {
          return Number.POSITIVE_INFINITY;
        } else {
          // The max visits will be the union of their
          // previously assigned submissions and submissions
          // for the new prize
          return (new Set(
            [...judgeSubmissions[j], ...prizeSubs[prz]]
          )).size;
        }
      });

      // Find the best judge to assign
      let lowestMaxVisits = Number.POSITIVE_INFINITY;
      let judgeIdx = -1;
      for (let j=0;j<judges;j++) {
        if (visits[j] < lowestMaxVisits) {
          lowestMaxVisits = visits[j];
          judgeIdx = j;
        }
      }

      // If there wasn't one (because there's not enough judges)
      // throw an error
      if (lowestMaxVisits >= Number.POSITIVE_INFINITY) {
        throw new Error("No vaild Judge Prize bias matrix");
      }

      // Update the judge's submissions
      prizeSubs[prz].forEach(sub => {
        judgeSubmissions[judgeIdx].add(sub)
      });

      // Update the matrix
      judgePrizes[judgeIdx][prz] = true;

      // Update maxVisits
      maxVisits = Math.max(maxVisits, lowestMaxVisits);
    }
  }

  return judgePrizes;
}
