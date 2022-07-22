const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail"); // to validate the email address

const FollowerModel = require("../models/FollowerModel");
const ProfileModel = require("../models/ProfileModel");
const UserModel = require("../models/UserModel");
const userPng =
  "https://cloudinary.com/console/c-9cb4901916f0a8986064e0c2401020/media_library/folders/00fa52c6394ec5ebea000db5dbcded3f8a"; //default profile pic in case the user doesn't enter a picture

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;

/********** Checks whether the username has been taken or not ***********/
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log(req.params);
  try {
    //validate length
    if (username.length < 1) return res.status(401).send("Invalid");

    //check invalid characters
    if (!regexUserName.test(username)) return res.status(401).send("Invalid");

    const user = await UserModel.findOne({ username: username.toLowerCase() });

    if (user) return res.status(401).send("Username already taken");

    return res.status(200).send("Available");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/********** Create New User ***********/
router.post("/", async (req, res) => {
  const { name, email, password, username, bio, facebook, youtube, twitter, instagram } =
    req.body.user;

  try {
    //validations
    if (!isEmail(email)) return res.status(401).send("Invalid Email");
    if (password.length < 6) return res.status(401).send("Password must be atleast 6 characters");

    //check if user already exist
    let user;

    user = await UserModel.findOne({ email: email.toLowerCase() });

    if (user) return res.status(401).send("User already registered");

    //prepare the new user object
    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      profilePicUrl: req.body.profilePicUrl || userPng.at,
    });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    /********** Now Create The Profile Model **********/
    let profileFields = {};

    profileFields.user = user._id;

    profileFields.bio = bio;

    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;

    await new ProfileModel(profileFields).save();

    /********** Now Create The Follower Model **********/
    await new FollowerModel({ user: user._id, followers: [], following: [] }).save();

    /********** Send Token To The Front-End **********/
    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      },
      (err, token) => {
        if (err) throw err;

        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
