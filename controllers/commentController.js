const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

exports.comments_get = asyncHandler(async (req, res) => {
  // Find post
  const post = await Post.findById(req.params.postId);
  // Extract post id
  console.log(post);
  const postId = post._id;
  // Query db for any comments with id ^
  const comments = await Comment.find({ parentPost: postId });
  // If result is empty return status 400 with msg
  if (!comments || comments.length === 0) {
    res.status(400).json({ message: "No comments found" });
  }
  // If result is not empty return status 200 with list of all the comments
  res.status(200).json(comments);
});

exports.comment_post = [
  body("content")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Comment must be between 3 and 200 characters")
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: "Validation error", errors });
    }

    const newComment = new Comment({
      createdBy: req.user.id,
      createdOn: Date.now(),
      parentPost: req.params.postId,
      content: req.body.content,
    });

    const isSuccess = newComment.save();

    if (!isSuccess) {
      res.status(400).json({ message: "Unable to create new comment" });
    }

    res.status(200).json({ message: "Comment added", newComment });
  }),
];
