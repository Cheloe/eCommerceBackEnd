const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Tag, through: { model: ProductTag, unique: false }, as: 'attached_tags' }
      ]
  });
    res.status(200).json(productData);
  }  catch (err) {
     res.status(500).json(err);
  }
});

// get one product

router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category'}, 
        { model: Tag, through: { model: ProductTag, unique: false }, as: 'attached_tags' }
      ]
    });
  if (!productData) {
    res.status(404).json({message: 'No product found with this id!'});
    return;
  }

  res.status(200).json(productData);

  } catch (err) {
    res.status(500).json(err);
  }
});


// create new product
router.post('/', (req, res) => {
 
  Product.create(req.body)
    .then((product) => {
      // attach category
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product

router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      // find the updated product
      return Product.findByPk(req.params.id);
    })
    .then((updatedProduct) => {
      if (!updatedProduct) {
        // If the product is not found, return an error response
        return res.status(404).json({ error: 'Product not found' });
      }

      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } })
        .then((productTags) => {
          // get list of current tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);

          // check if tagIds exist in req.body
          if (req.body.tagIds) {
            // create filtered list of new tag_ids
            const newProductTags = req.body.tagIds
              .filter((tag_id) => !productTagIds.includes(tag_id))
              .map((tag_id) => {
                return {
                  product_id: req.params.id,
                  tag_id,
                };
              });
            // figure out which ones to remove
            const productTagsToRemove = productTags
              .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
              .map(({ id }) => id);

            // run both actions
            return Promise.all([
              ProductTag.destroy({ where: { id: productTagsToRemove } }),
              ProductTag.bulkCreate(newProductTags),
            ]);
          } else {
            // If tagIds don't exist, skip tag-related operations
            return;
          }
        })
        .then(() => {
          // Return the updated product in the response
          res.json(updatedProduct);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});


router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(() => {
    res.json({ message: "Product deleted"});
  })
  .catch((err) => res.json(err));
});

module.exports = router;