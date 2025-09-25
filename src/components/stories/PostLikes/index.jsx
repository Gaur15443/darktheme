
import React, {useEffect, useState} from 'react';
import {DefaultImage} from '../../../components';
import {fetchAllUsersStoryLikes} from '../../../store/apps/story';
import {ActivityIndicator, Image, View} from 'react-native';

import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch} from 'react-redux';
import {GlobalStyle} from '../../../core';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import {useTheme, Text} from 'react-native-paper';

const PostLikes = ({storyId = ''}) => {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const dispatch = useDispatch();

  const _id = storyId;

  const [storyLikesUser, setStoryLikesUser] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const fetchedStoryLikesUser = await dispatch(
          fetchAllUsersStoryLikes(_id),
        ).unwrap();
        setStoryLikesUser(fetchedStoryLikesUser);
      } catch (error) {
        // toast.error(error.message);
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      } finally {
        // Set loading to false when the operation is complete
        setLoading(false);
      }
    })();
  }, [_id, dispatch]);

  return (
    <>
      <GlobalStyle
        style={{
          backgroundColor: theme.colors.background,
        }}>
        <View style={{marginTop: 0, height: 80}} />
        <View
          style={{
            // The drawer height is 400
            // 92.2 is just an approximated value to make it take around 100%.
            height: 400 - 92.2,
          }}>
          <ScrollView
            style={{
              backgroundColor: theme.colors.background,
              height: '100%',
              paddingBottom: 28,
            }}>
            <View>
              <View>
                <View>
                  {loading ? (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                      }}>
                      <ActivityIndicator size="large" />
                    </View>
                  ) : storyLikesUser && storyLikesUser?.length > 0 ? (
                    // eslint-disable-next-line no-shadow
                    storyLikesUser.map(({_id, storylikes}) => (
                      <View key={_id} style={{gap: 10}}>
                        {storylikes.map(
                          ({name, lastname, profilepic, gender}, index) => (
                            <View
                              key={`${name}-${lastname}`}
                              style={{
                                borderWidth: 1,
                                borderColor: '#ebebeb',
                                backgroundColor: '#ebebeb',
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 15,
                                padding: 8,
                              }}>
                              {profilepic?.length > 0 ? (
                                <Image
                                  style={{
                                    height: 35,
                                    width: 35,
                                    borderRadius: 50,
                                  }}
                                  source={{uri: profilepic}}
                                  alt="profileImage"
                                />
                              ) : (
                                <View>
                                  <DefaultImage
                                    fontWeight={700}
                                    fontSize={15}
                                    borderRadius={50}
                                    height={35}
                                    width={35}
                                    gender={gender}
                                    firstName={name}
                                    lastName={lastname}
                                  />
                                </View>
                              )}
                              <Text
                                style={{
                                  fontWeight: 600,
                                  fontSize: 17,
                                  color: 'black',
                                }}>
                                {`${name} ${lastname}`}
                              </Text>
                            </View>
                          ),
                        )}
                        {/* Just a placeholder, without it it doesn't scroll to last part. */}
                        <View style={{height: 90}} />
                      </View>
                    ))
                  ) : null}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </GlobalStyle>
    </>
  );
};

export default PostLikes;
PostLikes.propTypes = {
  storyId: PropTypes.string,
};

PostLikes.displayName = 'PostLikes';
