/**
 * @swagger
 *  components:
 *    schemas:
 *      Submission:
 *        type: object
 *        properties:
 *          attributes:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: The name of the submission.
 *              description:
 *                type: string
 *                description: A description of the submission.
 *              technologies:
 *                type: string
 *                description: The technologies the hackers used in their submission.
 *          urls:
 *            type: array
 *            description: A list of the URLs for the submission.
 *            items:
 *              type: object
 *              properties:
 *                label:
 *                  type: string
 *                  description: What the URL leads to.
 *                url:
 *                  type: string
 *          categories:
 *            type: array
 *            description: A list of categories the submission is submitted to.
 *            items:
 *              type: string
 *          flags:
 *            type: array
 *            items:
 *              type: string
 *          numFlags:
 *            type: integer
 *          removedFromJudging:
 *            type: boolean
 *            description: Whether or not the submission is visible in the judging queue.
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const submissionSchema = new Schema(
  // {
  //   isSubmitted: Boolean,
  //   attributes: {
  //     title: { type: String, default: '' },
  //     description: String,
  //     technologies: [String],
  //   },
  //   urls: [{ _id: false, label: String, url: String }],
  //   categories: [{ _id: false, categoryID: String, categoryName: String }],
  //   flags: [String],
  //   numFlags: Number,
  //   removedFromJudging: Boolean,
  // },
  {
    isSubmitted: { state: String },
    attributes: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      technologies: { type: [String], default: [] },
    },
    urls: { type: [{ _id: false, label: String, url: String }], default: [] },
    categories: {
      _id: String
    },
    flags: { type: [String], default: [] },
    numFlags: { type: Number, default: 0 },
    removedFromJudging: { visible: Boolean },
  },
);

module.exports = mongoose.model('submission', submissionSchema);
