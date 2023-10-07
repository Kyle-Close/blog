const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const Post = require("../models/post");
const User = require("../models/user");

exports.posts_get = asyncHandler(async (req, res) => {
  // Get list of all posts
  const allPosts = await Post.find();

  if (!allPosts || allPosts.length === 0) {
    res.status(404).send("Resource not found.");
  }

  res.json({ posts: allPosts });
});

exports.create_post = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Title must be between 1 ands 30 characters")
    .escape(),
  body("content")
    .trim()
    .isLength({ min: 1, max: 99999 })
    .withMessage("Post must be between 1 ands 99,999 characters")
    .escape(),

  asyncHandler(async (req, res) => {
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

    const user = await User.findById(req.user.id);

    console.log(user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPublished = req.body.isPublished ? true : false;
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      isPublished: isPublished,
      createdOn: Date.now(),
      createdBy: user,
    });

    await newPost.save();
    res.status(201).json({ message: "Post successfully created!" });
  }),
];
