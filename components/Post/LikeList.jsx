import React, { useState } from "react";
import { List, Popup, Image } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import Link from "next/link";

import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import { LikesPlaceHolder } from "../Layout/PlaceHolderGroup";

const LikeList = ({ postId, trigger }) => {
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLikesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/like/${postId}`, {
        headers: { Authorization: cookie.get("token") },
      });

      setLikesList(res.data);
    } catch (error) {
      console.log(catchErrors(error));
    }
    setLoading(false);
  };
  return (
    <>
      <Popup
        on="click"
        onClose={() => setLikesList([])}
        onOpen={getLikesList}
        popperDependencies={[likesList]}
        trigger={trigger}
        wide
      >
        {loading ? (
          <LikesPlaceHolder />
        ) : (
          <>
            {likesList.length > 0 && (
              <div
                style={{ overflow: "auto", maxHeight: "15rem", height: "15rem", minWidth: "210px" }}
              >
                <List selection size="large">
                  {likesList.map((like) => (
                    <List.Item key={like._id}>
                      <Image avatar src={like.user.profilePicUrl} />
                      <List.Content>
                        <Link href={`/${like.user.username}`}>
                          <List.Header as="a" content={like.user.name} />
                        </Link>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </div>
            )}
          </>
        )}
      </Popup>
    </>
  );
};

export default LikeList;
