import React, { useEffect } from "react";
import axios from "axios";

const Index = ({ user, userFollowStats }) => {
  console.log(user.name);
  /********** This is to change the name of the page **********/
  useEffect(() => {
    document.title = `welcome ${user.name.split(" ")[0]}`;
  }, []);

  return (
    <div>
      {/* {posts && posts.length > 0 && posts.map((el) => <div key={el.title}>{el.title}</div>)} */}
    </div>
  );
};

export default Index;
