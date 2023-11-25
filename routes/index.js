var express = require("express");
var passport = require("passport");
var localStrategy = require("passport-local");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index");
});

/* GET profile page. */
router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  }).populate('posts');
  // console.log(user);
  res.render("profile", { user });
});

/* POST register */
router.post("/signup", async function (req, res) {
  const { username, email, fullname } = req.body;
  let userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

/* GET signup page */
router.get("/signup", function (req, res) {
  res.render("signup");
});

/* POST login */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(404).send("no files were uploaded");
    }
    // res.send("File uploaded successfully");
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

    res.send("Done");
  }
);

/* GET login */
router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});

/* GET feed page */
router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed");
});

/* GET logout */
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/* is logged in? middleware */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
