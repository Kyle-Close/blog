var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const popularPostsController = require('../controllers/popularPostsController');
const categoryController = require('../controllers/categoryController');

const authenticateJWT = require('../helpers/authMiddleware');

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// POST: User create
router.post('/users', userController.create_user_post);

// POST: User login
router.post('/login', userController.login_user_post);

// GET: Find user
router.get('/users/:userId', userController.find_user_get);

// GET: Retrieve all post
router.get('/posts', postController.posts_get);

// POST: Create a new post
router.post('/posts', authenticateJWT, postController.create_post);

// GET: Retrieve a specific posts' content
router.get(
  '/posts/:postId',
  (req, res, next) => {
    req.skipAuthentication = true;
    next();
  },
  authenticateJWT,
  postController.post_content_get
);

// PUT: Update a specific posts' data
router.put(
  '/posts/:postId',
  authenticateJWT,
  postController.post_content_update
);

// DELETE: Delate a specific post
router.delete('/posts/:postId', authenticateJWT, postController.delete_post);

// GET: Retrieve all comments on specific post
router.get('/posts/:postId/comments', commentController.comments_get);

// POST: Create new comment on specific post
router.post(
  '/posts/:postId/comments',
  authenticateJWT,
  commentController.comment_post
);

// DELETE: Remove a comment from a post
router.delete(
  '/posts/:postId/comments/:commentId',
  authenticateJWT,
  commentController.comment_delete
);

// GET: Retrieve all popular posts
router.get('/popular-posts', popularPostsController.popular_posts_get);

// POST: Add a post to popular posts
router.post('/popular-posts', popularPostsController.add_popular_post_post);

// GET: Retrieve last 5 recent posts
router.get('/recent-posts', postController.recent_posts_get);

// GET: Retrive all categories
router.get('/categories', categoryController.retrieve_categories_get);

// POST: Create new category
router.post('/categories', categoryController.create_category_post);

// GET: Retrieve posts from a specific category
router.get(
  '/posts/category/:categoryId',
  postController.retrieve_posts_by_category
);

// GET: Retrieve specific category
router.get('/categories/:categoryId', categoryController.retrieve_category_get);

// GET: Retrieve recent posts for specific user
router.post(
  '/posts/user/:id',
  authenticateJWT,
  postController.retrieve_recent_posts_by_user
);

// PATCH: Sets a user to "isAuthor = true"
router.patch('/make_user_author/:userId', userController.make_user_author);

module.exports = router;
