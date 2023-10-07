function isPostAuthorEqualToRequestingUser(user, post, req) {
  if (!objectsAreEqual(user._id, post.createdBy)) {
    return {
      success: false,
      message: "Not the original post author",
      postData: req.body,
    };
  } else return true;
}

function objectsAreEqual(objA, objB) {
  return objA.toString() === objB.toString();
}

module.exports = isPostAuthorEqualToRequestingUser