const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

const isPostAuthorEqualToRequestingUser = require("../helpers/authHelpers");

exports.comments_get = asyncHandler(async (req, res) => {
  // Find post
  const post = await Post.findById(req.params.postId);
  // Extract post id
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
      createdBy: req.user,
      createdOn: Date.now(),
      parentPost: req.params.postId,
      content: req.body.content,
    });

    const isSuccess = newComment.save();

    if (!isSuccess) {
      res.status(400).json({ message: "Unable to create new comment" });
    }

    res.status(201).json({ message: "Comment added", newComment });
  }),
];

exports.comment_delete = asyncHandler(async (req, res) => {
  try {
    // User must be author to delete a post
    const [user, post] = await Promise.all([
      User.findById(req.user),
      Post.findById(req.params.postId),
    ]);

    if (!user || !post) {
      return res
        .status(400)
        .json({ message: "Could not find user credentials or post data" });
    }

    const isEqual = isPostAuthorEqualToRequestingUser(user, post, req);

    if (isEqual !== true) {
      return res.status(400).json(isEqual);
    }

    console.log(req.params.commentId);
    const removedComment = await Comment.findByIdAndRemove(
      req.params.commentId
    );

    if (!removedComment) {
      return res.status(404).json({ message: "Could not find comment" });
    }

    res.status(204).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
