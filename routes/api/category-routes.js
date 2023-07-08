const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const categoryData = await Category.findAll({
      include: [
        {model: Product, as: 'products'}
      ],
    });
    res.status(200).json(categoryData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value and list all associated products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include:{ 
        model: Product, as: 'products' 
      }
    });
    if (!categoryData) {
      res.status(404).json({message: 'No Category found with this id!'});
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new category
  Category.create(req.body)
  .then((category) => {
    res.status(200).json(category);
  })
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then(() => {
    return Category.findOne({ where: { id: req.params.id } });
  })
  .then((updatedCategory) => {
    if (!updatedCategory) {
      res.status(404).json({message: 'No Category found with this id!'});
      return;
    }
    res.status(200).json({message: "New Category Name: " + updatedCategory.category_name} );
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  }
  );
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedCategory) {
      res.status(404).json({message: 'No Category found with this id!'});
      return;
    }
    res.status(200).json({message: "Category Deleted!"});
  }
  catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
