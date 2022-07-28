import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { parseCookies } from "nookies";
import cookie from "js-cookie";
import { Grid } from "semantic-ui-react";

import baseUrl from "../utils/baseUrl";
import { NoProfile, NoProfilePosts } from "../components/Layout/NoData";
import ProfileMenuTabs from "../components/Profile/ProfileMenuTabs";
import ProfileHeader from "../components/Profile/ProfileHeader";
import { PlaceHolderPosts } from "../components/Layout/PlaceHolderGroup";
import CardPost from "../components/Post/CardPost";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import Followers from "../components/Profile/Followers";
import Following from "../components/Profile/Following";
import UpdateProfile from "../components/Profile/UpdateProfile";

const ProfilePage = ({ user, profile, followersLength, followingLength, errorLoading, userFollowStats }) => {
  const router = useRouter();
  const { username } = router.query;
  const [posts, setPosts] = useState([]); // the profile page we are going to show the post of the user
  const [loading, setLoading] = useState(false);
  const [LoggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);
  const [showToast, setShowToast] = useState(false);

  const ownAccount = profile.user._id === user._id; // ensure that only the  log in is viewing his own account

  //this state is to handle the tabs
  const [activeItem, setActiveItem] = useState("profile");
  const handleItemClick = (item) => setActiveItem(item);

  /********* GET THE USER POST **********/
  const getPosts = async () => {
    setLoading(true);
    const token = cookie.get("token");
    try {
      const res = await axios.get(`${baseUrl}/api/profile/posts/${username}`, { headers: { Authorization: token } });
      setPosts(res.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  /********** USEEFFECT **********/
  useEffect(() => {
    getPosts();
  }, [router.query.username]);

  /********** USEEFFECT TO HANDLE TOAST **********/
  useEffect(() => {
    showToast && setTimeout(() => setShowToast(false), 3000);
  }, [showToast]);

  if (errorLoading) return <NoProfile />;

  return (
    <>
      {showToast && <PostDeleteToastr />}
      <Grid stackable>
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs
              activeItem={activeItem}
              handleItemClick={handleItemClick}
              followersLength={followersLength}
              followingLength={followingLength}
              ownAccount={ownAccount}
              LoggedUserFollowStats={LoggedUserFollowStats}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            {activeItem === "profile" && (
              <>
                <ProfileHeader
                  profile={profile}
                  ownAccount={ownAccount}
                  LoggedUserFollowStats={LoggedUserFollowStats}
                  setUserFollowStats={setUserFollowStats}
                />

                {loading ? (
                  <PlaceHolderPosts />
                ) : posts.length > 0 ? (
                  posts.map((post, i) => (
                    <CardPost key={i} post={post} user={user} setPosts={setPosts} setShowToast={setShowToast} />
                  ))
                ) : (
                  <NoProfilePosts />
                )}
              </>
            )}

            {/* show the follower tab content */}
            {activeItem === "followers" && (
              <Followers
                user={user}
                loggedUserFollowStats={LoggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}

            {/* show the following tab content */}
            {activeItem === "following" && (
              <Following
                user={user}
                loggedUserFollowStats={LoggedUserFollowStats}
                setUserFollowStats={setUserFollowStats}
                profileUserId={profile.user._id}
              />
            )}

            {/* show the following tab content */}
            {activeItem === "updateProfile" && <UpdateProfile Profile={profile}  />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export async function getServerSideProps(ctx) {
  try {
    const { username } = ctx.query;
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: { Authorization: token },
    });

    const { profile, followersLength, followingLength } = res.data;

    return {
      props: {
        profile,
        followersLength,
        followingLength,
      },
    };
  } catch (error) {
    return {
      props: {
        errorLoading: true,
      },
    };
  }
}

export default ProfilePage;
