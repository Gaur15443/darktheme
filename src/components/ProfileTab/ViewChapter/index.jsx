import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import moment from 'moment';

import { GlobalStyle, MediaContainer } from '../../../core';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, useTheme, Text, Portal } from 'react-native-paper';
import { ChapterHeader } from '../../../components';
import {
  deleteOneChapterData,
  fetchChaptersData,
} from '../../../store/apps/viewChapter';
import HTMLView from 'react-native-htmlview';
import Toast from 'react-native-toast-message';
import { formatTagsText, formatLinkText } from '../../../utils/format';
import FullMediaViewer from '../../../common/Global-Media-Controller/FullMediaViewer';
import Confirm from '../../Confirm';
import { useNavigation } from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
const ViewChapter = ({ route }) => {
  const id = route.params ? route.params.id : undefined;
  const userPermission = route.params ? route.params.userPermission : undefined;
  const memberTreeId = route.params ? route.params.memberTreeId : undefined;
  const theme = useTheme();
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state?.userInfo);
  const userId = id ? id : userInfo._id;
  const treeId = memberTreeId ? memberTreeId : userInfo?.treeIdin?.[0];
  const navigation = useNavigation();
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Lifestory,
  );
  const [openDelete, setOpenDelete] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setActiveIndex] = useState(0);
  const slides = useSelector(
    state => state?.apiViewChapter?.data?.contents?.[0]?.elements,
  );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  const toggleModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setActiveIndex(0);
  };
  const onMediaPress = activeIndex => {
    if (activeIndex) {
      setActiveIndex(activeIndex);
    } else {
      setActiveIndex(0);
    }
  };
  const viewchapter = useSelector(state => state.apiViewChapter);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

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
  const openDeletePopup = () => {
    handleOpenDelete();
  };
  const goBackViewFromAll = () => {
    let cloneOwner = null;
    if (basicInfo?.isClone) {
      cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
        ?.linkId?.[0];
    }
    if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
      cloneOwner = basicInfo?._id;
    }
    // dispatch(fetchChaptersData({userId, treeId, clinkowner: cloneOwner})).then(
    // () => {
    navigation.goBack();
    // },
    // );
  };
  const viewChapterWithApi = () => {
    try {
      let cloneOwner = null;
      if (basicInfo?.isClone) {
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
          ?.linkId?.[0];
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
      }
      dispatch(
        fetchChaptersData({ userId, treeId, clinkowner: cloneOwner }),
      ).then(() => {
        handleCloseDelete();
        navigation.goBack();
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };
  const deleteSingleChapter = () => {
    if (viewchapter?.data?._id) {
      dispatch(deleteOneChapterData(viewchapter?.data?._id)).then(() => {
        viewChapterWithApi();

        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: toastMessages?.['7003'],
          });
        }, 1000);
      }).catch(() => {
        Toast.show({
          type: 'error',
          text1: toastMessages?.Lifestory_Error?.['7006'],
        });
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ChapterHeader
        openDeleteChapter={openDeletePopup}
        chapterId={viewchapter?.data?._id}
        goBackViewFromAll={goBackViewFromAll}
        id={id}
        memberTreeId={memberTreeId}
        userPermission={userPermission !== undefined ? userPermission : true}
      />
      {openDelete && (
        <Confirm
          continueCtaText="Delete"
          discardCtaText="Cancel"
          title="Are you sure you want to delete this lifestory chapter?"
          subTitle=""
          onBackgroundClick={handleCloseDelete}
          onDiscard={() => {
            handleCloseDelete();
          }}
          onContinue={() => {
            deleteSingleChapter();
          }}
          onCrossClick={() => {
            handleCloseDelete();
          }}
        />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}>
        <GlobalStyle>
          <View style={{ marginTop: 20 }}>
            {viewchapter?.data?.contents?.[0]?.elements?.length > 0 && (
              <View
                onTouchEnd={toggleModal}
                accessibilityLabel={'View-Chapter-MediaContainer'}>
                {viewchapter?.data?.contents?.[0]?.elements && (
                  <MediaContainer
                    customPress={toggleModal}
                    postMedia={viewchapter?.data?.contents?.[0]?.elements}
                    preventPlay={true}
                    onMediaPress={onMediaPress}
                    accessibilityLabel={'View-Chapter-MediaContainer'}
                  />
                )}
              </View>
            )}

            <View style={{ marginTop: 20 }}>
              <Text
                style={[styles.eventTitle, { color: theme.colors.scrim }]}
                accessibilityLabel={viewchapter?.data?.EventTitle}>
                {viewchapter?.data?.EventTitle}
              </Text>
              <Text
                style={{ color: theme.colors.infoContentColor }}
                accessibilityLabel={viewchapter?.data?.eventDate}>
                {convertToYear(
                  viewchapter?.data?.eventDate,
                  viewchapter?.data?.CD_Flag,
                )}{' '}
                {viewchapter?.data?.location && (
                  <Text
                    style={{ color: theme.colors.infoContentColor }}
                    accessibilityLabel={
                      viewchapter?.data?.location?.formatted_address ?? ''
                    }>
                    |{' '}
                    {typeof viewchapter?.data?.location === 'string'
                      ? viewchapter?.data?.location
                      : (viewchapter?.data?.location?.formatted_address ?? '')}
                  </Text>
                )}
              </Text>

              {viewchapter?.data?.isEvent === true ||
                viewchapter?.data?.isStory === true ? (
                <HTMLView
                  value={`<p>${formatLinkText(formatTagsText(viewchapter?.data?.description))}</p>`}
                  stylesheet={htmlStyles}
                  accessibilityLabel={viewchapter?.data?.description}
                />
              ) : (
                <Text
                  style={{ color: theme.colors.infoContentColor }}
                  accessibilityLabel={viewchapter?.data?.description}>
                  {viewchapter?.data?.description}
                </Text>
              )}
            </View>
          </View>
        </GlobalStyle>
      </ScrollView>
      <Portal>
        <Modal animationType="fade" transparent={true} visible={isModalVisible}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {viewchapter?.data?.contents?.[0]?.elements && (
              <Portal>
                <FullMediaViewer
                  mediaUrls={viewchapter?.data?.contents?.[0]?.elements}
                  selectedIndex={selectedIndex}
                  isDelete={false}
                  onClose={closeModal}
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
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    // SafeAreaView does not automatically account for notch, so set this manually if needed
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
});

export default ViewChapter;
