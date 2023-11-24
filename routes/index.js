var express = require("express");
var passport = require("passport");
var localStrategy = require("passport-local");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("You are on Index page.");
});

router.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile');
})

router.post("/register", async function (req, res) {
  const { username, email, fullname } = req.body;
  let userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
  }),
  function (req, res) {
    res.send("Test Test");
  }
);

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/signup', function(req, res) {
  res.render('signup');
});
router.get('/feed', function(req, res) {
  res.render('feed');
});

router.get('/logout', function(req, res,next) {
  req.logout(function(err) {
    if(err) {
      return next(err);
    }
    res.redirect('/');
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
