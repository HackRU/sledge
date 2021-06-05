const router = require('express').Router();
const Category = require('../../models/category.model');

/**
 * @swagger
 * /api/admin/categories:
 *  post:
 *    summary: Creates a new category
 *    parameters:
 *      - in: body
 *        name: New Category
 *        required: true
 *        description: New category to add to the database
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - type
 *          properties:
 *            name:
 *              type: string
 *            companyName:
 *              type: string
 *            type:
 *              type: string
 */
router.post('/', (req, res) => {
  Category.create(req.body, (err, category) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: category.id,
    });
  });
});

/**
 * @swagger
 * /api/admin/categories/{categoryID}:
 *  delete:
 *    summary: Deletes a category with a specific ID
 *    parameters:
 *      - in: path
 *        name: categoryID
 *        required: true
 *        type: String
 *        description: the category ID
 */
router.delete('/:categoryID', async (req, res) => {
  await Category.findByIdAndDelete(req.params.categoryID, (err) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: req.params.categoryID,
    });
  });
});

/**
 * @swagger
 * /api/admin/categories:
 *  delete:
 *    summary: Deletes all the categories
 */
router.delete('/', async (req, res) => {
  await Category.deleteMany({});
  res.status(200).send();
});

/**
 * @swagger
 * /api/admin/categories/{categoryID}:
 *  patch:
 *    summary: Updates category with a specific category ID
 *    parameters:
 *      - in: path
 *        name: categoryID
 *        required: true
 *        type: String
 *        description: the category ID
 *      - in: body
 *        name: New Fields
 *        required: true
 *        description: contains all the new fields that the updated category will have, so if
 *                     the object has any field the category has, said field will be
 *                     replaced by the object's value.
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            companyName:
 *              type: string
 *            type:
 *              type: string
 */
router.patch('/:categoryID', async (req, res) => {
  const categoryToUpdate = await Category.findById(req.params.categoryID);

  if ('name' in req.body) {
    categoryToUpdate.name = req.body.name;
  }

  if ('companyName' in req.body) {
    categoryToUpdate.companyName = req.body.companyName;
  }

  if ('type' in req.body) {
    categoryToUpdate.type = req.body.type;
  }

  categoryToUpdate.save();

  res.status(200).json({
    message: 'success',
    id: req.params.categoryID,
  });
});

/**
 * @swagger
 * /api/admin/categories:
 *  get:
 *    summary: Returns all the categories
 */
router.get('/', async (req, res) => {
  res.status(200).send(await Category.find({}));
});

/**
 * @swagger
 * /api/admin/categories/{categoryID}:
 *  get:
 *    summary: Returns a category with a specific category ID
 *    parameters:
 *      - in: path
 *        name: categoryID
 *        required: true
 *        type: String
 *        description: the category ID
 */
router.get('/:categoryID', async (req, res) => {
  await Category.findById(req.params.categoryID, (err, category) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: category.id,
    });
  });
});

module.exports = router;
