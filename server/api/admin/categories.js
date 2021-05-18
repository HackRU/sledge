const router = require('express').Router();
const Category = require('../../models/categorySchema.model');

/**
 * @swagger
 * /api/admin/categories/create:
 *  post:
 *    summary: Creates a new category
 */
router.post('/create', (req, res) => {
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
 * /api/admin/categories/delete/{categoryID}:
 *  delete:
 *    summary: Deletes a category with the given ID
 *    parameters: 
 *      - in: path
 *        name: categoryID
 *        required: true
 *        type: String
 *        description: the category ID
 */
router.delete('/delete/:categoryID', async (req, res) => {
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
 * /api/admin/categories/delete:
 *  delete:
 *    summary: Deletes all the categories
 */
router.delete('/delete', async (req, res) => {
  await Category.remove({});
  res.status(200).send();
});

/**
 * @swagger
 * /api/admin/{categoryID}:
 *  patch:
 *    summary: Updates category with a specific category ID
 *    parameters: 
 *      - in: path
 *        name: categoryID
 *        required: true
 *        type: String
 *        description: the category ID
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
    res.status(200).send(category);
  });
});

module.exports = router;
