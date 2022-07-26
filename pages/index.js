import React, { useEffect, useState } from "react";
import axios from "axios";
import { Segment } from "semantic-ui-react";
import { parseCookies } from "nookies";
import InfiniteScroll from "react-infinite-scroll-component";

import baseUrl from "../utils/baseUrl";
import { NoPosts } from "../components/Layout/NoData";
import CreatePost from "../components/Post/CreatePost";
import CardPost from "../components/Post/CardPost";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import { PlaceHolderPosts, EndMessage } from "../components/Layout/PlaceHolderGroup";
import cookie from "js-cookie";

const Index = ({ user, postsData, errorLoading }) => {
  const [posts, setPosts] = useState(postsData);
  const [showToast, setShowToast] = useState(false);

  /********* STATE TO HANDLE THE INFINITE SCROLL *********/
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);

  /********* STATE TO HANDLE THE INFINITE SCROLL *********/
  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: cookie.get("token") },
        params: { pageNumber }, //this is receive in the backend through the req.query
      });

      if (res.data.length === 0) setHasMore(false); // if no more post in the backend data.length will be equal 0

      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert("Error fetching posts");
    }
  };

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

        <InfiniteScroll
          hasMore={hasMore}
          next={fetchDataOnScroll} // handler to load more post
          loader={<PlaceHolderPosts />} //loading indicator
          endMessage={<EndMessage />} //end message when there are no more post
          dataLength={posts.length}
        >
          {posts.map((post) => (
            <CardPost
              key={post._id}
              post={post}
              user={user}
              setPosts={setPosts}
              setShowToast={setShowToast}
            />
          ))}
        </InfiniteScroll>
      </Segment>
    </>
  );
};

export async function getServerSideProps(ctx) {
  try {
    const { token } = parseCookies(ctx); //get the token its a protected route

    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: { Authorization: token },
      params: { pageNumber: 1 }, // initially the pagenumber is set to one 
    });

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
