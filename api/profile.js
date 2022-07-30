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

      followersLength: profileFollowStats.followers.length > 0 ? profileFollowStats.followers.length : 0,

      followingLength: profileFollowStats.following.length > 0 ? profileFollowStats.following.length : 0,
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

    const posts = await PostModel.find({ user: user._id }).sort({ createdAt: -1 }).populate("user").populate("comments.user");

    if (!posts) return res.status(404).send(`Post not found`);

    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET FOLLOWERS ******/
router.get("/followers/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await FollowerModel.findOne({ user: userId }).populate("followers.user");

    return res.json(user.followers);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET FOLLOWING ******/
router.get("/following/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await FollowerModel.findOne({ user: userId }).populate("following.user");

    return res.json(user.following);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** FOLLOW A USER ******/
router.post("/follow/:userToFollowId", authMiddleware, async (req, res) => {
  const { userToFollowId } = req.params;
  const { userId } = req;

  /**Understand the logic the:
   * The userId is the login user and the usertoFollowId is the user to follow
   * We need both id's to be able to follow a user.
   *
   * The idea is push the user to follow ID into the following array field
   * and then push the login user id into the followers field
   */
  try {
    const user = await FollowerModel.findOne({ user: userId });

    const userToFollow = await FollowerModel.findOne({ user: userToFollowId });

    if (!user || !userToFollow) return res.status(404).send(`User not found`);

    //check if the user has not already follow the other user before
    const isFollowing =
      user.following.length > 0 && user.following.filter((following) => following.user.toString() === userToFollowId).length > 0;

    if (isFollowing) return res.status(401).send("User already followed");

    await user.following.unshift({ user: userToFollowId });
    await user.save();

    await user.followers.unshift({ user: userId });
    await user.save();

    return res.status(200).send("Success");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** UNFOLLOW A USER ******/
router.put("/unfollow/:userToUnfollowId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { userToUnfollowId } = req.params;

    const user = await FollowerModel.findOne({
      user: userId,
    });

    const userToUnfollow = await FollowerModel.findOne({
      user: userToUnfollowId,
    });

    if (!user || !userToUnfollow) {
      return res.status(404).send("User not found");
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter((following) => following.user.toString() === userToUnfollowId).length === 0;

    if (isFollowing) {
      return res.status(401).send("User Not Followed before");
    }

    const removeFollowing = await user.following.map((following) => following.user.toString()).indexOf(userToUnfollowId);

    await user.following.splice(removeFollowing, 1);
    await user.save();

    const removeFollower = await userToUnfollow.followers.map((follower) => follower.user.toString()).indexOf(userId);

    await userToUnfollow.followers.splice(removeFollower, 1);
    await userToUnfollow.save();

    // await removeFollowerNotification(userId, userToUnfollowId);

    return res.status(200).send("Updated");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

/***** UPDATE PROFIL *****/
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { bio, facebook, youtube, twitter, instagram, profilePicUrl } = req.body;
    let profileFields = {};

    profileFields.user = userId;

    profileFields.bio = bio;

    profileFields.social = {};

    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    await ProfileModel.findOneAndUpdate({ user: userId }, { $set: profileFields }, { new: true });

    if (profilePicUrl) {
      const user = await UserModel.findById(userId);
      user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

/***** UPDATE PASSWORD *****/
router.post("/settings/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req;
  try {
    if (newPassword.length < 6) return res.status(401).send(`Password must be atleast 6 characters`);

    const user = await UserModel.findById(userId).select("+password");

    const isPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isPassword) return res.status(401).send(`Invalid Password`);

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

/***** UPDATE MESSAGE POPUP SETTING *****/
router.post("/settings/messagePopup", authMiddleware, async (req, res) => {
  const { userId } = req;
  try {
    const user = await UserModel.findById(userId);

    if (user.newMessagePopup) {
      user.newMessagePopup = false;

      await user.save();
    } else {
      user.newMessagePopup = true;

      await user.save();
    }

    return res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

module.exports = router;
