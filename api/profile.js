const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const FollowerModel = require("../models/FollowerModel");
const PostModel = require("../models/PostModel");
const ProfileModel = require("../models/ProfileModel");
const UserModel = require("../models/UserModel");

/***** GET PROFILE INFO ******/
router.get("/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await UserModel.findOne({ username: username.toLocaleLowerCase() });

    if (!user) return res.status(404).send(`User not found `);

    const profile = await ProfileModel.findOne({ user: user._id }).populate("user");

    const profileFollowStats = await FollowerModel.findOne({ user: user._id });

    return res.json({
      profile,

      followersLength:
        profileFollowStats.followers.length > 0 ? profileFollowStats.followers.length : 0,

      followingLength:
        profileFollowStats.following.length > 0 ? profileFollowStats.following.length : 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET POST CREATED BY THE LOGIN USER ******/
router.get("/posts/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await UserModel.findOne({ username: username.toLocaleLowerCase() });

    if (!user) return res.status(404).send(`User not found`);

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user" );

    if (!posts) return res.status(404).send(`Post not found`);

    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
