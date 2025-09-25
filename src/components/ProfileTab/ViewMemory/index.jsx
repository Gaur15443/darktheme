import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { CalendarPinkIcon } from '../../../images';
import { LocationPinkIcon } from '../../../images';
import { MemoryHeader } from '../../../components';
import Toast from 'react-native-toast-message';

import { GlobalStyle, VideoThumbnail } from '../../../core';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, useTheme, Portal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Confirm from '../../Confirm';
import { useNavigation } from '@react-navigation/native';
import { deleteOneMemoryData } from '../../../store/apps/viewMemory';
import FullMediaViewer from '../../../common/Global-Media-Controller/FullMediaViewer';

const ViewMemory = ({ route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const id = route.params ? route.params.id : undefined;
  const treeId = route.params ? route.params.treeId : undefined;
  const userPermission = route.params ? route.params.userPermission : undefined;
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setActiveIndex] = useState(0);

  const { top } = useSafeAreaInsets();

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Memory,
  );

  const toggleModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const userInfo = useSelector(state => state?.userInfo);
  const userId = id ? id : userInfo?._id;
  const navigation = useNavigation();
  const [openDelete, setOpenDelete] = useState(false);

  const viewonememory = useSelector(state => state.apiViewMemory.singleMemory);

  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const openDeletePopup = () => {
    handleOpenDelete();
  };

  const convertToYear = (d, flag) => {
    if (d !== '' && d !== undefined && d !== null) {
      if (flag) {
        if (flag === 1) {
          return moment(d).format('DD MMM YYYY');
        } else if (flag === 2) {
          return moment(d).format('MMM YYYY');
        } else if (flag === 3) {
          return moment(d).format('YYYY');
        }
      } else {
        return moment(d).format('MMM YYYY');
      }
    } else {
      return '';
    }
  };
  const viewMemoriesWithApi = () => {
    handleCloseDelete();
    navigation.goBack();
  };

  const deleteSingleMemory = () => {
    if (viewonememory?.contents[0]?.elements?.[0].mediaId) {
      dispatch(
        deleteOneMemoryData(viewonememory?.contents[0]?.elements?.[0].mediaId),
      ).then(() => {
        viewMemoriesWithApi();
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: toastMessages?.['10003'],
          });
        }, 1000);
      }).catch(() => {
        Toast.show({
          type: 'error',
          text1: toastMessages?.Memory_Error?.['10006'],
        });
      })
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop:
            Platform.OS === 'ios' ? 0 : top,
        },
      ]}>
      <MemoryHeader
        openDeleteMemory={openDeletePopup}
        memoryId={viewonememory?.contents?.[0]?.elements?.[0]?.mediaId}
        userPermission={userPermission !== undefined ? userPermission : true}
        treeId={treeId}
      />
      {openDelete && (
        <Confirm
          accessibilityLabel={'Memory-Confirm-popup'}
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
      <GlobalStyle>
        <View style={{ marginTop: 20 }}>
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => toggleModal()}
              testID="viewSingleMemory">
              <View style={{ height: 185 }}>
                {viewonememory?.contents?.[0]?.elements?.[0].type ===
                  'Image' && (
                    <View
                      style={{
                        width: '100%',
                        height: 160,
                        overflow: 'hidden',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Image
                        source={{
                          uri: viewonememory?.contents?.[0]?.elements?.[0]
                            .mediaUrl,
                        }}
                        accessibilityLabel={'Memory-mediaUrl'}
                        style={{
                          width: '100%',
                          height: '100%',
                          aspectRatio: 1.3,
                          resizeMode: 'cover',
                          borderRadius: 6,
                        }}
                      />
                    </View>
                  )}
                {viewonememory?.contents?.[0]?.elements?.[0].type ===
                  'Video' && (
                    <View
                      style={{
                        width: '100%',
                        height: 160,
                        overflow: 'hidden',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <VideoThumbnail
                        thumbnailUrl={
                          viewonememory?.contents?.[0]?.elements?.[0]
                            ?.thumbnailUrl
                        }
                        renderLocalThumbnailIos={true}
                        accessibilityLabel={'Memory-video'}
                        customPress={() => toggleModal()}
                        src={
                          viewonememory?.contents?.[0]?.elements?.[0]?.mediaUrl
                        }
                        key={
                          viewonememory?.contents?.[0]?.elements?.[0]
                            ?.thumbnailUrl
                        }
                        preventPlay={true}
                        imuwMediaStyle={{ width: '100%', height: '100%' }}
                        imuwThumbStyle={{ borderRadius: 6, width: '100%' }}
                        resize="cover"
                      />
                    </View>
                  )}
              </View>
            </TouchableOpacity>
            <Text
              style={[
                styles.eventTitle,
                { color: theme.colors.scrim },
                { paddingTop: 6 },
              ]}
              accessibilityLabel={`${viewonememory?.EventTitle}`}>
              {viewonememory?.EventTitle}
            </Text>
            {viewonememory?.eventDate && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 6,
                }}
                accessibilityLabel={'CalendarPinkIcon'}>
                <CalendarPinkIcon />
                <Text
                  style={{
                    paddingLeft: 4,
                    color: theme.colors.infoContentColor,
                  }}
                  accessibilityLabel={`${viewonememory?.eventDate}`}>
                  {convertToYear(
                    viewonememory?.eventDate,
                    viewonememory?.CD_Flag,
                  )}
                </Text>
              </View>
            )}
            {viewonememory?.location && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 6,
                }}
                accessibilityLabel={'LocationPinkIcon'}>
                <LocationPinkIcon />
                <Text
                  style={{
                    paddingLeft: 4,
                    color: theme.colors.infoContentColor,
                  }}
                  accessibilityLabel={`${viewonememory?.location}`}>
                  {viewonememory?.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GlobalStyle>
      <Portal>
        <Modal animationType="fade" transparent={true} visible={isModalVisible}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {viewonememory?.contents?.[0]?.elements && (
              <Portal>
                <FullMediaViewer
                  mediaUrls={viewonememory?.contents[0]?.elements}
                  selectedIndex={selectedIndex}
                  onClose={closeModal}
                  isDelete={false}
                />
              </Portal>
            )}
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // Padding to account for status bar on Android and iOS

    // SafeAreaView does not automatically account for notch, so set this manually if needed
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  image: {
    // width: '100%',
    // height: '100%',
    // resizeMode: 'contain',
    // borderRadius: 6,
    // ...(Platform.OS === 'ios' && { width: '100%' }) // Apply specific style for iOS
  },
});

export default ViewMemory;
