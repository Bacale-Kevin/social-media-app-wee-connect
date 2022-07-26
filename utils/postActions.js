import axios from "axios";
import cookie from "js-cookie";

import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";

//This is not to repeat ourselft by passing headers again and again
const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get("token") },
});

export const submitNewPost = async (
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const res = await Axios.post("/", { text, location, picUrl });

    

    setPosts((prev) => [res.data, ...prev]); //this is what makes the list of posts to be updated when a post is created
    setNewPost({ text: "", location: "" }); // reset values after submit
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};
