const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');

const isPostAuthorEqualToRequestingUser = require('../helpers/authHelpers');

exports.posts_get = asyncHandler(async (req, res) => {
  // Get list of all posts that are published
  const allPosts = await Post.find({ isPublished: { $ne: false } });

  if (!allPosts || allPosts.length === 0) {
    res.status(404).send('Resource not found.');
  }

  res.json({ posts: allPosts });
});

exports.create_post = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Title must be between 1 ands 30 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1, max: 99999 })
    .withMessage('Post must be between 1 ands 99,999 characters')
    .escape(),

  asyncHandler(async (req, res) => {
    // Need to be an author to create a post
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.isAuthor) {
      return res
        .status(400)
        .json({ message: 'Access denied: must be an author' });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Return post fields and error
      const post = {
        title: req.body.title,
        content: req.body.content,
        isPublished: req.body.isPublished ? true : false,
      };
      res.json({
        post,
        errors: errors.array(),
      });
    }

    const isPublished = req.body.isPublished ? true : false;
    const category = await Category.findById(req.body.category);

    if (!category) {
      return res
        .status(400)
        .json({ msg: 'Invalid post category', category: req.body.category });
    }

    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      isPublished: isPublished,
      createdOn: Date.now(),
      createdBy: user,
      category: category,
    });

    await newPost.save();
    res
      .status(201)
      .json({ message: 'Post successfully created!', id: newPost._id });
  }),
];

exports.post_content_get = asyncHandler(async (req, res) => {
  // Find the post
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404).send('Resource not found');
  }

  res.json(post);
});

exports.post_content_update = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Title must be between 3 and 30 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1, max: 99999 })
    .withMessage('Post must be between 1 and 99,999 characters')
    .escape(),

  asyncHandler(async (req, res) => {
    // Check for errors
    const errors = validationResult(req);
    // If errors return original data sent
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        postData: req.body,
      });
    }

    // If no errors, get the user submitting the update and the post (for original author)
    const [user, post] = await Promise.all([
      User.findById(req.user),
      Post.findById(req.params.postId),
    ]);

    if (!user || !post) {
      return res.status(400).json({
        success: false,
        message: 'Could not find post or submitting user',
        postData: req.body,
      });
    }

    const isEqual = isPostAuthorEqualToRequestingUser(user, post, req);

    if (isEqual !== true) {
      res.status(400).json(isEqual);
    }

    // If the user is the original user, create a new post instance with submitted data
    const newPostFields = {
      title: req.body.title,
      content: req.body.content,
      isPublished: req.body.isPublished ? true : false,
    };

    // Find this post by its ID and update it in a single call
    const success = await Post.findByIdAndUpdate(
      req.params.postId,
      newPostFields
    );

    // Return success message
    if (success) res.status(200).json(success);
    else res.status(400).json({ message: 'Unable to find/update post' });
  }),
];

exports.delete_post = asyncHandler(async (req, res) => {
  // User must be author to delete a post
  const [user, post] = await Promise.all([
    User.findById(req.user),
    Post.findById(req.params.postId),
  ]);

  if (!user || !post) {
    res
      .status(400)
      .json({ message: 'Could not find user credentials or post data' });
  }

  const isEqual = isPostAuthorEqualToRequestingUser(user, post, req);

  if (isEqual !== true) {
    res.status(400).json(isEqual);
  }

  const removedPost = await Post.findByIdAndRemove(req.params.postId);
  if (!removedPost) {
    res.status(404).json({ message: 'Could not find post' });
  }
  res.status(204).json({ message: 'Post deleted' });
});

exports.recent_posts_get = asyncHandler(async (req, res) => {
  const last5Posts = await Post.find().sort({ createdOn: -1 }).limit(5);
  if (last5Posts.length > 0) {
    return res.status(200).json({
      message: 'Successfully retrieved recent posts.',
      posts: last5Posts,
    });
  } else {
    return res.status(400).json({ msg: 'Could not extract recent posts.' });
  }
});

exports.retrieve_posts_by_category = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return res.status(400).json({ msg: 'Could not find category' });
  }

  const posts = await Post.find({ category: category });

  if (!posts) {
    return res
      .status(400)
      .json({ msg: 'Could not find any posts in category' });
  }

  return res
    .status(200)
    .json({ message: 'Successfully retrieved posts', posts });
});

exports.retrieve_recent_posts_by_user = [
  body('postLimit').trim().escape(),

  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (!user.isAuthor) {
      return res
        .status(400)
        .json({ message: 'Access denied: must be an author' });
    }

    const limit = req.body.postLimit;
    let recentPosts;

    if (limit) {
      recentPosts = await Post.find({ createdBy: user._id })
        .sort({ createdOn: -1 })
        .limit(3);
    } else {
      recentPosts = await Post.find({ createdBy: user._id }).sort({
        createdOn: -1,
      });
    }

    if (!recentPosts) {
      return res.status(400).json({ msg: 'Could not locate any posts' });
    }

    return res
      .status(200)
      .json({ msg: 'Successfully retrieved recent posts', posts: recentPosts });
  }),
];
