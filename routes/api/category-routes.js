const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  // find all categories
  
  Category.findAll().then((categoryData) => {
    res.json(categoryData);
  });
  });

router.get('/:id', async (req, res) => {
  // find one category by its `id` value and list all associated products
  
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include:
      {model: Product, as: 'products', foreignKey: 'category_id' }
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
  .then((category) => {
    res.status(200).json(category);
  })
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
