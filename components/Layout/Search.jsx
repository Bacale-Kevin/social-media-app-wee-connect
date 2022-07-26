import React, { useEffect, useState } from "react";
import { List, Image, Search } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import Router from "next/router";

import baseUrl from "../../utils/baseUrl";

const SearchComponent = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  let cancel;

  const handleChange = async (e) => {
    const { value } = e.target;

    if (value.length === 0) return setText(value);
    setText(value);
    setLoading(true);

    try {
      cancel && cancel();
      const cancelToken = axios.CancelToken;
      const token = cookie.get("token");

      const res = await axios.get(`${baseUrl}/api/search/${text}`, {
        headers: { Authorization: token },
        cancelToken: new cancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (res.data.length === 0) {
        results.length > 0 && setResults([]);
        return setLoading(false);
      }

      setResults(res.data);
    } catch (error) {
      console.log(`Error searching --> ${error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (text.length === 0 && loading) setLoading(false);
  }, [text]);

  return (
    <Search
      onBlur={() => {
        results.length > 0 && setResults([]);
        loading && setLoading(false);
        setText("");
      }}
      loading={loading}
      value={text}
      resultRenderer={ResultRenderer}
      results={results}
      onSearchChange={handleChange}
      minCharacters={1}
      onResultSelect={(e, data) => {
        if (data) {
          return Router.push(`/${data.result.username}`);
        }
      }}
    />
  );
};

const ResultRenderer = ({ _id, profilePicUrl, name }) => {
  return (
    <List key={_id}>
      <List.Item>
        <Image src={profilePicUrl} alt="profilePic" avatar />
        <List.Content header={name} as="a" />
      </List.Item>
    </List>
  );
};

export default SearchComponent;
