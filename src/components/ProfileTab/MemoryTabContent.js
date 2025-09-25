import React, { useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';

import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';
import EmptyMemory from '../../images/Icons/EmptyMemory';
import { CustomButton, VideoThumbnail } from '../../core';
import {
  fetchMemoriesData,
  resetMemoriesApiDta,
  fetchOneMemoryData,
} from '../../store/apps/viewMemory';
import { useFocusEffect } from '@react-navigation/native';
import { deleteOneMemoryData } from '../../store/apps/viewMemory';
import Confirm from '../Confirm';
import FullMediaViewer from '../../common/Global-Media-Controller/FullMediaViewer';

import { useDispatch, useSelector } from 'react-redux';

import { Card, useTheme } from 'react-native-paper';
const Memories = () => {
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
  const treeId = useSelector(state => state.Tree.userTree);
  const userId = useSelector(state => state?.userInfo._id);
  // const basicInfo = useSelector(
  //   state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  // );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  const { width } = Dimensions.get('window');
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
    navigation.navigate('AddMemory');
  };
  const GotoViewMemory = async (memoryId, category, index) => {
    try {
      if (memoryId && category === 'Memory') {
        await dispatch(fetchOneMemoryData(memoryId)).then(() => {
          navigation.navigate('ViewMemory');
        });
      } else if (memoryId && category === 'Lifechapter') {
        setSelectedIndex(index);
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
      if (deleteMediaId) {
        await dispatch(deleteOneMemoryData(deleteMediaId))
          .unwrap()
          .then(() => {
            handleCloseDelete();
            setDeleteFlag(true);
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
    const pageNo = currentPage + 1;
    setCurrentPage(pageNo);
    const targetUserId = userId;
    const memoriData = {
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
    await dispatch(fetchMemoriesData({ memoriData }));
  };

  const memoriesApiData = useSelector(state => state?.apiViewMemory?.memories);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentPage(1);
      setLoading(true);

      try {
        const getUserMemories = async () => {
          if (userId) {
            await dispatch(resetMemoriesApiDta());
            const memoriData = {
              userId: userId,
              pageNo: 1,
            };
            let cloneOwner = null;
            if (basicInfo?.isClone) {
              cloneOwner = basicInfo?.cLink?.find(
                link => link?.treeId === treeId,
              )?.linkId?.[0];
              memoriData.userId = cloneOwner;
            }
            if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
              cloneOwner = basicInfo?._id;
              memoriData.userId = cloneOwner;
            }
            await dispatch(fetchMemoriesData({ memoriData }))
              .unwrap()
              .then(() => {
                setLoading(false);
              });
          }
        };

        getUserMemories();
      } catch (error) {
        setLoading(false);

        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    }, [dispatch]),
  );

  const renderItem = ({ item, index }) => (
    <>
      <Animated.View
        style={{
          width: width / 3,
          marginBottom: index === memoriesApiData.length - 1 ? 1200 : 0,
          padding: 5,
        }}
        entering={FadeInDown.delay(index + 100)
          .damping(20)
          .duration(500)
          .springify()}>
        <TouchableOpacity
          onPress={() => GotoViewMemory(item._id, item.imgCategory, index)}
          key={index}
          testID="viewSingleMemory">
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.onSecondary,
                width: width / 3.8,
                height: width / 3.8,
              },
            ]}>
            <View style={{ overflow: 'hidden', borderRadius: 10 }}>
              {item.urlType === 'Image' && (
                <Image source={{ uri: item.mediaUrl }} style={[styles.image]} />
              )}

              {item.urlType === 'Video' && (
                <VideoThumbnail
                  renderLocalThumbnailIos={true}
                  customPress={() =>
                    GotoViewMemory(item._id, item.imgCategory, index)
                  }
                  thumbnailUrl={
                    item.thumbnailUrl ? item.thumbnailUrl : item.mediaUrl
                  }
                  src={item.mediaUrl}
                  preventPlay={true}
                  thumbnailStyle={{ width: '100%', height: '100%' }}
                  imuwMediaStyle={{ width: '100%', height: '100%' }}
                  style={styles.image}
                  imuwThumbStyle={{ borderRadius: 6 }}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );

  return (
    <>
      <View>
        <CustomButton
          TestID="addMemoryBtn"
          className="addMemoryBtn"
          label={'Add Memory'}
          onPress={() => GotoAddMemory()}
        />
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : memoriesApiData.length > 0 ? (
          <View>
            {memoriesApiData && (
              <FlatList
                data={memoriesApiData}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                numColumns={3}
                contentContainerStyle={{ gap }}
                onEndReached={loadMoreData}
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
              }}>
              <EmptyMemory />
            </View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: '20px',
              }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>
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
            {slides && (
              <Portal>
                <FullMediaViewer
                  mediaUrls={slides}
                  selectedIndex={selectedIndex}
                  isDelete={true}
                  openDeletePopup={openDeletePopup}
                  deleteMedia={deleteMedia}
                  deleteFlag={deleteFlag}
                  onClose={closeModal}
                />
              </Portal>
            )}
          </View>
        </Modal>
      </Portal>
      {openDelete && (
        <Confirm
          continueCtaText="Delete"
          discardCtaText="Cancel"
          title="Are you sure you want to delete this memory?"
          subTitle=""
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
    </>
  );
};

const styles = StyleSheet.create({
  imageGrid: {},
  card: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderRadius: 10,
  },

  image: {
    height: '100%',
    width: '100%',

    aspectRatio: 1,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '40%',
  },
});

export default Memories;
