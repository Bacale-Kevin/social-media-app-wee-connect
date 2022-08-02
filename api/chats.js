const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const ChatModel = require("../models/ChatModel");


router.get('/', authMiddleware, async(req, res) => {
    try {
        const { userId } = req

        const user = await ChatModel.findOne({ user: userId}).populate('chats.messagesWith')

        //only send the most recent chats

        let chatToBeSent = []

         if(user.chats.length > 0){
            chatToBeSent = await user.chats.map((chat) => ({
              messagesWith: chat.messagesWith._id,
              name: chat.messagesWith.name,
              profilePicUrl: chat.messagesWith.profilePicUrl,
              lastMessage: chat.messages[chat.messages.length -1].msg, //return the  last message
              date: chat.messages[chat.messages.length -1].date 
            }));
         }

        return res.json(chatToBeSent);
    } catch (error) {
        console.log(error)
        return res.status(500).send('Server Error')
    }
})


module.exports = router