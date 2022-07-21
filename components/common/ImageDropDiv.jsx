import React from "react";
import { Form, Segment, Image, Icon, Header } from "semantic-ui-react";

const ImageDropDiv = ({
  highlited,
  setHighlited,
  media,
  setMedia,
  mediaPreview,
  setMediaPreview,
  inputRef,
  handleChange,
}) => {
  return (
    <>
      <Form.Field>
        <Segment placeholder basic secondary>
          <input
            style={{ display: "none" }}
            type="file"
            accept="image/*"
            onChange={handleChange}
            name="media"
            ref={inputRef}
          />
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

              const dropptedFile = Array.from(e.dataTransfer.files) // converts into an array
               setMedia(dropptedFile[0]) //access the first element that is dropped
               setMediaPreview(URL.createObjectURL(dropptedFile[0])) 
            }}
          >
            {mediaPreview === null ? (
              <>
                <Segment color={highlited ? "green" : undefined} placeholder basic>
                  <Header icon>
                    <Icon
                      name="file image outline"
                      style={{ cursor: "pointer" }}
                      onClick={() => inputRef.current.click()}
                    />
                    Drap and Drop or Click To Upload Image
                  </Header>
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
