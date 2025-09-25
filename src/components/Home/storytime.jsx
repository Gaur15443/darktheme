import React, {memo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {Card, Text, Avatar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {
  ChatIcon,
  HeartIcon,
  HomeAudio,
  HomeStory,
  AudiosTabIcon,
  StoriesTabIcon,
  QuotesIcon,
  MomentsTabIcon,
} from '../../images';
import {useNavigation} from '@react-navigation/native';
import {timePassed} from '../../utils/format';
import NewTheme from '../../common/NewTheme';
import {useIsFocused} from '@react-navigation/native';
import _ from 'lodash';

dayjs.extend(utc);
dayjs.extend(timezone);
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {DefaultImage, VideoThumbnail} from '../../core';
import {TouchableOpacity} from 'react-native-gesture-handler';
import ErrorBoundary from '../../common/ErrorBoundary';
import Axios from '../../plugin/Axios';
import {setFamilyName, setGroupId} from '../../store/apps/tree';
import { setStoryFilters } from '../../store/apps/story';
const {width: screenWidth} = Dimensions.get('window');
const cardWidth = 350;

const Storytime = () => {
  const navigator = useNavigation();
  const latestStories = useSelector(state => state?.home?.data?.latestStories);
  const userInfo = useSelector(state => state?.userInfo);
  const pageIsFocused = useIsFocused();
  const dispatch = useDispatch();
  const privateTree = useSelector(
    state => state.getprivateTreeList.AllFamilyTrees,
  );
  function shrinkDisplayFamilyName(userFamilyName) {
    try {
      const modifiableName = userFamilyName?.toLowerCase?.();
      if (modifiableName?.includes?.('family')) {
        const nameArray = modifiableName.split(' ');
        const removeFamilyWord = _.startCase(
          nameArray.slice(0, nameArray.length - 1).join(' '),
        );
        if (removeFamilyWord.length > 11) {
          return removeFamilyWord.slice(0, 11) + '...' + ' Family';
        }
      }
      return _.startCase(modifiableName);
    } catch (error) {
      return _.startCase(userFamilyName); // fallback, or just `return userFamilyName || ''`
    }
  }

  return (
    <ErrorBoundary>
      <View style={{flex: 1, flexDirection: 'row'}}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth}
          decelerationRate="fast"
          style={{flex: 1, flexDirection: 'row'}}>
          <View style={styles.wrapper}>
            {latestStories &&
              latestStories?.map((story, storyIndex) => {
                if (story?.storyCreatedBy?._id !== '63e0f5b03ad569001b685e78' && story?.storyCreatedBy?._id !== '63c1338989c1ee001ba797f3') {
                  return (
                <TouchableOpacity
                  key={storyIndex}
                  onPress={() => {
                    navigator.navigate('ViewStory', {SingleStoryId: story});
                  }}
                  activeOpacity={1}>
                  <Card
                    elevation={0.5}
                    style={styles.card}
                    accessibilityLabel="ViewStoryId"
                    onPress={() =>
                      navigator.navigate('ViewStory', {SingleStoryId: story})
                    }>
                    <View
                      style={{
                        backgroundColor: NewTheme.colors.whiteText,
                        borderRadius: 8,
                      }}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <View
                          style={{
                            padding: 12,
                            flex: 9,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <>
                            {story?.storyCreatedBy?.personalDetails
                              ?.profilepic ? (
                              <Avatar.Image
                                size={22}
                                source={{
                                  uri: story?.storyCreatedBy?.personalDetails
                                    ?.profilepic,
                                }}
                                style={styles.avtarImage}
                              />
                            ) : (
                              <DefaultImage
                                size={22}
                                firstName={
                                  story?.storyCreatedBy?.personalDetails?.name
                                }
                                lastName={
                                  story?.storyCreatedBy?.personalDetails
                                    ?.lastname
                                }
                                gender={
                                  story?.storyCreatedBy?.personalDetails?.gender
                                }
                              />
                            )}
                          </>
                          <Text style={styles.personName}>
                            {story?.storyCreatedBy?.personalDetails?.name +
                              ' ' +
                              story?.storyCreatedBy?.personalDetails?.lastname}
                          </Text>
                        </View>
                        <View
                          style={{
                            alignItems: 'center',
                            paddingRight: 8,
                            flex: 3,
                          }}>
                          <Text style={styles.time}>
                            {timePassed(story?.storyCreatedAt)}
                          </Text>
                        </View>
                      </View>
                      <View style={{paddingHorizontal: 12}}>
                        <Text style={styles.title}>
                          {story?.storiesTitle &&
                          story?.storiesTitle.length > 30
                            ? story?.storiesTitle.slice(0, 30) + '...'
                            : story?.storiesTitle}
                        </Text>
                      </View>

                      <View style={{padding: 12, height: 200}}>
                        {/* Audio */}

                        {story?.categoryId?.[0]?.categoryName === 'Audios' && (
                          <HomeAudio />
                        )}

                        {/* Moment */}
                        {story?.categoryId?.[0]?.categoryName === 'Moment' && (
                          <View
                            style={{
                              height: 180,
                            }}>
                            {story?.media?.length === 1 &&
                              (story?.media?.[0]?.urlType === 'Image' ? (
                                <Image
                                  source={{uri: story?.media?.[0]?.mediaUrl}}
                                  style={styles.backgroundImage}
                                />
                              ) : (
                                <VideoThumbnail
                                  key={pageIsFocused}
                                  renderLocalThumbnailIos={true}
                                  thumbnailUrl={
                                    story?.media?.[0]?.thumbnailUrl
                                      ? story?.media?.[0]?.thumbnailUrl
                                      : story?.media?.[0]?.mediaUrl
                                  }
                                  autoPlay={false}
                                  src={story?.media?.[0]?.mediaUrl}
                                  preventPlay={true}
                                  disableFullscreen={true}
                                  disableSeekbar={true}
                                  disablePlayPause={true}
                                  disableTimer={true}
                                  resize="cover"
                                  imuwThumbStyle={{
                                    height: 180,
                                    width: '100%',
                                  }}
                                  imuwMediaStyle={{
                                    height: 180,
                                    width: '100%',
                                  }}
                                />
                              ))}
                            {story?.media?.length === 2 && (
                              <View style={{flexDirection: 'row', gap: 3}}>
                                <View style={{flex: 6}}>
                                  {story?.media?.[0]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[0]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[0]?.thumbnailUrl
                                          ? story?.media?.[0]?.thumbnailUrl
                                          : story?.media?.[0]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[0]?.mediaUrl}
                                      preventPlay={true}
                                      resize="cover"
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                                <View style={{flex: 6}}>
                                  {story?.media?.[1]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[1]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[1]?.thumbnailUrl
                                          ? story?.media?.[1]?.thumbnailUrl
                                          : story?.media?.[1]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[1]?.mediaUrl}
                                      preventPlay={true}
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      resize="cover"
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                              </View>
                            )}
                            {story?.media?.length >= 3 && (
                              <View style={{flexDirection: 'row', gap: 3}}>
                                <View style={{flex: 4}}>
                                  {story?.media?.[0]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[0]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[0]?.thumbnailUrl
                                          ? story?.media?.[0]?.thumbnailUrl
                                          : story?.media?.[0]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[0]?.mediaUrl}
                                      preventPlay={true}
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      resize="cover"
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                                <View style={{flex: 4}}>
                                  {story?.media?.[1]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[1]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[1]?.thumbnailUrl
                                          ? story?.media?.[1]?.thumbnailUrl
                                          : story?.media?.[1]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[1]?.mediaUrl}
                                      preventPlay={true}
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      resize="cover"
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                                <View style={{flex: 4}}>
                                  {story?.media?.[2]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[2]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[2]?.thumbnailUrl
                                          ? story?.media?.[2]?.thumbnailUrl
                                          : story?.image?.[2]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[2]?.mediaUrl}
                                      preventPlay={true}
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      resize="cover"
                                      imuwThumbStyle={{
                                      height: 180,
                                      width: '100%',
                                    }}
                                    imuwMediaStyle={{
                                      height: 180,
                                      width: '100%',
                                    }}
                                    />
                                  )}
                                </View>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Quote */}

                        {story?.categoryId?.[0]?.categoryName === 'Quotes' && (
                          <ImageBackground
                            source={{uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/homeQuote.png'}}
                            style={styles.imageBackground}>
                            <View
                              style={{
                                marginHorizontal: 37,
                              }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  marginTop: 18,
                                  textAlign: 'center',
                                }}>
                                {story?.contents?.[0]?.templateContent &&
                                story?.contents?.[0]?.templateContent
                                  .trim()
                                  .split('\n')
                                  .filter(line => line.trim() !== '')
                                  .join('\n').length > 40
                                  ? story?.contents?.[0]?.templateContent
                                      .trim()
                                      .split('\n')
                                      .filter(line => line.trim() !== '')
                                      .join('\n')
                                      .slice(0, 40) + '...'
                                  : story?.contents?.[0]?.templateContent
                                      .trim()
                                      .split('\n')
                                      .filter(line => line.trim() !== '')
                                      .join('\n')}
                              </Text>
                            </View>
                          </ImageBackground>
                        )}

                        {/* story */}
                        {['Moment', 'Audios', 'Quotes'].indexOf(
                          story?.categoryId?.[0]?.categoryName,
                        ) === -1 && (
                          <View
                            style={{
                              height: 180,
                            }}>
                            {story?.media?.length === 0 && <HomeStory />}
                            {story?.media?.length === 1 &&
                              (story?.media?.[0]?.urlType === 'Image' ? (
                                <Image
                                  source={{uri: story?.media?.[0]?.mediaUrl}}
                                  style={styles.backgroundImage}
                                />
                              ) : (
                                <VideoThumbnail
                                  key={pageIsFocused}
                                  renderLocalThumbnailIos={true}
                                  thumbnailUrl={
                                    story?.media?.[0]?.thumbnailUrl
                                      ? story?.media?.[0]?.thumbnailUrl
                                      : story?.media?.[0]?.mediaUrl
                                  }
                                  autoPlay={false}
                                  src={story?.media?.[0]?.mediaUrl}
                                  preventPlay={true}
                                  resize="cover"
                                  disableFullscreen={true}
                                  disableSeekbar={true}
                                  disablePlayPause={true}
                                  disableTimer={true}
                                  imuwThumbStyle={{
                                      height: 180,
                                      width: '100%',
                                    }}
                                  imuwMediaStyle={{
                                      height: 180,
                                      width: '100%',
                                    }}
                                />
                              ))}
                            {story?.media?.length === 2 && (
                              <View style={{flexDirection: 'row', gap: 3}}>
                                <View style={{flex: 6}}>
                                  {story?.media?.[0]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[0]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[0]?.thumbnailUrl
                                          ? story?.media?.[0]?.thumbnailUrl
                                          : story?.media?.[0]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[0]?.mediaUrl}
                                      preventPlay={true}
                                      resize="cover"
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                                <View style={{flex: 6}}>
                                  {story?.media?.[1]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[1]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[1]?.thumbnailUrl
                                          ? story?.media?.[1]?.thumbnailUrl
                                          : story?.media?.[1]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[1]?.mediaUrl}
                                      preventPlay={true}
                                      resize="cover"
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                              </View>
                            )}
                            {story?.media?.length >= 3 && (
                              <View style={{flexDirection: 'row', gap: 3}}>
                                <View style={{flex: 4}}>
                                  {story?.media?.[0]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[0]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[0]?.thumbnailUrl
                                          ? story?.media?.[0]?.thumbnailUrl
                                          : story?.media?.[0]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[0]?.mediaUrl}
                                      preventPlay={true}
                                      resize="cover"
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                                <View style={{flex: 4}}>
                                  {story?.media?.[1]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[1]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[1]?.thumbnailUrl
                                          ? story?.media?.[1]?.thumbnailUrl
                                          : story?.media?.[1]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[1]?.mediaUrl}
                                      preventPlay={true}
                                      resize="cover"
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                     imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                                <View style={{flex: 4}}>
                                  {story?.media?.[2]?.urlType === 'Image' ? (
                                    <Image
                                      source={{
                                        uri: story?.media?.[2]?.mediaUrl,
                                      }}
                                      style={styles.backgroundImage}
                                    />
                                  ) : (
                                    <VideoThumbnail
                                      key={pageIsFocused}
                                      renderLocalThumbnailIos={true}
                                      thumbnailUrl={
                                        story?.media?.[2]?.thumbnailUrl
                                          ? story?.media?.[2]?.thumbnailUrl
                                          : story?.image?.[2]?.mediaUrl
                                      }
                                      autoPlay={false}
                                      src={story?.media?.[2]?.mediaUrl}
                                      preventPlay={true}
                                      resize="cover"
                                      disableFullscreen={true}
                                      disableSeekbar={true}
                                      disablePlayPause={true}
                                      disableTimer={true}
                                      imuwThumbStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                      imuwMediaStyle={{
                                        height: 180,
                                        width: '100%',
                                      }}
                                    />
                                  )}
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>

                      <View
                        style={{
                          padding: 12,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginLeft: 8,
                        }}>
                        <View style={{flexDirection: 'row'}}>
                          <View style={{flexDirection: 'row'}}>
                            <HeartIcon />
                            <Text style={styles.count}>
                              {story?.likesCounts}
                            </Text>
                          </View>
                          <View
                            style={{
                              paddingHorizontal: 6,
                              flexDirection: 'row',
                            }}>
                            <ChatIcon />
                            <Text style={styles.comment}>
                              {story?.commentsCount}
                            </Text>
                          </View>
                        </View>
                        <View>
                          {story?.categoryId?.[0]?.categoryName ===
                            'Moment' && (
                            <View
                              style={{
                                padding: 10,
                                borderRadius: 6,
                                backgroundColor: '#FFEEE4',
                              }}>
                              <MomentsTabIcon />
                            </View>
                          )}
                          {story?.categoryId?.[0]?.categoryName ===
                            'Audios' && (
                            <View
                              style={{
                                padding: 10,
                                borderRadius: 6,
                                backgroundColor: '#D2FFF2',
                              }}>
                              <AudiosTabIcon />
                            </View>
                          )}
                          {story?.categoryId?.[0]?.categoryName ===
                            'Quotes' && (
                            <View
                              style={{
                                padding: 12,
                                borderRadius: 6,
                                backgroundColor: '#FFE0E0',
                              }}>
                              <QuotesIcon stroke="#FF4F4F" strokeWidth={1.5} />
                            </View>
                          )}
                          {['Moment', 'Audios', 'Quotes'].indexOf(
                            story?.categoryId?.[0]?.categoryName,
                          ) === -1 && (
                            <View
                              style={{
                                padding: 10,
                                borderRadius: 6,
                                backgroundColor: '#DFEEF9',
                              }}>
                              <StoriesTabIcon />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
                  );
                }
                return null;
              })}
          </View>
          <View style={styles.wrapperSee}>
            <Card
              style={styles.card}
              onPress={() => {
                const ownerTree = privateTree?.treeList?.filter(
                  item => item?.user?.role === 'owner',
                );
                Axios.get(
                  `/getGroupIdByTreeAndUser/${ownerTree?.[0]?.tree.id}/${userInfo?._id}`,
                ).then(response => {
                  const familyName = shrinkDisplayFamilyName(
                    ownerTree?.[0]?.tree.name,
                  );
                  dispatch(setGroupId(response?.data?.groupId));
                  dispatch(setStoryFilters('allPosts'));
                  dispatch(setFamilyName(familyName));
                  navigator.navigate('Stories');
                });
              }}>
              <View style={styles.cardContent}>
                <View style={styles.containerAvt}>
                  {latestStories &&
                    latestStories?.map((story, storyIndex) => (
                      <View key={storyIndex} style={styles.imageWrapper}>
                        {story?.storyCreatedBy?.personalDetails?.profilepic ? (
                          <Avatar.Image
                            size={40}
                            source={{
                              uri: story?.storyCreatedBy?.personalDetails
                                ?.profilepic,
                            }}
                            style={[
                              storyIndex !== 0 && styles.overlapImage,
                              storyIndex === 0 && styles.firstImage,
                              styles.shadow,
                            ]}
                          />
                        ) : (
                          <View
                            style={[
                              {
                                height: 40,
                                width: 40,
                                borderRadius: 20,
                              },
                              storyIndex !== 0 && styles.overlapImage,
                              storyIndex === 0 && styles.firstImage,
                              styles.shadow,
                            ]}>
                            <DefaultImage
                              size={40}
                              firstName={
                                story?.storyCreatedBy?.personalDetails?.name
                              }
                              lastName={
                                story?.storyCreatedBy?.personalDetails?.lastname
                              }
                              gender={
                                story?.storyCreatedBy?.personalDetails?.gender
                              }
                            />
                          </View>
                        )}
                      </View>
                    ))}
                </View>
                <Text style={styles.emptycard}>
                  <Text style={styles.textCheck}>
                    Check out more posts on the iMeUsWe family wall
                  </Text>
                  {'\n'}
                  <Text style={styles.see}>See more</Text>
                </Text>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingLeft: 5,
    paddingTop: 5,
    paddingBottom: 8,
  },
  wrapperSee: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: NewTheme.colors.whiteText,
    width: 350,
    marginRight: (screenWidth - cardWidth) / 6.6,
    borderRadius: 8,
  },
  backgroundImage: {
    // Add your styles for the ImageBackground
    resizeMode: 'cover',
    height: 180,
    width: '100%',
  },
  avtarImage: {
    borderWidth: 3,
    borderColor: 'rgb(41, 221, 69)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    color: NewTheme.colors.blackText,
    fontWeight: '600',
    opacity: 0.9,
    fontSize: 14,
    paddingLeft: 6,
  },
  time: {
    color: NewTheme.colors.secondaryLightBlue,
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'right',
  },
  title: {
    color: NewTheme.colors.blackText,
    fontSize: 18,
    fontWeight: 600,
  },
  comment: {
    fontWeight: '400',
    fontSize: 14,
    color: NewTheme.colors.lightText,
    paddingHorizontal: 2,
  },
  count: {
    fontWeight: '400',
    fontSize: 14,
    color: NewTheme.colors.lightText,
    paddingHorizontal: 1,
  },
  emptycard: {
    fontWeight: 600,
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  textCheck: {
    textAlign: 'center',
  },
  see: {
    fontSize: 16,
    fontWeight: 700,
    color: NewTheme.colors.secondaryLightBlue,
    textAlign: 'center',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  imageBackground: {
    flex: 1,
    height: 180,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerAvt: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingBottom: 20,
  },
  imageWrapper: {
    marginRight: 30, // Adjust spacing between images if needed
  },
  overlapImage: {
    position: 'absolute',
    right: 4, // Adjust to overlap as needed
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 7,
  },
  firstImage: {
    marginLeft: 40,
  },
});
export default memo(Storytime);
