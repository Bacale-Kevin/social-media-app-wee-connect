const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },

  chats: [
    {
      messagesWith: { type: Schema.Types.ObjectId, ref: "User" }, //To who i my sending the messag e to
      messages: [
        {
          msg: { type: String, require: true },
          sender: { type: Schema.Types.ObjectId, ref: "User" },
          receiver: { type: Schema.Types.ObjectId, ref: "User" },
          date: { type: Date  },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Chat", ChatSchema);
