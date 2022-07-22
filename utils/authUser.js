import axios from "axios";
import Router from "next/router";
import cookie from "js-cookie";

import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";

/********** CREATE NEW USER ACCOUNT *********/
export const registerUser = async (user, profilePicUrl, setError, setFormLoading) => {
  try {
    const res = await axios.post(`${baseUrl}/api/signup`, { user, profilePicUrl });

    setToken(res.data);
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
  setFormLoading(false)
};

const setToken = (token) => {
  cookie.set("token", token); //set the cookie

  Router.push("/"); //navigate to the homepage
};

/********** LOGIN USER  *********/
export const loginUser = async (user, setError, setLoading) => {
  setLoading(true);

  try {
    const res = await axios.post(`${baseUrl}/api/auth`, { user });

    setToken(res.data);
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};
