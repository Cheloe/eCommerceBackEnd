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
// TODO: make this route work. Currently it is returning null for the product_tag_id, and I don't think it will return an array either. 
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
// TODO: make this route work, I don't know where this one is at.
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
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
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
});

module.exports = router;


// router.post('/', (req, res) => {
 
//   Product.create(req.body)
//     .then((product) => {
//       // if there are product tags, we need to create pairings to bulk create in the ProductTag model
      
//       // if (req.body.tag_id.length) {
//       //   const productTagIdArr = req.body.tag_id.map((tag_id) => {
//       //     return {
//       //       product_id: product.id,
//       //       tag_id: tag_id,
//       //     };
//       //   });
//       //   ProductTag.bulkCreate(productTagIdArr);
//       //   res.status(200).json(product);
//       //   return;
//       // }
//       // if no product tags, just respond
//       res.status(200).json(product);
//     })
//     .then((productTagIds) => res.status(200).json(productTagIds))
//     .catch((err) => {
//       console.log(err);
//       res.status(400).json(err);
//     });
// });