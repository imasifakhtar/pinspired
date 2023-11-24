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
    postsText: "Hello World 2!",
    user: '655fd2b463e9104d33d53724',
  });

  let user = await userModel.findOne({_id: "655fd2b463e9104d33d53724"});
  user.posts.push(createdpost._id);
  await user.save();

  res.send("Done!");
});

router.get('/myposts', async function(req, res) {
  let myposts = await userModel.findOne({_id: '655fd2b463e9104d33d53724'}).populate('posts');

  res.send(myposts);
})

module.exports = router;
