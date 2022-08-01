const UserModel = require("../models/UserModel");
const NotificationModel = require("../models/NotificationModel");

/***** SET THE USER UNREADNOTIFICATION TO TRUE *****/
const setNotificationToUnread = async (userId) => {
  try {
    const user = await UserModel.findById({ user: userId });

    if (!user.unreadNotification) {
      user.unreadNotification = true;

      await user.save();
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

/***** TRIGGERED WHEN USER LIKES A POST *****/
const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({ user: userToNotifyId });

    //add the notification in the notification array
    const newNotifcation = {
      type: "newLike",
      user: userId,
      postId: postId,
      date: Date.now(),
    };

    await userToNotify.notifcations.unshift(newNotifcation);
    await userToNotify.save();

    await setNotificationToUnread(userId); // set the user.unreadNotification to true
    return;
  } catch (error) {
    console.error(error);
  }
};

/***** REMOVE LINKED NOTIFICATION FROM NOTIFICATIONS MODEL FIELD ARRAY  *****/
const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });

    const notificationToRemove = user.notifications.find(
      (notification) =>
        notifcation.type === "newLike" &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId
    );

    const indexOf = user.notifcations
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString());

    await user.notifcations.splice(indexOf, 1);

    await user.save();

    return;
  } catch (error) {
    console.error(error);
  }
};

const newCommentNotification = async (userId, postId, userToNotifyId, text) => {
  try {
    const userToNotify = await NotificationModel.findOne({ user: userToNotifyId });

    const newNotification = {
      type: "newComment",
      user: userId,
      post: postId,
      commentId: commentId,
      text: text,
      date: Date.now(),
    };

    await userToNotify.notifcations.unshift(newNotification);

    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeCommentNotification = async (postId, commentId, userId, userToNotifyId) => {
  try {
    await NotificationModel.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: {
          notifications: {
            type: "newComment",
            user: userId,
            post: postId,
            commentId: commentId,
          },
        },
      }
    );

    // const user = await NotificationModel.findOne({ user: userToNotifyId });
    // const notificationToRemove = await user.notifications.find(
    //   notification =>
    //     notification.type === "newComment" &&
    //     notification.user.toString() === userId &&
    //     notification.post.toString() === postId &&
    //     notification.commentId === commentId
    // );

    // const indexOf = await user.notifications
    //   .map(notification => notification._id.toString())
    //   .indexOf(notificationToRemove._id.toString());

    // await user.notifications.splice(indexOf, 1);
    // await user.save();
    return;
  } catch (error) {
    console.error(error);
  }
};

const newFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });

    const newNotification = {
      type: "newFollower",
      user: userId,
      date: Date.now(),
    };

    await user.notifications.unshift(newNotification);

    await user.save();

    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    await NotificationModel.findOneAndUpdate(
      { user: userToNotifyId },
      { $pull: { notifications: { type: "newFollower", user: userId } } }
    );

    return;

    // const user = await NotificationModel.findOne({ user: userToNotifyId });
    // const notificationToRemove = await user.notifications.find(
    //   notification =>
    //     notification.type === "newFollower" && notification.user.toString() === userId
    // );

    // const indexOf = await user.notifications
    //   .map(notification => notification._id.toString())
    //   .indexOf(notificationToRemove._id.toString());

    // await user.notifications.splice(indexOf, 1);

    // await user.save();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newFollowerNotification,
  removeFollowerNotification,
};
