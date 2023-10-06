var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const authenticateJWT = require("../helpers/authMiddleware");

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// User create POST
router.post("/users", authenticateJWT, userController.create_user_post);

// User login POST
router.post("/login", userController.login_user_post);

module.exports = router;
