import React, { useState } from "react";
import { Segment, Grid, Image, Divider, Header, Button, List } from "semantic-ui-react";

import { followUser, unfollowUser } from "../../utils/profileActions";

const ProfileHeader = ({ profile, ownAccount, LoggedUserFollowStats, setUserFollowStats }) => {
  const [loading, setLoading] = useState(false);

  const isFollowing =
    LoggedUserFollowStats.following.length > 0 &&
    LoggedUserFollowStats.following.filter((following) => following.user === profile.user._id).length > 0;
  return (
    <>
      <Segment>
        <Grid stackable>
          <Grid.Column width={11}>
            <Grid.Row>
              <Header as="h2" content={profile.user.name} style={{ marginTop: "5px " }} />
            </Grid.Row>

            <Grid.Row>
              {profile.bio}

              <Divider hidden />
            </Grid.Row>

            <Grid.Row>
              {profile.social ? (
                <List>
                  <List.Item>
                    <List.Icon name="mail" />
                    <List.Content content={profile.user.email} />
                  </List.Item>

                  {profile.social.facebook && (
                    <List.Item>
                      <List.Icon name="facebook" color="blue" />
                      <List.Content style={{ color: "blue" }} content={profile.social.facebook} />
                    </List.Item>
                  )}

                  {profile.social.instagram && (
                    <List.Item>
                      <List.Icon name="instagram" color="red" />
                      <List.Content style={{ color: "blue" }} content={profile.social.instagram} />
                    </List.Item>
                  )}

                  {profile.social.youtube && (
                    <List.Item>
                      <List.Icon name="youtube" color="red" />
                      <List.Content style={{ color: "blue" }} content={profile.social.youtube} />
                    </List.Item>
                  )}

                  {profile.social.twitter && (
                    <List.Item>
                      <List.Icon name="twitter" color="blue" />
                      <List.Content style={{ color: "blue" }} content={profile.social.twitter} />
                    </List.Item>
                  )}
                </List>
              ) : (
                <>No Social Media Links </>
              )}
            </Grid.Row>
          </Grid.Column>

          <Grid.Column width={5} stretched style={{ textAligne: "center" }}>
            <Grid.Row>
              <Image src={profile.user.profilePicUrl} avatar size="large" />
            </Grid.Row>
            <br />

            {!ownAccount && (
              <Button
                compact
                loading={loading}
                disabled={loading}
                content={isFollowing ? "Following" : "Follow"}
                icon={isFollowing ? "check circle" : "add user"}
                color={isFollowing ? "instagram" : "twitter"}
                onClick={async () => {
                  setLoading(true);
                  isFollowing
                    ? await unfollowUser(profile.user._id, setUserFollowStats)
                    : await followUser(profile.user._id, setUserFollowStats);
                  setLoading(false);
                }}
              />
            )}
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
};

export default ProfileHeader;
