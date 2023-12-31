const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.create_user_post = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters.')
    .escape(),

  body('password')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long.')
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
          msg: 'user already exists',
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
          process.env.TOKEN_KEY
        );

        // save user token
        newUser.token = token;

        await newUser.save();
        res
          .status(201)
          .json({ message: 'User created successfully', user: newUser });
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
        process.env.TOKEN_KEY
      );

      // Save user token to the database
      user.token = token;

      try {
        await user.save();
        res.status(200).json({ message: 'Login successful', user, token });
      } catch (err) {
        next(err);
      }
    } else {
      res.status(400).json({ msg: 'Invalid Credentials' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

exports.find_user_get = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });
    if (user) {
      return res
        .status(200)
        .json({ message: 'Successfully retrieved user', user });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ msg: 'Error fetching user' });
  }
});

exports.make_user_author = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the 'isAuthor' property to true
    user.isAuthor = true;

    // Save the updated user
    const updatedUser = await user.save();

    // Create a new token with the updated information
    const newToken = jwt.sign(
      {
        _id: updatedUser._id,
        isAuthor: updatedUser.isAuthor,
        username: updatedUser.username,
      },
      process.env.TOKEN_KEY
    );

    // Update the user's token in the database
    updatedUser.token = newToken;
    await updatedUser.save();

    // Send the new token as part of the response
    return res.json({ user: updatedUser, token: newToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// HELPERS
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
