import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Message, Divider } from "semantic-ui-react";
import axios from "axios";

import baseUrl from "../utils/baseUrl";
import { HeaderMessage, FooterMessage } from "../components/common/WelcomeMessage";
import CommonInputs from "../components/common/CommonInputs";
import ImageDropDiv from "../components/common/ImageDropDiv";

const signup = () => {
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  /**  Giving a seperate state to the username because we will check whether the
    username is available or not when we type */
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false); // laoding state that loads spinner when the user types his username in the input fields to check whether is available or not
  const [usernameAvailbale, setUsernameAvailbale] = useState(false); // staet to check if the username is available
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    facebook: "",
    youtube: "",
    twitter: "",
    instagram: "",
  });

  const { name, email, password, bio } = user;

  const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/; //user to validate the username field by not accepting special characters
  let cancel; // variable used to cancel pending api request

  /*******HANDLE IMAGE UPLOAD ******/
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const inputRef = useRef();

  /********** HANDLE CHANGE ***************/
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  /********** HANDLE MEDIA CHANGE **********/
  const handleMediaChange = (e) => {
    const { name, files } = e.target;
    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
  };

  /********** HANDLE SUBMIT ***************/
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  /******** USEFFECT TO DISABLE SUBMIT BUTTON IF REQUIRE FIELDS ARE NOT ENTERED *******/
  useEffect(() => {
    const isUser = Object.values({ name, email, password, bio }).every((item) => Boolean(item)); //Convert object to array and return true if all the condition is fulfilled that is if all the fields in the object has a value
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  /******** FUNCTION TO CHECK IF USERNAME IS TAKEN *******/
  const checkUsername = async () => {
    setUsernameLoading(true);
    try {
      cancel && cancel(); //basically this cancel pending request and makes new request
      const CancelToken = axios.CancelToken; //enables us cancel pending request in axios
      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (res.data === "Available") {
        setUsernameAvailbale(true);
        setUser((prev) => ({ ...prev, username })); //set the available username in the state
      }
    } catch (error) {
      setErrMsg("Username Not Availbable");
    }
    setUsernameLoading(false);
  };

  /******** USEFFECT TO HANDLE THE USERNAME FIELD *******/
  useEffect(() => {
    username === "" ? setUsernameAvailbale(false) : checkUsername(); //on every username input change this function is fired
  }, [username]);

  return (
    <>
      <HeaderMessage />
      <Form loading={formLoading} error={errMsg !== null} onSubmit={handleSubmit}>
        <Message error header="Ooops!" content={errMsg} onDismiss={() => setErrMsg(null)} />

        {/* Image Input */}
        <ImageDropDiv
          media={media}
          highlited={highlighted}
          inputRef={inputRef}
          mediaPreview={mediaPreview}
          setHighlited={setHighlighted}
          setMedia={setMedia}
          setMediaPreview={setMediaPreview}
          handleChange={handleMediaChange}
        />

        {/* <Segment> */}
        <Divider hidden />
        <Divider hidden />
        <Divider hidden />

        <Form.Input
          label="Name"
          placeholder="Name"
          name="name"
          value={name}
          onChange={handleChange}
          icon="user"
          fluid
          iconPosition="left"
          required
        />

        <Form.Input
          label="Email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={handleChange}
          icon="envelope"
          fluid
          iconPosition="left"
          type="email"
          required
        />

        <Form.Input
          label="Password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={handleChange}
          icon={{
            name: "eye",
            circular: true,
            link: true,
            onClick: () => setShowPassword(!showPassword),
          }}
          fluid
          iconPosition="left"
          type={showPassword ? "text" : "password"}
          required
        />

        <Form.Input
          loading={usernameLoading}
          error={!usernameAvailbale}
          label="Username"
          placeholder="Username"
          name="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (regexUserName.test(e.target.value)) {
              setUsernameAvailbale(true);
            } else {
              setUsernameAvailbale(false);
            }
          }}
          icon={usernameAvailbale ? "check" : "close"}
          fluid
          iconPosition="left"
          required
        />

        <CommonInputs
          user={user}
          showSocialLinks={showSocialLinks}
          setShowSocialLinks={setShowSocialLinks}
          handleChange={handleChange}
        />
        {/* </Segment> */}

        <Divider hidden />
        <Button
          content="Signup"
          type="submit"
          color="teal"
          disabled={submitDisabled || !usernameAvailbale}
        />

        <Divider hidden />
        <Divider hidden />
        <Divider hidden />
      </Form>

      <FooterMessage />
    </>
  );
};

export default signup;
