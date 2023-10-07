var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

const authenticateJWT = require("../helpers/authMiddleware");

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// POST: User create
router.post("/users", userController.create_user_post);

// POST: User login
router.post("/login", userController.login_user_post);

// GET: Retrieve all post
router.get("/posts", authenticateJWT, postController.posts_get);

// POST: Create a new post
router.post("/posts", authenticateJWT, postController.create_post);

// GET: Retrieve a specific posts' content
router.get("/posts/:postId", postController.post_content_get);

// PUT: Update a specific posts' data
router.put(
  "/posts/:postId",
  authenticateJWT,
  postController.post_content_update
);

// DELETE: Delate a specific post
router.delete("/posts/:postId", authenticateJWT, postController.delete_post);

// GET: Retrieve all comments on specific post
router.get("/posts/:postId/comments", commentController.comments_get);

// POST: Create new comment on specific post
router.post(
  "/posts/:postId/comments",
  authenticateJWT,
  commentController.comment_post
);

// DELETE: Remove a comment from a post
router.delete(
  "/posts/:postId/comments/:commentId",
  authenticateJWT,
  commentController.comment_delete
);

module.exports = router;
