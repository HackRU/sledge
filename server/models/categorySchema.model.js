const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @swagger
 *  components:
 *    schemas:
 *      Category:
 *        type: object
 *        properties:
 *          name:
 *            type: String
 *            description: Name of the category.
 *          companyName:
 *            type: String
 *            description: Name, if any, of the company that is sponsoring this category.
 *          type:
 *            type: String
 *            description: Type of the category, can either be a track or a superlative.
 */
const categorySchema = new Schema({
  name: String, // category name
  companyName: String, // null if prize is not company-sponsored
  type: String, // track/superlative
});

module.exports = mongoose.model('category', categorySchema);
