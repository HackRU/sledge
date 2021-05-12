const router = require('express').Router();
const Category = require('../../models/categorySchema.model');

// Create a new category
router.post("/create", async (req, res) => {
    const currentCategory = new Category(req.body);
    currentCategory.save((err, category) => {
        if (err) res.status(500).send(err);
        res.status(200).send(category);
    });
});

// Delete all the categories
router.delete("/delete", async (res) => {
    await Category.remove({})
    res.status(200).send();
});

// Update category with a specific category ID
router.patch("/:categoryID", async (req, res) => {
    
});

// Return all categories
router.get("/", async (res) => {
    res.status(200).send(await Category.find({}));
});

// Return category with a specific category ID
router.get("/:categoryID", async (req, res) => {
    await Category.findById(req.body.categoryID, (err, category) => {
        if (err) res.status(500).send(err);
        res.status(200).send(category);
    });
});

module.exports = router;