var express = require("express");
var passport = require("passport");
var localStrategy = require("passport-local");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

// GET home page
router.get("/", function (req, res) {
  res.render("index");
}); 

// Combined route for signup (GET and POST)
router
  .route("/signup")
  .get(function (req, res) {
    res.render("signup");
  })
  .post(async function (req, res) {
    const { username, email, fullname } = req.body;
    let userData = new userModel({ username, email, fullname });

    userModel.register(userData, req.body.password).then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
  });

// Combined route for login (GET and POST)
router
  .route("/login")
  .get(function (req, res) {
    res.render("login", { error: req.flash("error") });
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true,
    }),
    function (req, res) {}
  );

// GET profile page
router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  res.render("profile", { user });
});

// GET feed page
router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed");
});

// POST upload
router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(404).send("No files were uploaded");
    }

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const post = await postModel.create({
      image: req.file.filename,
      postsText: req.body.caption,
      user: user._id,
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
  }
);

// GET logout
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Middleware: isLoggedIn
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
