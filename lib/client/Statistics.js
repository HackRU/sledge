"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAverages = void 0;
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
function calculateAverages(responseData) {
    throw new Error("Not Yet Implemented");
}
exports.calculateAverages = calculateAverages;
//# sourceMappingURL=Statistics.js.map