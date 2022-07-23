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
  setFormLoading(false);
};

/********** LOGIN USER  *********/
export const loginUser = async (user, setError, setFormLoading) => {
  setFormLoading(true);

  try {
    const res = await axios.post(`${baseUrl}/api/auth`, { user });

    setToken(res.data);
  } catch (error) {
    console.log("error --> ", error);
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
  setFormLoading(false);
};

export const logoutUser = (email) => {
  cookie.set('userEmail', email) //this value is to auto populate the user email address in the login form email field
  cookie.remove('token')

  Router.reload('/login')
  Router.push('/login')
}

const setToken = (token) => {
  cookie.set("token", token); //set the cookie
  Router.push("/"); //navigate to the homepage
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    //remember the req object can only be received on the server
    //which means the user in on server-side
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    //the user is on client-side
    Router.push(location);
  }
};
