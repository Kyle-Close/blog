const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const Post = require('../models/post');
const Category = require('../models/category');

// Create new category
exports.create_category_post = [
  body('category')
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage('Category must be between 3 & 16 characters.')
    .escape(),

  asyncHandler(async (req, res) => {
    // Check for validation errors
    const err = validationResult(req);
    // if err then return bad status and error msg
    if (!err.isEmpty())
      return res
        .status(400)
        .json({ msg: 'Validation error(s)', errors: err.array() });
    // else create the new category & save to db
    const newCategory = new Category({ category: req.body.category });
    const isSuccess = await newCategory.save();

    if (isSuccess)
      return res.status(201).json({
        message: 'Successfully created category',
        id: newCategory._id,
      });
  }),
];

exports.retrieve_categories_get = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  if (!categories) {
    return res.status(400).json({ msg: 'Could not find any categories' });
  }

  return res
    .status(200)
    .json({ message: 'Successfully retrieved categories', categories });
});
