const passport = require('passport');

function authenticateJWT(req, res, next) {
  // Check if the route is allowed to be accessed without authentication
  if (req.skipAuthentication) {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
}

module.exports = authenticateJWT;
