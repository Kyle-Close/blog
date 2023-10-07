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

exports.post_content_get = asyncHandler(async (req, res) => {
  // Find the post
  const post = await Post.findById(req.params.postId);

  if (!post) {
    res.status(404).send("Resource not found");
  }

  res.json(post);
});

exports.post_content_update = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Title must be between 3 and 30 characters")
    .escape(),
  body("content")
    .trim()
    .isLength({ min: 1, max: 99999 })
    .withMessage("Post must be between 1 and 99,999 characters")
    .escape(),

  asyncHandler(async (req, res) => {
    // Check for errors
    const errors = validationResult(req);
    // If errors return original data sent
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
        postData: req.body,
      });
    }
    // If no errors, get the user submitting the update and the original user
    const [submittingUser, originalPost] = await Promise.all([
      User.findById(req.user.id),
      Post.findById(req.params.postId),
    ]);

    if (!submittingUser || !originalPost) {
      return res.status(400).json({
        success: false,
        message: "Could not find post or submitting user",
        postData: req.body,
      });
    }

    console.dir(submittingUser._id);
    console.dir(originalPost.createdBy);
    // If user is not the original user, return data with an error message
    if (!objectsAreEqual(submittingUser._id, originalPost.createdBy)) {
      return res.status(400).json({
        success: false,
        message: "Not the original post author",
        postData: req.body,
      });
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
  }),
];

exports.delete_post = asyncHandler(async (req, res) => {
  const removedPost = await Post.findByIdAndRemove(req.params.postId);
  if (!removedPost) {
    res.status(404).json({ message: "Could not find post" });
  }
  res.status(200).json({ message: "Post deleted" });
});

// HELPERS
function objectsAreEqual(objA, objB) {
  return objA.toString() === objB.toString();
}
