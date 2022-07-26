import axios from "axios";
import cookie from "js-cookie";

import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";

//This is not to repeat ourselft by passing headers again and again
const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get("token") },
});

/**After any POST DELETE or PUT request we always need to setPost in other to refresh the list*/

export const submitNewPost = async (text, location, picUrl, setPosts, setNewPost, setError) => {
  try {
    const res = await Axios.post("/", { text, location, picUrl });

    setPosts((prev) => [res.data, ...prev]); //this is what makes the list of posts to be updated when a post is created
    setNewPost({ text: "", location: "" }); // reset values after submit
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToast) => {
  try {
    await Axios.delete(`${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowToast(true);
  } catch (error) {
    console.log(error);
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`.like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]); //in the model the likes takes one field user which is the id of the user liking the post
    } else if (!like) {
      //which means the user wants to unlike the post
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (error) {
    console.log(error);
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};
