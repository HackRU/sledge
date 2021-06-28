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

const submissionSchema = new Schema({
  state: String,
  teamId: mongoose.Types.ObjectId, // the _id of the team which the submission belongs to
  attributes: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: { type: [String], default: [] },
  },
  urls: { type: [{ _id: false, label: String, url: String }], default: [] },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
  flags: { type: [String], default: [] },
  numFlags: { type: Number, default: 0 },
  visible: Boolean,
});

module.exports = mongoose.model('submission', submissionSchema);
