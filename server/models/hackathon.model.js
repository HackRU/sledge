import categorySchemaModel from './category.model';

const mongoose = require('mongoose');

const { Schema } = mongoose;
/**
 * @swagger
 *  components:
 *    schemas:
 *      Hackathon:
 *        type: object
 *        properties:
 *          season:
 *            type: string
 *            description: The season of the hackathon. (ex. Spring 2020, Fall 2019)
 *          categories:
 *            type: array
 *            description: A list of categories in the hackathon
 *            items:
 *              type: categorySchema
 *              description: A category. See the documentation for the category schema.
 *          submissionPhase:
 *            type: object
 *            description: Object that indicates whether the hackathon is in the
 *                         submission phase, stores the deadline and stores the
 *                         submissions that have been submitted.
 *            properties:
 *              inProgress:
 *                type: boolean
 *                default: false
 *                description: Indicates if the submissions phase is in progress.
 *              deadline:
 *                type: Date
 *                description: Deadline to submit submissions. If the deadline is
 *                             reached, set inProgress to false.
 *              flags:
 *                type: array
 *                description: Array of submissions that have been submitted.
 *                items:
 *                  type: ObjectId
 *                  ref: submission
 *          judgingPhase:
 *            type: object
 *            description: Object that indicates whether the judging phase is
 *                         in progress, and also stores relevant data.
 *            properties:
 *              inProgress:
 *                type: boolean
 *                default: false
 *                description: Indicates whether is judging phase is in progress.
 *                             if submissionPhase is in progress, then this MUST
 *                             be true.
 *          isComplete:
 *            type: boolean
 *            default: false
 *            description: Indicates whether the hackathon is over.
 */
const hackathonSchema = new Schema({
  season: String, // ex. Spring 2021
  categories: {
    type: [categorySchemaModel],
  }, // _id refers to a Category.
  submissionPhase: {
    inProgress: { type: Boolean, default: false }, // is submissions phase in progress.
    deadline: Date, // automatically set inProgress to false when deadline is reached. Optional.
    flags: { type: [mongoose.Schema.Types.ObjectId], ref: 'submission' }, // array of submissions. _id refers to a Submission.
  },
  judgingPhase: {
    // is judging phase in progress. Defaults to false. If submissionPhase inProgress is true,
    // then this MUST be false. Can be enforced in frontend.
    inProgress: { type: Boolean, default: false },
  },
  isComplete: { type: Boolean, default: false }, // is hackathon over. Defaults to false.
});

module.exports = mongoose.model('hackathon', hackathonSchema);
