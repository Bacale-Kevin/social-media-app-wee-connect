import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import { Segment, Header, Divider, Comment, Grid, Icon } from "semantic-ui-react";
import { useRouter } from "next/router";
import io from "socket.io-client";

import { NoMessages } from "../components/Layout/NoData";
import Chat from "../components/Chats/Chat";
import ChatListSearch from "../components/Chats/ChatListSearch";
import baseUrl from "../utils/baseUrl";

const messages = ({ chatsData, user }) => {
  const [chats, setChats] = useState(chatsData);
  const [connectedUsers, setConnectedUsers] = useState([])
  const router = useRouter();
  const socket = useRef();

<<<<<<< HEAD
=======
//   console.log(connectedUsers);
>>>>>>> main

  useEffect(() => {
    //initialize with the baseUrl
    if (!socket.current) {
      socket.current = io(baseUrl);
    }
    //if connected 
    if (socket.current) {
      
      socket.current.emit("join", { userId: user });

      socket.current.on("connectedUsers", ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.messages)
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, { shallow: true });
  }, []);

  return (
    <Segment padded basic size="large" style={{ marginTop: "5px" }}>
      <Header icon="home" content="Go Back" onClick={() => router.push("/")} style={{ cursor: "pointer" }} />
      <Divider hidden />

      <div style={{ marginBottom: "10px" }}>
        <ChatListSearch user={user} chats={chats} setChats={setChats} />
      </div>

      {chats.length > 0 ? (
        <>
          <Grid stackable>
            <Grid.Column width={4}>
              <Comment.Group size="big">
                <Segment raised style={{ overflow: "auto", maxHeight: "32rem " }}>
                  {chats.map((chat, i) => (
                    <Chat connectedUsers={connectedUsers} key={i} chat={chat} setChats={setChats} />
                  ))}
                </Segment>
              </Comment.Group>
            </Grid.Column>
          </Grid>
        </>
      ) : (
        <>
          <NoMessages />
        </>
      )}
    </Segment>
  );
};

export async function getServerSideProps(ctx) {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/chats`, { headers: { Authorization: token } });

    return {
      props: {
        chatsData: res.data,
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

export default messages;
