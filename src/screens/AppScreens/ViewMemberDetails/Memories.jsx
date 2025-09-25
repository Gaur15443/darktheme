/* eslint-disable react/self-closing-comp */

import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';
import EmptyMemory from '../../../images/Icons/EmptyMemory';
import { CustomButton, VideoThumbnail } from '../../../core';
import LifestoryIcon from '../../../images/Icons/LifestoryIcon';
import MultipleMedia from '../../../images/Icons/MultipleMedia';
import {
  AudiosIcon,
  MomentIcon,
  QuotesTagIcon,
  StoryIcon,
  TaggingIcon,
} from '../../../images';

import {
  fetchMemoriesData,
  resetMemoriesApiDta,
  fetchOneMemoryData,
} from '../../../store/apps/viewMemory';
import { deleteOneMemoryData } from '../../../store/apps/viewMemory';
import Confirm from '../../../components/Confirm';

import MediaSlider from '../../../core/Media/MediaSlider';
import { useDispatch, useSelector } from 'react-redux';

import {
  Modal,
  Portal,
  ActivityIndicator,
  Card,
  useTheme,
} from 'react-native-paper';
import Spinner from '../../../common/Spinner';
import ErrorBoundary from '../../../common/ErrorBoundary';
import FullMediaViewer from '../../../common/Global-Media-Controller/FullMediaViewer';
const { width, height } = Dimensions.get('window');

