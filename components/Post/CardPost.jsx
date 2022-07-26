import React, { useState } from "react";
import {
  Card,
  Icon,
  Image,
  Popup,
  Divider,
  Segment,
  Button,
  Header,
  Modal,
} from "semantic-ui-react";
import Link from "next/link";

import PostComments from "./PostComments";
import CommentInputField from "./CommentInputField";
import calculateTime from "../../utils/calculateTime";
import { deletePost, likePost } from "../../utils/postActions";
import LikeList from "./LikeList";
import ImageModal from "./ImageModal";
import NoImageModal from "./NoImageModal";

const CardPost = ({ user, post, setPosts, setShowToast }) => {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [error, setError] = useState(null);
  const isLiked = likes.length > 0 && likes.filter((like) => like.user === user._id).length > 0;

  //state to show and close the modal
  const [showModal, setShowModal] = useState(false);

  //ImageModal and NoImageModel share the same props so lets distribute their those props dynamically
  const addPropsToModal = () => ({ post, user, setLikes, likes, isLiked, comments, setComments });

  return (
    <>
      {showModal && (
        <Modal open={showModal} closeIcon closeOnDimmerClick onClose={() => setShowModal(false)}>
          <Modal.Content>
            {post.picUrl ? (
              <ImageModal {...addPropsToModal()} />
            ) : (
              <NoImageModal {...addPropsToModal()} />
            )}
          </Modal.Content>
        </Modal>
      )}
      <Segment basic>
        <Card color="teal" fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: "pointer" }}
              floated="left"
              wrapped
              ui={false}
              alt="PostImage"
              onClick={() => setShowModal(true)}
            />
          )}

          <Card.Content>
            <Image floated="left" src={post.user.profilePicUrl} avatar circular />

            {/* only the user who creaed the post an the root user should see the delete icon */}
            {user.role === "root" ||
              (post.user._id === user._id && (
                <>
                  <Popup
                    on="click"
                    postion="top right"
                    trigger={
                      <Image
                        src="/deleteIcon.svg"
                        style={{ cursor: "pointer" }}
                        size="mini"
                        floated="right"
                      />
                    }
                  >
                    <Header as="h4" content="Are you sure?" />
                    <p>This action is irrevesivible</p>

                    <Button
                      color="red"
                      icon="trash"
                      content="Delete"
                      onClick={() => deletePost(post._id, setPosts, setShowToast)}
                    />
                  </Popup>
                </>
              ))}

            <Card.Header>
              <Link href={`/${post.user.username}`}>
                <a>{post.user.name}</a>
              </Link>
            </Card.Header>

            <Card.Meta>{calculateTime(post.createAt)}</Card.Meta>

            {post.location && <Card.Meta content={post.location} />}

            <Card.Description
              style={{ fontSize: "17px", letterSpacing: "0.1px", wordSpacing: "0.35px" }}
            >
              {post.text}
            </Card.Description>
          </Card.Content>

          <Card.Content extra>
            <Icon
              name={isLiked ? "heart" : "heart outline"}
              color="red"
              style={{ cursor: "pointer" }}
              onClick={() => likePost(post._id, user._id, setLikes, isLiked ? false : true)}
            />

            <LikeList
              postId={post._id}
              trigger={
                likes.length > 0 && (
                  <span className="spanlikesList">
                    {`${likes.length} ${likes.length === 1 ? "like" : "likes"}`}
                  </span>
                )
              }
            />

            <Icon name="comment outline" style={{ marginLeft: "7px" }} color="blue" />

            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PostComments
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      user={user}
                      setComments={setComments}
                    />
                  )
              )}

            {comments.length > 3 && (
              <Button
                content="View More"
                color="teal"
                basic
                circular
                onClick={() => setShowModal(true)}
              />
            )}

            <Divider hidden />

            <CommentInputField user={user} postId={post._id} setComments={setComments} />
          </Card.Content>
        </Card>
      </Segment>

      <Divider hidden />
    </>
  );
};

export default CardPost;
