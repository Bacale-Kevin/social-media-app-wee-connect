const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail"); // to validate the email address

const UserModel = require("../models/UserModel");

/********** Checks whether the username has been taken or not ***********/
router.post("/", async (req, res) => {
  const { email, passsword } = req.body;

  //validate fields
  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  //check invalid characters
  if (password.length < 6) return res.status(401).send("Password must be atleast 6 characters");

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password"); // password not included when we search for a user

    if (!user) return res.status(401).send("Invalid Credentials");

    //check if password is correct
    const isPassword = await bcrypt.compare(passsword, user.passsword);
    if (!isPassword) {
      return res.status(401).send("Invalid Credentials");
    }

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