const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const PopularPosts = require("../models/popular-posts");
const Post = require("../models/post");
const User = require("../models/user");
const { ValidatorsImpl } = require("express-validator/src/chain");

exports.popular_posts_get = asyncHandler(async (req, res, next) => {
  try {
    const allPopularPostIDs = await PopularPosts.find();

    if (!allPopularPostIDs || allPopularPostIDs.length === 0) {
      return res.status(404).send("Resource not found.");
    }

    const postIdArray = allPopularPostIDs.map((post) => post.postId.toString());
    console.log(postIdArray);

    const popularPosts = await getPopularPosts(postIdArray);
    const users = await getPostAuthors(popularPosts);

    const result = createPostObjects(popularPosts, users);

    res.json({ posts: result });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

exports.add_popular_post_post = [
  body("postId")
    .trim()
    .isString()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid post id");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      console.log("here?");
      res.status(400).json({ msg: "Validation error", errors: errors.array() });
    }
    // Check if the post id is valid
    const post = await Post.findById(req.body.postId);
    // Check if there are already 5 popular posts
    // If yes, remove one
    // Create new popular post
    // Save it (add it to db)
  }),
];
// Need post id

// ----- UTILITY FUNCTIONS -----

async function getPopularPosts(postIdArray) {
  return await Post.find({ _id: { $in: postIdArray } });
}

async function getPostAuthors(posts) {
  const userIds = posts.map((post) => post.createdBy.toString());
  return await User.find({ _id: { $in: userIds } });
}

function createPostObjects(posts, users) {
  return posts.map((post) => {
    const author = users.find(
      (user) => user._id.toString() === post.createdBy.toString()
    );
    return {
      title: post.title,
      postId: post._id,
      author: author ? author.username : "Unknown Author",
    };
  });
}
