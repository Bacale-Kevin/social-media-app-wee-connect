const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const FollowerModel = require("../models/FollowerModel");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");

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

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).send(`Server error`);
  }
});

/***** GET  POSTS  ******/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.status(200).json({ success: true, posts });
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

    if (!post) return res.status(404).send("Post not found");

    //check if the post have already been like
    const isLiked = post.likes.filter((like) => like.user.toString() === userId).length > 0;

    if (isLiked) return res.status(401).send("Post already liked");

    await post.likes.unshift({ user: userId });
    await post.save();

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

module.exports = router;
