const router = require('express').Router();
const Category = require('../../models/categorySchema.model');

// Create a new category
router.post('/create', (req, res) => {
  Category.create(req.body, (err, category) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: category.id,
    });
  });
});

// Deletes a category with the specific ID
router.delete('/delete/:categoryID', async (req, res) => {
  await Category.findByIdAndDelete(req.params.categoryID, (err) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: req.params.categoryID,
    });
  });
});

// Delete all the categories
router.delete('/delete', async (req, res) => {
  await Category.remove({});
  res.status(200).send();
});

// Update category with a specific category ID
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

// Return all categories
router.get('/', async (req, res) => {
  res.status(200).send(await Category.find({}));
});

// Return category with a specific category ID
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
