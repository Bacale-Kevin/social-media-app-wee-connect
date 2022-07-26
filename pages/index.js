import React, { useEffect, useState } from "react";
import axios from "axios";
import { Segment } from "semantic-ui-react";
import { parseCookies } from "nookies";

import baseUrl from "../utils/baseUrl";
import { NoPosts } from "../components/Layout/NoData";
import CreatePost from "../components/Post/CreatePost";
import CardPost from "../components/Post/CardPost";
import { PostDeleteToastr } from "../components/Layout/Toastr";

const Index = ({ user, postsData, errorLoading }) => {
  const [posts, setPosts] = useState(postsData);
  const [showToast, setShowToast] = useState(false);
  /********** This is to change the name of the page **********/
  useEffect(() => {
    document.title = `welcome ${user.name.split(" ")[0]}`;
  }, []);

  /********** This is handle toast notification **********/
  useEffect(() => {
    showToast &&
      setTimeout(() => {
        return setShowToast(false);
      }, 3000);
  }, [showToast]);

  if (posts.length === 0 || errorLoading) return <NoPosts />;

  return (
    <>
      {showToast && <PostDeleteToastr />}
      <Segment>
        {/* create post is the form for creating the post */}
        <CreatePost user={user} setPosts={setPosts} showToast={showToast} />

        {posts.map((post) => (
          <CardPost
            key={post._id}
            post={post}
            user={user}
            setPosts={setPosts}
            setShowToast={setShowToast}
          />
        ))}
      </Segment>
    </>
  );
};

export async function getServerSideProps(ctx) {
  try {
    const { token } = parseCookies(ctx); //get the token its a protected route

    const res = await axios.get(`${baseUrl}/api/posts`, { headers: { Authorization: token } });

    return {
      props: {
        postsData: res.data,
      },
    };
  } catch (error) {
    console.log(error.message);
    return {
      props: {
        errorLoading: true,
      },
    };
  }
}

export default Index;
