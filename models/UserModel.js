const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, select: false }, // select false enables this field not be send by default

    username: { type: String, required: true, unique: true, trim: true }, 

    profilePicUrl: { type: String }, 

    newMessagePopup: { type: Boolean, default: true }, // this field will be used to enable the user to disable the auto message popup

    unreadMessage: { type: Boolean, default: false },

    unreadNotification: { type: Boolean, default: false },

    role: { type: String, default: "user", enum: ["user", "root"] },

    resetToken: { type: String },

    expireToken: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema)
