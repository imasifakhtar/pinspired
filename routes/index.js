var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/createuser", async function (req, res, next) {
  let createdUser = await userModel.create({
    username: "imasifakhtar",
    password: "asif123",
    posts: [],
    email: "admin@asifakhtar.me",
    fullName: "Asif Akhtar",
  });

  res.send(createdUser);
});

router.get("/allusers", async function (req, res) {
  let allUsers = await userModel.find();
  
  res.send(allUsers);
});

router.get("/createpost", async function (req, res, next) {
  let createdpost = await postModel.create({
    postsText: "Hello World",
  });

  res.send(createdpost);
});

module.exports = router;
