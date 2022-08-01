const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },

  notifications: [
    {
      type: { type: String, enum: ["newLike", "newComment", "newFollower"] }, // send notification when there'is a new like, new comment or new follower
      user: { type: Schema.Types.ObjectId, ref: "User" }, //from which user does the notification comes
      post: { type: Schema.Types.ObjectId, ref: "Post" },
      commentId: { type: String },
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Notification", NotificationSchema);
