var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const postController = require("../controllers/postController");

const authenticateJWT = require("../helpers/authMiddleware");

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// POST: User create
router.post("/users", authenticateJWT, userController.create_user_post);

// GET: User login
router.post("/login", userController.login_user_post);

// POST: Retrieve all post
router.get("/posts", authenticateJWT, postController.posts_get);

// POST: Create a new post
router.post("/posts", authenticateJWT, postController.create_post);

module.exports = router;
