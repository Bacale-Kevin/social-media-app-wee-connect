import React from "react";
import axios from "axios";
import { parseCookies } from "nookies";

import baseUrl from "../utils/baseUrl";

const messages = ({ chatsData }) => {
    const [chats, setChats] = useState(chatsData)
  return <div>messages</div>;
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
