const express = require('express');
const { route } = require('..');
const Submission = require('../models/submission.model');

const router = express.Router();

router
    .route('/')
    .get(async({res}) =>{
        res.status(200).send(await Submission.find({}));
    })
    .post((req,req) => {
        // console.log(req.body);
        Submission.create(
            {
            urls: req.body.urls,
            attributes: {
                description: req.body.description,
                technologies: req.body.technologies,
                title: req.body.title,
            },
        
            // categories: req.body.categories,
            // there is no teamId, state, categories, flags,
            // provided in the form. also, no way to handle
            // images atm.
            },
            (err, submission) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).json({
                message: 'success',
                id: submission.id,
                });
            }
            },
        );
    })
router
    .route('/:submissionID')
    .get(async(req,res)=>{
        await Submission.findById(req.params.submissionID, (err, submission) => {
            if (err) res.status(500).send(err);
            res.status(200).send(submission);
          });
    })
    //update submission with new info
    .patch(async(req,res)=>{
        await Submission.findOneAndUpdate(req.params.submissionID, req.body, {
            new: true,
          });
        
          res.status(200).send(await Submission.findById(req.params.submissionID));
    });




modules.exports = router; 
/**
 * @swagger
 * /api/submissions:
 *  get:
 *    summary: Retrieve a list of all of the submissions
 *    produces:
 *       - application/json
 *    tags:
 *      - submissions
 */


/**
 * @swagger
 * /api/submissions/{teamID}/{submissionID}:
 *   get:
 *     summary: Retrieves the specified submission from the specified team
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: submissionID
 *         required: true
 *         type: string
 *         description: The submission ID
 *     tags:
 *       - submissions
 */


/**
 * @swagger
 * /api/submissions/{teamID}/create:
 *   post:
 *     summary: Creates a new submission
 *     responses:
 *       200:
 *       produces:
 *         - application/json
 *     parameters:
 *       - in: path
 *         name: teamID
 *         required: true
 *         type: string
 *         description: The team ID
 *       - in: path
 *         name: submissionID
 *         required: true
 *         type: string
 *         description: The submission ID
 *     tags:
 *       - submissions
 */