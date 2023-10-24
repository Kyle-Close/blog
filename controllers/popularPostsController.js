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
    .withMessage("PostId must be a string")
    .escape(),

  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ msg: "Validation error", errors: errors.array() });
    }

    // Check if the post id is valid
    const post = await Post.findById(req.body.postId);
    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    } else {
      // Check if this post is already a popular post
      const doesExist = await PopularPosts.find({ postId: req.body.postId });
      if (doesExist.length > 0) {
        return res
          .status(400)
          .json({ msg: "This post is already a popular post." });
      }
      // Check if there are already 4 popular posts
      const popularPosts = await PopularPosts.find();
      if (popularPosts.length > 3) {
        await PopularPosts.findOneAndDelete({});
      }
      // Create new popular post
      const newPopularPost = new PopularPosts({
        postId: req.body.postId,
      });

      // Add post to PopularPosts collection
      const isSuccess = await newPopularPost.save();
      if (isSuccess) {
        return res
          .status(200)
          .json({ message: "Popular post successfully added." });
      }
    }
  }),
];

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
