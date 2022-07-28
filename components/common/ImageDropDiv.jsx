import React from "react";
import { Form, Segment, Image, Icon, Header } from "semantic-ui-react";
import { useRouter } from "next/router";

const ImageDropDiv = ({
  highlited,
  setHighlited,
  media,
  setMedia,
  mediaPreview,
  setMediaPreview,
  inputRef,
  handleChange,
  profilePicUrl,
}) => {
  const router = useRouter();
  const signupRoute = router.pathname === "/signup";
  return (
    <>
      <Form.Field>
        <Segment placeholder basic secondary>
          <input style={{ display: "none" }} type="file" accept="image/*" onChange={handleChange} name="media" ref={inputRef} />
          <div
            onDragOver={(e) => {
              e.preventDefault(), setHighlited(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault(), setHighlited(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setHighlited(true);
              //   console.log(Array.from(e.dataTransfer.files));

              const dropptedFile = Array.from(e.dataTransfer.files); // converts into an array
              setMedia(dropptedFile[0]); //access the first element that is dropped
              setMediaPreview(URL.createObjectURL(dropptedFile[0]));
            }}
          >
            {mediaPreview === null ? (
              <>
                <Segment color={highlited ? "green" : undefined} placeholder basic>
                  {signupRoute ? (
                    <>
                      <Header icon>
                        <Icon name="file image outline" style={{ cursor: "pointer" }} onClick={() => inputRef.current.click()} />
                        Drag and Drop or Click To Upload Image
                      </Header>
                    </>
                  ) : (
                    <>
                      <span style={{ textAlign: "center" }}>
                        <Image
                          src={profilePicUrl}
                          style={{ textAlign: "center" }}
                          onClick={() => inputRef.current.click()}
                          size="huge"
                          centered
                        />
                      </span>
                    </>
                  )}
                </Segment>
              </>
            ) : (
              <>
                <Segment color="green" placeholder basic>
                  <Image
                    src={mediaPreview}
                    size="medium"
                    centered
                    style={{ cursor: "pointer" }}
                    onClick={() => inputRef.current.click()}
                  />
                </Segment>
              </>
            )}
          </div>
        </Segment>
      </Form.Field>
    </>
  );
};

export default ImageDropDiv;
