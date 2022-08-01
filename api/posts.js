const express = require("express");
const router = express.Router();
const uuid = require("uuid").v4;

const authMiddleware = require("../middleware/authMiddleware");
const FollowerModel = require("../models/FollowerModel");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");
const { newLikeNotification, removeLikeNotification } = require("../utilsServer/notifcationActions");

/***** Create A POST ******/
router.post("/", authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body;

  if (text.length < 1) return res.status(401).send("Text must be atlist 1 character");

  try {
    const newPost = {
      user: req.userId,
      text,
    };

    if (location) newPost.location = location;
    if (picUrl) newPost.picUrl = picUrl;

    const post = await new PostModel(newPost).save();

    const postCreated = await PostModel.findById(post._id).populate("user");

    return res.json(postCreated);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET  POSTS  ******/
router.get("/", authMiddleware, async (req, res) => {
  const { pageNumber } = req.query;
  const number = Number(pageNumber);
  const size = 8;
  const { userId } = req;

  try {
    /***** GET THE POSTS OF ONLY THE USERS I'M FOLLOWING OR MY OWN POST ******/
    const loggedUser = await FollowerModel.findOne({ user: userId }).select("-followers"); //we only the need the following data

    let posts = [];

    if (number === 1) {
      if (loggedUser.following.length > 0) {
        posts = await PostModel.find({
          user: { $in: [userId, ...loggedUser.following.map((following) => following.user)] },
        }) //$in is like an OR condition return this or that
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      } else {
        //return the post of the loggedin user
        posts = await PostModel.find({ user: userId })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
    } else {
      const skips = size * (number - 1); // this is to skip over previously send posts

      if (loggedUser.following.length > 0) {
        posts = await PostModel.find({
          user: { $in: [userId, ...loggedUser.following.map((following) => following.user)] },
        }) //$in is like an OR condition return this or that
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      } else {
        //return the post of the loggedin user
        posts = await PostModel.find({ user: userId })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
    }

    return res.json(posts);

    /****** OLD CODE TO GET ALL THE POSTS *****/
    // let posts;

    // if (number === 1) {
    //   posts = await PostModel.find()
    //     .limit(size) //by default only eight post will be send
    //     .sort({ createdAt: -1 })
    //     .populate("user")
    //     .populate("comments.user");
    // } else {
    //   const skips = size * (number - 1); // this is to skip over previously send post
    //   posts = await PostModel.find()
    //     .skip(skips)
    //     .limit(size)
    //     .sort({ createdAt: -1 })
    //     .populate("user")
    //     .populate("comments.user");
    // }

    // return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET POST BY ID ******/
router.get("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId).populate("user").populate("comments.user");

    if (!post) return res.status(404).send("Post not found");

    return res.status(200).json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** DELETE A POST ******/
router.delete("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = req;
  try {
    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send("Post not found");

    //The aim here is ensure that the user who created the post is the user who is deleting the post but an admin can delete every post
    const user = await UserModel.findById(userId);

    if (post.user.toString() !== userId) {
      if (user.role === "root") {
        //admin can delete any post
        await post.remove();

        return res.status(200).send("Post Deleted Successfully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await post.remove();

    return res.status(200).send("Post Deleted Successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** LIKE A POST ******/
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send("No Post Found");

    //check if the post have already been like
    const isLiked = post.likes.filter((like) => like.user.toString() === userId).length > 0;

    if (isLiked) return res.status(401).send("Post already liked"); 

    await post.likes.unshift({ user: userId });
    await post.save();

    //send notification
    //if liking your won post don't send notificati  on
    if(post.user.toString() !== userId){
      await newLikeNotification(userId, postId, post.user.toString( ))
    }

    return res.status(200).send("Post liked");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** UNLIKE A POST ******/
router.put("/unlike/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send("Post not found");

    //check if the post have already been unlike
    const isLiked = post.likes.filter((like) => like.user.toString() === userId).length === 0;

    if (isLiked) return res.status(401).send("Post not liked before");

    const index = post.likes.map((like) => like.user.toString()).indexOf(userId);

    await post.likes.splice(index, 1);
    await post.save();

    //remove notification
    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post unliked");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET ALL LIKES ******/
router.get("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("likes.user");

    if (!post) return res.status(404).send("Post not found");

    return res.status(200).json(post.likes);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** COMMENT A POST ******/
router.post("/comment/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const { text } = req.body;

    if (text.length < 1) return res.status(401).send("comment should be atleast one character long");

    const post = await PostModel.findById(postId).populate("comments.user");

    if (!post) return res.status(404).send("Post not found");

    const newComment = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };

    post.comments.unshift(newComment);

    await post.save();

    return res.status(200).json(newComment._id);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** DELETE A COMMENT ******/
router.delete("/:postId/:commentId", authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send("Post not found");

    const comment = post.comments.find((comment) => comment._id === commentId);

    if (!comment) return res.status(404).send("No Comment Found");

    //a comment can only  be deleted by the creator itself and root user
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send("No User Found");

    if (comment.user.toString() !== userId) {
      if (user.role === "root") {
        const index = post.comments.map((comment) => comment._id).indexOf(commentId);

        await post.comments.splice(index, 1);
        await post.save();

        return res.status(200).send("Comment Deleted Successfully ");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    const index = post.comments.map((comment) => comment._id).indexOf(commentId);

    await post.comments.splice(index, 1);
    await post.save();

    return res.status(200).json("Comment Deleted Successfully ");
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
