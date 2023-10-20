const asyncHandler = require("express-async-handler");
const PopularPosts = require("../models/popular-posts");
const Post = require("../models/post");
const User = require("../models/user");

exports.popular_posts_get = asyncHandler(async (req, res) => {
  try {
    const allPopularPostIDs = await PopularPosts.find();

    if (!allPopularPostIDs || allPopularPostIDs.length === 0) {
      return res.status(404).send("Resource not found.");
    }

    const postIdArray = allPopularPostIDs.map((post) => post.postId.toString());

    const popularPosts = await getPopularPosts(postIdArray);
    const users = await getPostAuthors(popularPosts);

    const result = createPostObjects(popularPosts, users);

    res.json({ posts: result });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

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
      postURL: post.postURL,
      author: author ? author.username : "Unknown Author",
    };
  });
}
