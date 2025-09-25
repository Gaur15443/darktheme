import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Confirm from '../../Confirm';

import {Card} from 'react-native-paper';
import moment from 'moment';
import {AutoChapterHeader} from '../../../components';
import {CustomButton, VideoThumbnail} from '../../../core';
import {GlobalStyle, MediaContainer} from '../../../core';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import AddAutoMedia from '../../../core/icon/add-auto-media';
import FileUploader from '../../../common/media-uploader';
import {CloseIcon} from '../../../images/Icons/ModalIcon';
import {SCREEN_WIDTH} from '../../../constants/Screens';
import {CrossIcon} from '../../../images';
import {getRandomLetters} from '../../../utils';
import {uploadMedia} from '../../../store/apps/mediaSlice';
import Toast from 'react-native-toast-message';
import {
  fetchChaptersData,
  updateOneAutoChapterData,
  setRecentlyPublishedBlobAuto,
} from '../../../store/apps/viewChapter';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import FullMediaViewer from '../../../common/Global-Media-Controller/FullMediaViewer';

const ViewAutoChapter = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const mediaIds = useRef([]);
  const viewAutoChapterData = route.params
    ? route.params.AutoChapterData
    : null;
  const id = route.params ? route.params.id : undefined;
  const memberTreeId = route.params ? route.params.memberTreeId : undefined;

  const [loading, setLoading] = useState(false);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);

  const userPermission = route.params ? route.params.userPermission : undefined;
  const [ShowSelect, setShowSelect] = useState(false);

  const [files, setFiles] = useState([]);
  const [publishedMedia, setPublishedMedia] = useState([]);
  const selectedMedias = useRef([]);
  const newlyPublishedMedias = useRef([]);
  const [, setPageElements] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setActiveIndex] = useState(0);
  const userId = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile?._id,
  );

  const birthDetails = useSelector(
    state => state.fetchUserProfile?.basicInfo[userId]?.myProfile?.birthDetails,
  );
  const marriageDetails = useSelector(
    state =>
      state.fetchUserProfile?.basicInfo[userId]?.myProfile?.marriageDetails,
  );

  const basicInfoEducationDetails = useSelector(
    state =>
      state?.fetchUserProfile?.basicInfo[userId]?.myProfile?.educationDetails,
  );
  const basicInfoWorkDetails = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile?.workDetails,
  );
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.basicInfo[userId]?.myProfile,
  );

  useEffect(() => {
    if (
      viewAutoChapterData?.dobMediaIds?.length > 0 ||
      viewAutoChapterData?.dodMediaIds?.length > 0 ||
      viewAutoChapterData?.docMediaIds?.length > 0 ||
      viewAutoChapterData?.domMediaIds?.length > 0 ||
      viewAutoChapterData?.dowMediaIds?.length > 0
    ) {
      const media = [];
      (
        viewAutoChapterData?.dobMediaIds ||
        viewAutoChapterData?.dodMediaIds ||
        viewAutoChapterData?.docMediaIds ||
        viewAutoChapterData?.domMediaIds ||
        viewAutoChapterData?.dowMediaIds
      )?.forEach(content => {
        media.push({
          mediaUrl: content.mediaUrl,
          thumbnailUrl: content.thumbnailUrl,
          type: content.type,
          _id: content.mediaId,
        });
      });

      setPublishedMedia(media);
    }
  }, [viewAutoChapterData]);

  useEffect(() => {
    getUserDetails();
  }, [viewAutoChapterData.userId]);

  const getUserDetails = async () => {
    const userId = viewAutoChapterData.userId;
    await dispatch(fetchUserProfile(userId)).unwrap();
  };

  const goBackViewFromAll = () => {
    if (
      (ShowSelect && files.length > 0) ||
      (ShowSelect && publishedMedia.length > 0)
    ) {
      seOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  };
  const viewChapterWithApi = async id => {
    if (id !== null) {
      const userId = id;
      const treeId = memberTreeId;
      let cloneOwner = null;
      if (basicInfo?.isClone) {
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
          ?.linkId?.[0];
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
      }
      await dispatch(
        fetchChaptersData({userId, treeId, clinkowner: cloneOwner}),
      ).unwrap();
      await dispatch(fetchUserProfile(userId)).unwrap();

      navigation.goBack();
    }
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
  const selectMedia = () => {
    setShowSelect(true);
    getUserDetails();
  };
  const handleBlobData = val => {
    setFiles([...files, ...val]);
  };
  const handleRemoveFile = file => {
    if (!file.name) {
      setPublishedMedia(prevMedia => prevMedia.filter(m => m._id !== file._id));
    } else {
      setFiles(prevFiles => prevFiles.filter(f => f.name !== file.name));
    }
  };
  const handleUpload = async data => {
    const formData = new FormData();

    data?.forEach(blobData => {
      const fileName = getRandomLetters();
      formData.append('image', {
        uri: blobData.mediaUrl,
        name: fileName,
        type: blobData.mimeType,
      });
    });

    if (data.length > 0) {
      formData.append('groupId', JSON.stringify([]));
      formData.append('imgCategory', 'AutoLifechapter');
    }
    const payload = {
      id: viewAutoChapterData.userId,

      formData,
    };
    try {
      let response;
      let newlyPublishedMedia = [];

      await dispatch(uploadMedia(payload)).then(res => {
        response = res;
      });

      if (response?.payload?.data) {
        newlyPublishedMedia = response?.payload?.data.map(
          (datanewmedia, index) => ({
            mediaId: datanewmedia._id,
            mediaUrl: files[index].mediaUrl,
            thumbnailUrl: files[index].mediaUrl,
            type: datanewmedia.urlType,
          }),
        );
        newlyPublishedMedias.current = newlyPublishedMedia;

        setPageElements(
          response?.payload?.data.map(datapageelement => ({
            mediaId: datapageelement._id,
            mediaUrl: datapageelement.mediaUrl,
            type: datapageelement.urlType,
          })),
        );

        response?.payload?.data.forEach(res => {
          mediaIds?.current?.push(res._id);
          selectedMedias?.current?.push(res.mediaUrl);
        });
      }
      return newlyPublishedMedia;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };
  const save = async () => {
    try {
      setLoading(true);

      const newlyPublishedMedia = await handleUpload(files);
      console.log(newlyPublishedMedia, 'newlyPublishedMedia');
      const allFiles = [...newlyPublishedMedia, ...publishedMedia];
      const ids = allFiles && allFiles.map(item => item._id || item.mediaId);

      const updatedMarriageDetails =
        marriageDetails &&
        marriageDetails.map(detail => {
          const spouseIdToCompare = detail?.spouseId?._id
            ? detail?.spouseId?._id
            : detail?.spouseId;

          if (spouseIdToCompare === viewAutoChapterData.spouseId) {
            return {
              ...detail,
              domMediaIds:
                viewAutoChapterData.MD_Flag &&
                spouseIdToCompare === viewAutoChapterData.spouseId
                  ? ids
                  : [],
            };
          }
          return detail;
        });
      const college =
        basicInfoEducationDetails &&
        basicInfoEducationDetails?.college?.map(detail1 => {
          if (detail1._id === viewAutoChapterData.EId) {
            return {
              ...detail1,
              docMediaIds:
                viewAutoChapterData.TD_Flag &&
                detail1._id === viewAutoChapterData.EId
                  ? ids
                  : [],
            };
          }
          return detail1;
        });
      const work =
        basicInfoWorkDetails &&
        basicInfoWorkDetails?.map(detailWork => {
          if (detailWork?._id === viewAutoChapterData.WId) {
            return {
              ...detailWork,
              dowMediaIds:
                viewAutoChapterData.FD_Flag &&
                detailWork?._id === viewAutoChapterData.WId
                  ? ids
                  : [],
            };
          }
          return detailWork;
        });

      let addAutoLifechapterMedia = {
        userId: viewAutoChapterData.userId,
        birthDetails: {
          ...birthDetails,
          ...(viewAutoChapterData.BD_Flag ? {dobMediaIds: ids} : []),
          ...(viewAutoChapterData.DD_Flag ? {dodMediaIds: ids} : []),
        },
        marriageDetails: updatedMarriageDetails,
        educationDetails: {
          college,
        },
        workDetails: work,
        chapterId: viewAutoChapterData.BD_Flag
          ? viewAutoChapterData.userId
          : viewAutoChapterData.DD_Flag
            ? viewAutoChapterData.userId
            : viewAutoChapterData.MD_Flag
              ? viewAutoChapterData.spouseId
              : viewAutoChapterData.TD_Flag
                ? viewAutoChapterData.EId
                : viewAutoChapterData.FD_Flag
                  ? viewAutoChapterData.WId
                  : null,
        chapterFlag: viewAutoChapterData.BD_Flag
          ? 'Birth'
          : viewAutoChapterData.DD_Flag
            ? 'Death'
            : viewAutoChapterData.MD_Flag
              ? 'Marriage'
              : viewAutoChapterData.TD_Flag
                ? 'Education'
                : viewAutoChapterData.FD_Flag
                  ? 'Work'
                  : null,
      };
      let Data = {};
      Data = JSON.parse(JSON.stringify(addAutoLifechapterMedia));
      console.log(Data, 'Data ===>');
      await dispatch(updateOneAutoChapterData(Data)).then(async () => {
        if (newlyPublishedMedias?.current.length) {
          dispatch(
            setRecentlyPublishedBlobAuto([
              {
                media: newlyPublishedMedias.current,
                chapterid: Data.chapterId,
                chapterflag: Data.chapterFlag,
              },
            ]),
          );
        } else {
          dispatch(setRecentlyPublishedBlobAuto([]));
        }
        await viewChapterWithApi(id);
      });
    } catch (error) {
      console.log(error, 'error');
      setLoading(false);

      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  function renderFilePreview(file) {
    return (
      <Card
        elevation={1.5}
        style={{
          position: 'relative',
          margin: 10,
          shadowColor: '#000000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 4,
          borderWidth: 0,
        }}>
        <TouchableOpacity
          onPress={() => handleRemoveFile(file)}
          style={{
            position: 'absolute',
            top: -5,
            zIndex: 10,
            backgroundColor: 'lightgray',
            borderRadius: 3,
            right: -5,
            padding: 3,
          }}>
          <CrossIcon fill={'#86827e'} width={10} height={10} />

          {/* <CloseIcon /> */}
        </TouchableOpacity>
        {file?.type?.toLowerCase() === 'image' ? (
          <Image
            style={[
              styles.shadowContainer,
              {
                zIndex: 1,
                resizeMode: 'cover',
                borderRadius: 5,
                width: 60,
                height: 60,
              },
            ]}
            alt={file.type}
            source={{uri: file.mediaUrl}}
          />
        ) : (
          <View
            style={{
              borderRadius: 5,
              width: 60,
              height: 60,
            }}>
            <VideoThumbnail
              renderLocalThumbnailIos={true}
              thumbnailIconHeight={20}
              thumbnailIconWidth={20}
              thumbnailUrl={
                file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
              }
              src={file.mediaUrl}
              preventPlay={true}
              thumbnailStyle={{width: '100%', height: '100%'}}
              imuwMediaStyle={{width: '100%', height: '100%'}}
              imuwThumbStyle={{borderRadius: 6, width: '100%'}}
              imuwThumbnailIconStyle={{
                // width: '100%',
                resizeMode: 'cover',
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -10,
                marginTop: -10,
                zIndex: 1000,
              }}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 6,
                overflow: 'hidden',
              }}
              resize="cover"
            />
          </View>
        )}
      </Card>
    );
  }
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

  return (
    <SafeAreaView style={{flex: 1}}>
      <AutoChapterHeader goBackViewFromAll={goBackViewFromAll} />
      {openConfirmPopup && (
        <Confirm
          title={'Are you sure you want to leave?'}
          subTitle={'If you discard, you will lose your changes.'}
          discardCtaText={'Discard'}
          continueCtaText={'Continue Editing'}
          onContinue={() => seOpenConfirmPopup(false)}
          onDiscard={() => {
            navigation.goBack();
          }}
          onCrossClick={() => seOpenConfirmPopup(false)}
        />
      )}

      <GlobalStyle style={{flex: 1}}>
        <View style={{flex: 1, marginTop: 20}}>
          {(viewAutoChapterData?.dobMediaIds?.length > 0 ||
            viewAutoChapterData?.dodMediaIds?.length > 0 ||
            viewAutoChapterData?.docMediaIds?.length > 0 ||
            viewAutoChapterData?.domMediaIds?.length > 0 ||
            viewAutoChapterData?.dowMediaIds?.length > 0) && (
            <View style={{marginBottom: 20}} onTouchEnd={toggleModal}>
              {(viewAutoChapterData?.dobMediaIds ||
                viewAutoChapterData?.dodMediaIds ||
                viewAutoChapterData?.docMediaIds ||
                viewAutoChapterData?.domMediaIds ||
                viewAutoChapterData?.dowMediaIds) && (
                <MediaContainer
                  customPress={toggleModal}
                  postMedia={
                    viewAutoChapterData?.dobMediaIds
                      ? viewAutoChapterData?.dobMediaIds
                      : viewAutoChapterData?.dodMediaIds
                        ? viewAutoChapterData?.dodMediaIds
                        : viewAutoChapterData?.docMediaIds
                          ? viewAutoChapterData?.docMediaIds
                          : viewAutoChapterData?.domMediaIds
                            ? viewAutoChapterData?.domMediaIds
                            : viewAutoChapterData?.dowMediaIds
                              ? viewAutoChapterData?.dowMediaIds
                              : null
                  }
                  preventPlay={true}
                  onMediaPress={onMediaPress}
                />
              )}
            </View>
          )}
          <Text style={[styles.eventTitle, {color: theme.colors.scrim}]}>
            {viewAutoChapterData?.title}
          </Text>
          <Text style={{color: theme.colors.infoContentColor, paddingTop: 10}}>
            {convertToYear(
              viewAutoChapterData?.eventDate,
              viewAutoChapterData?.BD_Flag ||
                viewAutoChapterData?.DD_Flag ||
                viewAutoChapterData?.MD_Flag ||
                viewAutoChapterData?.FD_Flag ||
                viewAutoChapterData?.TD_Flag,
            )}
          </Text>
          <Text style={{color: theme.colors.infoContentColor, paddingTop: 5}}>
            {viewAutoChapterData?.description}
          </Text>
        </View>
      </GlobalStyle>
      {userPermission && (
        <View style={styles.buttonContainer}>
          {!ShowSelect && (
            <>
              <Text
                style={[
                  styles.eventTitle,
                  {color: theme.colors.scrim, textAlign: 'center'},
                ]}>
                You can only add and edit media of autogenerated lifestory
                chapters.{' '}
              </Text>
              <View style={{paddingTop: 20}}>
                <CustomButton
                  testID="craeteChapterBtn"
                  className="craeteChapterBtn"
                  label={'Edit Chapter'}
                  onPress={selectMedia}
                />
              </View>
            </>
          )}
          {ShowSelect && (
            <>
              <View style={styles.container}>
                <FileUploader
                  blobData={[...(publishedMedia || []), ...(files || [])]}
                  totalVideoCountAllowed={1}
                  totalImageCountAllowed={9}
                  allowedFiles={['image', 'video']}
                  disabled={loading}
                  onGetMedia={handleBlobData}>
                  <View style={styles.stickyContainer}>
                    <View
                      style={[
                        styles.shadowContainer,
                        {
                          height: 60,
                          width: 60,
                          backgroundColor: '#D9D9D9',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 5,
                        },
                      ]}>
                      <AddAutoMedia />
                    </View>
                  </View>
                </FileUploader>
                <ScrollView horizontal style={styles.scrollContainer}>
                  <>
                    {[...files, ...publishedMedia].map(file => (
                      <>{renderFilePreview(file)}</>
                    ))}
                  </>
                </ScrollView>
              </View>
              <View style={{paddingTop: 20}}>
                <CustomButton
                  testID="craeteChapterBtn"
                  className="craeteChapterBtn"
                  label={'Confirm'}
                  loading={loading}
                  onPress={save}
                  disabled={loading}
                />
              </View>
            </>
          )}
        </View>
      )}
          {isModalVisible && (viewAutoChapterData?.dobMediaIds ||
            viewAutoChapterData?.dodMediaIds ||
            viewAutoChapterData?.docMediaIds ||
            viewAutoChapterData?.domMediaIds ||
            viewAutoChapterData?.dowMediaIds) && (
            <FullMediaViewer
              mediaUrls={
                viewAutoChapterData?.dobMediaIds
                  ? viewAutoChapterData?.dobMediaIds
                  : viewAutoChapterData?.dodMediaIds
                    ? viewAutoChapterData?.dodMediaIds
                    : viewAutoChapterData?.docMediaIds
                      ? viewAutoChapterData?.docMediaIds
                      : viewAutoChapterData?.domMediaIds
                        ? viewAutoChapterData?.domMediaIds
                        : viewAutoChapterData?.dowMediaIds
                          ? viewAutoChapterData?.dowMediaIds
                          : null
              }
              closeModal={closeModal}
              onClose={closeModal}
              selectedIndex={selectedIndex}
            />
          )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    height: 80,
  },
  stickyContainer: {
    position: 'relative',

    left: 0,
    right: 0,
    zIndex: 1,

    paddingTop: 6,
  },

  scrollContainer: {
    marginLeft: 10,
    marginTop: -3,
  },
  filesContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePreview: {
    marginHorizontal: 12.5, // Adjust spacing between file previews
  },

  shadowContainer: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ViewAutoChapter;
