import "semantic-ui-css/semantic.min.css";
import { parseCookies, destroyCookie } from "nookies"; //use to retrieve cookies in the server (nextjs)
import axios from "axios";

import Layout from "../components/Layout/Layout";
import baseUrl from "../utils/baseUrl";
import { redirectUser } from "../utils/authUser";

function MyApp({ Component, pageProps }) {
  return (
    <Layout {...pageProps}>
      <Component {...pageProps} />
    </Layout>
  );
}

/***** HANDLES THE AUTH LOGIC AND PROTECTS ROUTES *****/
MyApp.getInitialProps = async ({ Component, ctx }) => {
  const { token } = parseCookies(ctx);

  let pageProps = {};

  const protectedRoutes = ctx.pathname === "/";

  if (!token) {
    //if user is not logged in redirect to logn route
    protectedRoutes && redirectUser(ctx, "/login");
  } else {
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    try {
      //get the credentials of the logged in user
      const res = await axios.get(`${baseUrl}/api/auth`, { headers: { Authorization: token } });

      const { user, userFollowStats } = res.data;

      if (user) !protectedRoutes && redirectUser(ctx, "/"); //the login user should not access the login and signup page

      pageProps.user = user;
      pageProps.userFollowStats = userFollowStats;
    } catch (error) {
      console.log("error --> ", error);
      destroyCookie(ctx, "token"); //any error destry the cookie and redirect to the login page
      redirectUser(ctx, "/login");
    }
  }

  return { pageProps };
};
export default MyApp;
