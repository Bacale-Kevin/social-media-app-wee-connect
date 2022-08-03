const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const isEmail = require("validator/lib/isEmail");

const UserModel = require("../models/UserModel");
const baseUrl = require("../utils/baseUrl");

const options = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
};

const transporter = nodemailer.createTransport(sendGridTransport(options));

/***** CHECK USER EXISTS AND SEND EMAIL FOR RESET PASSWORD ******/
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isEmail(email)) return res.status(401).send("Invalid Email");

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send("User not found");

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;

    user.expiredToken = Date.now() + 3600000; //this digits is in millisenconds which means 1hour

    await user.save();

    //send email to user

    const href = `${baseUrl}/reset/${token}`;

    const mailOptions = {
      to: user.email,
      from: "bacale86@gmail.com",
      subject: "Password reset request",
      html: `<p> Hi! ${user.name
        .split(" ")[0]
        .toString()}, There was a request for password reset. <a href=${href}>click this link to reset the password</a></p> 
      <p> <strong>This is token is valid for 1hours!</strong></p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => err && console.log(err));

    return res.status(200).send("Email send");
  } catch (error) {
    console.log(error);
    res.status(500).send(`Server Error`);
  }
});

router.get("/token", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) return res.status(401).send("Unauthorized");

    if (password.length < 6) return res.status(401).send("Unauthorized");

    const user = await UserModel.findOne({ resetToken: token });
    if (!user) return res.status(404).send("User not found");

    //check if token has expired
    if (Date.now() > user.expiredToken) {
      res.status(401).send("Token expired. Generate new one");
    }

    //save password
    user.password = await bcrypt.hash(password, 10);

    user.resetToken = "";
    user.expiredToken = undefined;

    user.save();

    return res.status(200).send("Password updated");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
