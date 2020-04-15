import {
  GetFullScoresResponseData
} from "../shared/GetFullScoresRequestTypes";

/**
 * From the response data calculate the plain average and the judge weighted
 * average for each submission. The function should return an array with an entry
 * for each submission that had at least one rating and include the average score
 * and weighted average score.
 *
 * The plain average is the average of all "rating" properties on inactive rating
 * assignments of that submission.
 *
 * The judge weighted average is the average of the "rating" properties like the
 * plain avearge, but before averaging each is multiplied by normalization factor
 * specific to the judge that rated it. This normalization factor is the reciprocal
 * of the average of the average score the judge gives to all submissions it has
 * rated. For instance if he rated a set of submissions .2, .5 and .8 respectively,
 * the normalization factor would be 3/(.2+.5+.8)=2 and the weighted score for the
 * first would be .2*2=.4
 */
export function calculateAverages(responseData: GetFullScoresResponseData): SubmissionAverageStatistics {
  let cloned = [...responseData.assignments];
  let subIndices: Array<number | undefined> = [];

  //The for loop iterates through the assignments array
  //Then it checks if the type is 1 and it is not active
  //Then if subIndices array doesnt contain the respective submission Index, then add it to subIndices array
  for (var i = 0; i < cloned.length; i++) {
    if (cloned[i].type === 1 && !(cloned[i].active)) {
      if ((!subIndices.includes(cloned[i].submissionIndex)) && (!cloned[i].submissionIndex === undefined)) {
        subIndices.push(cloned[i].submissionIndex);
      }
    }
  }
  //After for loop, subIndices array is populated with unique submission Inds

  //Now, run through subInd array and populate result array with scores for each submission from cloned
  let avgArray: Array<SubmissionAverageStatistics> = [];;
  for (var j = 0; j < subIndices.length; j++) {
    var average = 0;
    var count = 0;
    var sum = 0;
    for (var k = 0; k < cloned.length; k++) {
      if (cloned[k].submissionIndex === subIndices[j]) {
        if (cloned[k].rating === undefined) {
          sum = 0;
          count = 0;
          continue;
        }
        else {
          sum = cloned[k].rating + sum;
          count++;
        }
      }
      else {
        sum = 0;
        count = 0;
        continue;
      }
    }
    average = sum/count;
    avgArray.push(subIndices[j],average,0);
  }

  return avgArray;
}

export interface SubmissionAverageStatistics {
  [idx: number]: {
    id: number,
    plainAverage: number,
    judgeWeightedAverage: number
  }
}