const Memories = props => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const slides = useSelector(state => state?.apiViewMemory?.memories);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteMediaId, setDeleteMediaId] = useState(false);
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [array, setArray] = useState([]);
  const [previousIndex, setIndex] = useState(null);
  const memoriesApiData = useSelector(state => state?.apiViewMemory?.memories);
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredItems = memoriesApiData.filter(item => {
    const mediaCount = item?.mediaIds?.length || 0;
    const taggedInStory = item?.taggedInStory === true;
    // Include the item if it has media or it is tagged in a story, regardless of media count
    return mediaCount > 0 || taggedInStory;
  });

  const showState = filteredItems.every(item => item.mediaIds.length === 0);

  const isDataFetched = useSelector(state => state.apiViewMemory.isDataFetched);
  const memories = useSelector(state => state.apiViewMemory.memories);

  const getUserMemories = async () => {
    // if (isDataFetched && memories?.length > 0) return; // Prevent unnecessary API calls
    console.log('1');
    console.log(userId, ' userId API call');
    setLoading(true);
    try {
      if (userId) {
        const memoriData = {
          userId: userId,
          pageNo: 1,
        };
        let cloneOwner = null;
        if (basicInfo?.isClone) {
          cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
            ?.linkId?.[0];
          memoriData.userId = cloneOwner;
        }
        if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
          cloneOwner = basicInfo?._id;
          memoriData.userId = cloneOwner;
        }

        await dispatch(fetchMemoriesData({ memoriData })).unwrap();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const userId = props.id;
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );
  // const basicInfo = useSelector(
  //   state => state?.fetchUserProfile?.data?.myProfile,
  // );
  const userPermission = props.permission;
  const userId1 = useSelector(state => state?.userInfo._id);
  console.log(userId1, ' 1111');
  const treeId = props.treeId;
  const gap = 25;
  const containerStyle = {
    height: '100%',
  };
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const openDeletePopup = () => {
    handleOpenDelete();
  };
  const GotoAddMemory = () => {
    navigation.navigate('AddMemory', { id: userId, treeId: treeId });
  };
  useEffect(() => {
    if (filteredItems?.[previousIndex]?.mediaIds?.length === 0) {
      closeModal();
    }
    setArray([filteredItems?.[previousIndex]?.mediaIds]);
  }, [memoriesApiData]);

  const GotoViewMemory = async (
    memoryId,
    category,
    index,
    story,
    categoryLength,
  ) => {
    try {
      if (memoryId && category === 'Memory') {
        await dispatch(fetchOneMemoryData(memoryId)).then(() => {
          navigation.navigate('ViewMemory', {
            id: userId,
            userPermission: userPermission,
            treeId: treeId,
          });
        });
      } else if (categoryLength > 0) {
        navigation.navigate('ViewStory', { SingleStoryId: story });
      } else if (
        (memoryId && category === 'Lifechapter') ||
        category === 'AutoLifechapter'
      ) {
        setSelectedIndex(0);
        setIndex(index);
        setArray([filteredItems[index].mediaIds]);

        toggleModal();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const toggleModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const deleteMedia = async event => {
    if (event) {
      setDeleteMediaId(event);
    }
  };
  const deleteSingleMemory = async () => {
    try {
      const length = array?.[0]?.length;
      if (deleteMediaId) {
        await dispatch(deleteOneMemoryData(deleteMediaId))
          .unwrap()
          .then(() => {
            handleCloseDelete();
            setDeleteFlag(true);
            if (length === 1) {
              closeModal();
            }
          });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const loadMoreData = async () => {
    try {
      const pageNo = currentPage + 1;
      setCurrentPage(pageNo);
      const targetUserId = userId;
      let memoriData = {
        userId: targetUserId,
        pageNo,
      };
      let cloneOwner = null;
      if (basicInfo?.isClone) {
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
          ?.linkId?.[0];
        memoriData.userId = cloneOwner;
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
        memoriData.userId = cloneOwner;
      }

      await dispatch(fetchMemoriesData({ memoriData })).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (!isDataFetched) {
  //       getUserMemories();
  //     }
  //   }, [isDataFetched, memories]),
  // );

  // useEffect(() => {
  //   dispatch(resetMemoriesApiDta()); // Reset Redux state to allow re-fetch
  //   getUserMemories();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(resetMemoriesApiDta());
      getUserMemories();
    }, []),
  );

  const renderItem = ({ item, index }) => {
    const mediaCount = item?.mediaIds?.length || 0;

    const taggedInStory = item?.taggedInStory === true && mediaCount === 0;

    return (
      <ErrorBoundary>
        {(taggedInStory || mediaCount > 0) && (
          <Animated.View
            style={{
              // width: width / 3,
              marginBottom:
                filteredItems.length > 9 && index === filteredItems.length - 1
                  ? 320
                  : 0,
              padding: 5,
              paddingHorizontal: '3%',
            }}
            entering={FadeInDown.delay(index + 100)
              .damping(20)
              .duration(500)
              .springify()}>
            <TouchableOpacity
              onPress={() =>
                GotoViewMemory(
                  item?.mediaIds?.[0]?._id,
                  item?.mediaIds?.[0]?.imgCategory,
                  index,
                  item,
                  item?.categoryId?.length ? item?.categoryId?.length : 0,
                )
              }
              key={index}
              testID="viewSingleMemory"
              accessibilityLabel="viewSingleMemory">
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.onSecondary,
                    width: width / 3.8,
                    height: width / 3.8,
                    position: 'relative',
                  },
                ]}>
                <View style={{ borderRadius: 10 }}>
                  {item?.mediaIds?.[0]?.urlType === 'Image' && (
                    <Image
                      source={{ uri: item?.mediaIds?.[0]?.mediaUrl }}
                      style={[styles.image, { position: 'relative', zIndex: 0 }]}
                      accessibilityLabel={`Memory-${index}`}
                    />
                  )}
                  {item?.mediaIds?.[0]?.urlType === 'Video' && (
                    <VideoThumbnail
                      renderLocalThumbnailIos={true}
                      customPress={() =>
                        GotoViewMemory(
                          item?.mediaIds?.[0]?._id,
                          item?.mediaIds?.[0]?.imgCategory,
                          index,
                          item,
                          item?.categoryId?.length
                            ? item?.categoryId?.length
                            : 0,
                        )
                      }
                      accessibilityLabel={`Memory-Video-${index}`}
                      thumbnailUrl={
                        item?.mediaIds?.[0]?.thumbnailUrl
                          ? item?.mediaIds?.[0]?.thumbnailUrl
                          : item?.mediaIds?.[0]?.mediaUrl
                      }
                      resize="cover"
                      src={item?.mediaIds?.[0]?.mediaUrl}
                      preventPlay={true}
                      thumbnailStyle={{ width: '100%', height: '100%' }}
                      imuwMediaStyle={{ width: '100%', height: '100%' }}
                      style={[
                        styles.image,
                        { overflow: 'hidden', position: 'relative', zIndex: 0 },
                      ]}
                      imuwThumbStyle={{ borderRadius: 6 }}
                      thumbnailIconHeight={25}
                      thumbnailIconWidth={25}
                      imuwThumbnailIconStyle={{
                        // width: '100%',
                        resizeMode: 'cover',
                        position: 'absolute',
                        left: '60%',
                        top: '60%',
                      }}
                    />
                  )}
                  {!item?.taggedInStory &&
                    (item?.mediaIds?.[0]?.imgCategory === 'Lifechapter' ||
                      item?.mediaIds?.[0]?.imgCategory === 'AutoLifechapter' ||
                      item?.mediaIds?.[0]?.imgCategory === 'Story') && (
                      <LifestoryIcon
                        style={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          zIndex: 2,
                        }}
                      />
                    )}

                  {item?.taggedInStory &&
                    item?.categoryId?.[0]?.categoryName === 'Category' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          zIndex: 2,
                          position: 'absolute',
                          bottom: 0,
                          width: '70%',
                          height: 'auto',
                          gap: 8,
                        }}>
                        {
                          <StoryIcon
                            style={{
                              bottom: 3,
                              left: 5,
                              zIndex: 2,
                            }}
                          />
                        }
                        <View>
                          <Text
                            style={styles.title}
                            numberOfLines={2}
                            ellipsizeMode="tail">
                            {item.storiesTitle}
                          </Text>
                        </View>
                      </View>
                    )}
                  {item?.categoryId?.[0]?.categoryName !== 'Audios' &&
                    item.mediaIds?.length > 0 && (
                      <LinearGradient
                        colors={[
                          'rgba(0, 0, 0, 0)',
                          'rgba(0, 0, 0, 0.25)',
                          '#000000',
                        ]}
                        style={styles.overlay}></LinearGradient>
                    )}
                  {item?.categoryId?.length !== 0 &&
                    item?.categoryId?.[0]?.categoryName === 'Moment' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          zIndex: 2,
                          position: 'absolute',
                          bottom: 0,
                          width: '70%',
                          height: 'auto',
                          gap: 8,
                        }}>
                        <MomentIcon
                          style={{
                            bottom: 3,
                            left: 3,
                            zIndex: 2,
                          }}
                        />

                        <View>
                          <Text
                            style={styles.title}
                            numberOfLines={2}
                            ellipsizeMode="tail">
                            {item.storiesTitle}
                          </Text>
                        </View>
                      </View>
                    )}
                  {item?.categoryId?.length !== 0 &&
                    item?.categoryId?.[0]?.categoryName === 'Audios' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          zIndex: 2,
                          position: 'absolute',
                          bottom: 0,
                          width: '70%',
                          height: 'auto',
                          gap: 8,
                        }}>
                        <AudiosIcon
                          style={{
                            bottom: 3,
                            left: 3,
                            zIndex: 2,
                          }}
                        />
                        <View>
                          <Text
                            style={styles.title}
                            numberOfLines={2}
                            ellipsizeMode="tail">
                            {item.storiesTitle}
                          </Text>
                        </View>
                      </View>
                    )}
                  {item?.categoryId?.length !== 0 &&
                    item?.categoryId?.[0]?.categoryName === 'Quotes' && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          zIndex: 2,
                          position: 'absolute',
                          bottom: 0,
                          width: '70%',
                          height: 'auto',
                          gap: 8,
                        }}>
                        <QuotesTagIcon
                          style={{
                            bottom: 3,
                            left: 3,
                            zIndex: 2,
                          }}
                        />

                        <View>
                          <Text
                            style={styles.title}
                            numberOfLines={2}
                            ellipsizeMode="tail">
                            {item.storiesTitle}
                          </Text>
                        </View>
                      </View>
                    )}
                  {item?.taggedInStory === true && (
                    <TaggingIcon
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 3,
                        zIndex: 2,
                      }}
                    />
                  )}
                  {item?.categoryId?.length !== 0 &&
                    item?.categoryId?.[0]?.categoryName === 'Audios' && (
                      <LinearGradient
                        colors={[
                          'rgba(39, 195, 148, 0.25)',
                          '#27C394',
                          '#27C394',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.audioBackground}
                      />
                    )}

                  {item.mediaIds?.length <= 0 &&
                    item?.categoryId?.[0]?.categoryName === 'Quotes' && (
                      <LinearGradient
                        colors={[
                          'rgba(255, 79, 79, 0.25)',
                          '#FF4F4F',
                          '#FF4F4F',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.audioBackground}
                      />
                    )}

                  {item?.categoryId?.[0]?.categoryName !== 'Audios' &&
                    item?.categoryId?.[0]?.categoryName !== 'Moment' &&
                    item?.categoryId?.[0]?.categoryName !== 'Quotes' &&
                    item.mediaIds?.length <= 0 && (
                      <LinearGradient
                        colors={[
                          'rgba(45, 170, 255, 0.25)',
                          '#2DAAFF',
                          '#2DAAFF',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.audioBackground}
                      />
                    )}

                  {item?.mediaIds?.length > 1 && (
                    <MultipleMedia
                      id="MultipleMedia"
                      accessibilityLabel='MultipleMedia'
                      testID="MultipleMedia"
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: 5,
                        zIndex: 2,
                      }}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ErrorBoundary>
    );
  };

  if (showState) {
    return (
      <ErrorBoundary>
        {userPermission && (
          <CustomButton
            testID="addMemoryBtn"
            className="addMemoryBtn"
            label={'Add Memory'}
            accessibilityLabel={'addMemoryBtn'}
            onPress={() => GotoAddMemory()}
          />
        )}
        <View style={{ paddingTop: '15px' }}>
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityLabel={'EmptyMemory-Icon'}>
            <EmptyMemory />
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '20px',
            }}>
            <Text
              style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}
              accessibilityLabel={'EmptyMemory-Text'}>
              Start adding memories!
            </Text>
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary.Screen>
      <View style={{ marginHorizontal: 4, marginBottom: '72%' }}>
        {userPermission && (
          <CustomButton
            testID="addMemoryBtn"
            className="addMemoryBtn"
            label={'Add Memory'}
            accessibilityLabel={'addMemoryBtn'}
            onPress={() => GotoAddMemory()}
          />
        )}
        {loading ? (
          <Spinner />
        ) : filteredItems.length > 0 ? (
          <View>
            {filteredItems && (
              <FlatList
                accessibilityLabel={'flatList-MemoriesData'}
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                numColumns={3}
                contentContainerStyle={{ gap }}
                onEndReached={loadMoreData}
                scrollEnabled={filteredItems.length > 9}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]} // Loader colors for Android (cycling)
                    tintColor={theme.colors.primary} // Loader color for iOS
                  />
                }
              />
            )}
          </View>
        ) : (
          <View style={{ paddingTop: '15px' }}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessibilityLabel={'EmptyMemory-Icon'}>
              <EmptyMemory />
            </View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '20px',
              }}>
              <Text
                style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}
                accessibilityLabel={'EmptyMemory-Text'}>
                Start adding memories!
              </Text>
            </View>
          </View>
        )}
      </View>
      <Portal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          contentContainerStyle={containerStyle}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {(slides || array) && (
              <Portal>
                <FullMediaViewer
                  mediaUrls={array[0]}
                  onClose={closeModal}
                  deleteFlag={deleteFlag}
                  deleteMedia={deleteMedia}
                  openDeletePopup={openDeletePopup}
                  isDelete={userPermission}
                  selectedIndex={selectedIndex}
                />
              </Portal>
            )}
          </View>
        </Modal>
      </Portal>
      {openDelete && (
        <Confirm
          accessibilityLabel={'confirm-popup-memory'}
          continueCtaText="Delete"
          discardCtaText="Cancel"
          title="Are you sure you want to delete this memory?"
          subTitle=""
          onBackgroundClick={handleCloseDelete}
          onDiscard={() => {
            handleCloseDelete();
          }}
          onContinue={() => {
            deleteSingleMemory();
          }}
          onCrossClick={() => {
            handleCloseDelete();
          }}
        />
      )}
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  imageGrid: {},
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 5,
    left: 30,
    zIndex: 10,
    width: '70%',
    height: 'auto',

    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    bottom: 3,
    left: 3,
  },
  card: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
    }),

    elevation: 3,
    borderRadius: 10,
  },

  image: {
    borderRadius: 10,
    aspectRatio: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
    height: '100%',
    width: '100%',
  },
  audioBackground: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },
});

export default Memories;
