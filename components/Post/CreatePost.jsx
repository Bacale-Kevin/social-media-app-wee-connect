import React, { useState, useRef } from "react";
import { Form, Button, Image, Divider, Message, Icon } from "semantic-ui-react";

import uploadPic from "../../utils/uploadPicToCloudinary";
import { submitNewPost } from "../../utils/postActions";

const CreatePost = ({ user, setPosts }) => {
  const [newPost, setNewPost] = useState({
    text: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const inputRef = useRef();

  /********** HANDLE CHANGE BOTH FOR FILES AND FIELDS **********/
  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  /********** HANDLE MEDIA CHANGE **********/
  const handleMediaChange = (e) => {
    const { name, files } = e.target;
    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
  };

  /********** HANDLE SUBMIT **********/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    //handle ccloudinary upload
    let picUrl;
    if (media !== null) {
      picUrl = await uploadPic(media);
    }
    // console.log('PICURL --> ', picUrl)
    // if (!picUrl) {
    //   setLoading(false);
    //   return setError("Error Uploading Image/ Make Sure File Is Below 10MB");
    // }

    await submitNewPost(
      newPost.text,
      newPost.location,
      picUrl,
      setPosts,
      setNewPost,
      setError
    );

    setMedia(null);
    setMediaPreview(null);
    setLoading(false);
  };

  return (
    <>
      <Form error={error !== null} onSubmit={handleSubmit}>
        <Message error onDismiss={() => setError(null)} content={error} header="Ooops!" />

        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />

          <Form.TextArea
            placeholder="What's Happening ?"
            name="text"
            value={newPost.text}
            onChange={handleChange}
            rows={4}
            width={14}
          />
        </Form.Group>

        <Form.Group>
          <Form.Input
            value={newPost.location}
            name="location"
            onChange={handleChange}
            label="Add Location"
            icon="map marker alternate"
            placeholder="Want to add Location"
          />

          <input
            style={{ display: "none" }}
            ref={inputRef}
            name="media"
            type="file"
            onChange={handleMediaChange}
            accept="image/*"
          />
        </Form.Group>

        <div
          style={{
            textAlign: "center",
            height: "150px",
            width: "150px",
            border: "dotted",
            paddingTop: media === null && "60px",
            cursor: "pointer",
            borderColor: highlighted ? "green" : "black",
          }}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setHighlighted(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setHighlighted(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHighlighted(true);

            const droppedFile = Array.from(e.dataTransfer.files);

            setMedia(droppedFile[0]);
            setMediaPreview(URL.createObjectURL(droppedFile[0]));
          }}
        >
          {media === null ? (
            <>
              <Icon name="plus" size="big" />
            </>
          ) : (
            <>
              <Image
                style={{ height: "150px", width: "150px" }}
                src={mediaPreview}
                alt="Post Image"
                centered
                size="medium"
                onClick={() => inputRef.current.click}
              />
            </>
          )}
        </div>
        <Divider hidden />

        <Button
          circular
          disabled={newPost.text === "" || loading}
          content={<strong>Post </strong>}
          style={{ backgroundColor: "#1DA1F2", color: "white" }}
          icon="send"
          loading={loading}
        />
      </Form>
      <Divider />
    </>
  );
};

export default CreatePost;
