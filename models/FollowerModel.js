const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },

    //this field represents the followers of the user
    followers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    //this field represents users which the user is following
    following: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Follower", FollowerSchema);
