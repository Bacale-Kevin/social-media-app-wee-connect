import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Message, Divider } from "semantic-ui-react";
import axios from "axios";
import cookie from 'js-cookie'

import baseUrl from "../utils/baseUrl";
import { HeaderMessage, FooterMessage } from "../components/common/WelcomeMessage";
import { loginUser } from "../utils/authUser";

const login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { email, password } = user;

  /********** HANDLE CHANGE ***************/
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  /********** HANDLE SUBMIT ***************/
  const handleSubmit = async (e) => {
    e.preventDefault();

    await loginUser(user, setErrMsg, setFormLoading);
  };

  /******** USEFFECT *******/
  useEffect(() => {
    const isUser = Object.values({ email, password }).every((item) => Boolean(item)); //Convert object to array and return true if all the condition is fulfilled that is if all the fields in the object has a value
    isUser ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  /******** GET EMAIL FROM THE COOKIE AND AUTO FILL THE EMAIL FIELD  *******/
  useEffect(() => {
    document.title='welcome back'
    const userEmail = cookie.get('userEmail') //this is set when the user logout
    if(userEmail) setUser(prev => ({...prev, email: userEmail}))
  }, []);

  return (
    <>
      <HeaderMessage />

      <Form loading={formLoading} error={errMsg !== null} onSubmit={handleSubmit}>
        <Message error header="Ooops!" content={errMsg} onDismiss={() => setErrMsg(null)} />

        <Divider hidden />
        <Divider hidden />
        <Divider hidden />

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

        <Divider hidden />
        <Button content="Login" type="submit" color="teal" disabled={submitDisabled} />

        <Divider hidden />
        <Divider hidden />
        <Divider hidden />
      </Form>
      <FooterMessage />
    </>
  );
};

export default login;
