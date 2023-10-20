const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.create_user_post = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .escape(),

  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long.")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    // Check if the user already exists
    const user = await User.find({ username: req.body.username }).exec();

    if (!isEmpty(user)) {
      const response = [
        {
          msg: "user already exists",
        },
      ];
      return res.status(400).json(response);
    }

    // Hash the password
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
        const newUser = new User({
          username: req.body.username,
          password: hashedPassword,
          isAuthor: req.body.isAuthor ? true : false,
          createdOn: Date.now(),
        });

        // Create token
        const token = jwt.sign(
          {
            _id: newUser._id,
            isAuthor: newUser.isAuthor,
            username: newUser.username,
          },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );

        // save user token
        newUser.token = token;

        await newUser.save();
        res
          .status(201)
          .json({ message: "User created successfully", user: newUser });
      } catch (err) {
        return next(err);
      }
    });
  }),
];

exports.login_user_post = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Validate if user exists in our database
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        {
          _id: user._id,
          isAuthor: user.isAuthor,
          username: username,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // Save user token to the database
      user.token = token;

      try {
        await user.save();
        res.status(200).json({ message: "Login successful", user, token });
      } catch (err) {
        next(err);
      }
    } else {
      res.status(400).json({ msg: "Invalid Credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// HELPERS
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
