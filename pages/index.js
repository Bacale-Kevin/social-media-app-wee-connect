import React from "react";
import axios from "axios";

const Index = ({ posts }) => {
  // console.log(data);
  return (
    <div>
      {posts && posts.length > 0 && posts.map((el) => <div key={el.title}>{el.title}</div>)}
    </div>
  );
};

Index.getInitialProps = async (ctx) => {
  try {
    const res = await axios.get("https://jsonplaceholder.typicode.com/posts");

    const { name } = ctx.query

    console.log(name)

    return { posts: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Index;
