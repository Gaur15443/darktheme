import React, {useState, useRef, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {SlideInDown} from 'react-native-reanimated';
import {GlobalStyle} from '../../../core';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import FileUploader from '../../../common/media-uploader';
import {getRandomLetters} from '../../../utils';
import {uploadMedia} from '../../../store/apps/mediaSlice';
import {useNavigation} from '@react-navigation/native';
import {GlobalHeader, CustomInput} from '../../../components';
import Confirm from '../../Confirm';
import {useTheme, Text} from 'react-native-paper';
import ImuwDatePicker from '../../../core/UICompoonent/ImuwDatePicker';

import {
  AddMediaIcon,
  LocationPinkIcon,
  CalendarPinkIcon,
} from '../../../images';
import {CustomButton, VideoThumbnail} from '../../../core';
import useNativeBackHandler from './../../../hooks/useBackHandler';

import {
  createMemory,
  setRecentlyPublishedBlob,
  resetMemoriesApiDta,
} from '../../../store/apps/viewMemory';
import NewTheme from '../../../common/NewTheme';
import MediaPreview from '../../../components/MediaPreview';
const AddMemory = ({route}) => {
  const originalAspectRatio = 1;
  const id = route.params ? route.params.id : undefined;
  const treeId = route.params ? route.params.treeId : undefined;

  useNativeBackHandler(handleBack);
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [file, setFile] = useState(null); // single media object
  const [mediaToPreview, setMediaToPreview] = useState(null); // single preview
  const newlyPublishedMedias = useRef([]);

  const [, setPageElements] = useState([]);
  const mediaIds = useRef([]);
  const selectedMedias = useRef([]);
  const [MediaNote, setMediaNote] = useState('');
  const [locationinfo, setLocationInfo] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Uploading...');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const dateInputRef = useRef(null);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(originalAspectRatio);
  const [aspectRatio, setAspectRatio] = useState(1);

  const userId = id ? id : useSelector(state => state?.userInfo._id);
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Memory,
  );
  function handleSetMediaPreview(media) {
  if (!media) return;

  const mediaItem = Array.isArray(media) ? media[0] : media;

  mediaItem._id = mediaItem._id || `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  mediaItem.originalMedia = mediaItem.mediaUrl;

  setFile(mediaItem);

  if (mediaItem.type?.toLowerCase() === 'image') {
    // only set for image so MediaPreview opens
    setMediaToPreview(mediaItem);
  } else {
    handleBlobData(mediaItem);
    handleSaveOriginalCopy(mediaItem);
    // setMediaToPreview(null);
  }
}

function handleBlobData(data) {
  setMediaToPreview(null);

  const updatedData = data.map((_file, index) => {
    const result = {
      ..._file,
      _id:
        _file._id ||
        `local-${Date.now() + index}-${Math.floor(Math.random() * 100000)}`,
    };
    return result;
  });
  setFile(updatedData[0]);
}



  function handleRemovedFromPreview(_id) {
    setFile(null);
    setMediaToPreview(null);
    mediaIds.current = [];
    selectedMedias.current = [];
  }

  function handleSaveOriginalCopy(media) {
    if (!media) return;
    setMediaToPreview(media);
    handleCloseMediaPreview();
  }

  function handleCloseMediaPreview() {
    setMediaToPreview(null);
  }

  const handleUpload = async () => {
    if (!file) return null;

    const formData = new FormData();
    const fileName = getRandomLetters();

    formData.append('image', {
      uri: file.mediaUrl,
      name: fileName,
      type: file.mimeType,
    });
      formData.append('groupId', JSON.stringify([]));
      formData.append('imgCategory', 'Memory');
    const payload = {
      id: userId,
      formData,
    };
    try {
      let response;
      let newlyPublishedMedia = [];

      await dispatch(uploadMedia(payload)).then(res => {
        response = res;
      });

      if (response?.payload?.data) {
        newlyPublishedMedia = response?.payload?.data.map(datanewmedia => ({
          mediaId: datanewmedia._id,
          mediaUrl: file.mediaUrl,
          thumbnailUrl: file.mediaUrl,
          type: datanewmedia.urlType,
        }));
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
    } catch (error) {
      console.log(error, 'error in handleUpload');
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const handleDateChange = date => {
    setSelectedDate(date);
    setShowDatePicker(false);
    dateInputRef.current.blur();
  };
  const styles = StyleSheet.create({
    row1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    column4: {
      flex: 1,
      margin: 4,
    },
    column2: {
      flex: 1,
      marginRight: 10,
    },
    picker: {
      backgroundColor: 'white',
    },

    pickerview: {
      height: 50,
      maxHeight: 50,
      minHeight: 50,
      borderColor: '#ccc6c6',
      borderRadius: 4,

      width: '100%',
      maxWidth: '100%',
      minWidth: '100%',
      borderWidth: 1,
      paddingTop: 0,
      marginTop: 5,
      backgroundColor: 'white',

      border: '1px solid #ccc6c6',
    },
    mediaIcon: {
      marginTop: 7,
      marginLeft: 5,
    },
    textInputStyle: {
      border: '0px solid #ccc6c6',
    },
    location: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderRadius: 4,
      fontSize: 17,
      color: 'black',
      paddingLeft: 15,
      borderColor: '#ccc6c6',
      borderWidth: 1,
    },
    column12: {
      marginTop: 10,
      border: 0,
    },
    description: {},
    additionalContent: {
      height: 50,
      backgroundColor: 'blue',
      backgroundColor: '#F2F2F2',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 2,
      borderRadius: 4,
    },
  });
  const SaveMemory = async () => {
    try {
      console.log('SaveMemory called');
      setLoading(true);
      await handleUpload();

      setLoadingMessage('Uploading...');
      const creatememorydata = {
        EventTitle: MediaNote,
        eventDate: selectedDate || null,
        CD_Flag: 1,
        description: null,
        location: locationinfo,
        userId,
        isEvent: false,
        isStory: false,
      };

      if (file) {
        creatememorydata.contents = [
          {
            elements: [
              {
                type: file.type,
                mediaId: mediaIds.current[0],
                mediaUrl: selectedMedias.current[0],
              },
            ],
          },
        ];
      }

      let cloneOwner = null;
      if (basicInfo?.isClone) {
        cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
          ?.linkId?.[0];
        console.log(cloneOwner, ' ==cloneOwner');
        creatememorydata.userId = cloneOwner;
      }
      if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
        cloneOwner = basicInfo?._id;
        creatememorydata.userId = cloneOwner;
      }
      await dispatch(createMemory(creatememorydata))
        .unwrap()
        .then(async __response => {
          if (newlyPublishedMedias?.current.length) {
            dispatch(resetMemoriesApiDta());
            dispatch(
              setRecentlyPublishedBlob([
                {
                  media: newlyPublishedMedias.current?.[0]?.mediaUrl,
                  chapterid: __response?.contents?.[0]?.elements?.[0]?.mediaId,
                  type: newlyPublishedMedias.current?.[0]?.type,
                  thumbnailUrl: newlyPublishedMedias.current?.[0]?.thumbnailUrl,
                },
              ]),
            );
          } else {
            dispatch(setRecentlyPublishedBlob([]));
          }

          if (userId) {
            setTimeout(() => {
              Toast.show({
                type: 'success',
                text1: toastMessages?.['10001'],
              });
            }, 1000);

            navigation.goBack();
            setLoading(false);
          }
        });
    } catch (error) {
      console.log(error, 'error in SaveMemory');
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: toastMessages?.Memory_Error?.['10004'],
      });
    }
  };
  function handleBack() {
    if (
      MediaNote !== '' ||
      selectedDate !== null ||
      locationinfo !== '' ||
      file?.length > 0
    ) {
      seOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  }

  function handleAspectRatioChange(number) {
    setAspectRatio(number);
  }

  // ====== Effects ======
  useEffect(() => {
    if (!file) {
      setSelectedRatio(1);
    }
  }, [file]);

  // ====== Render ======
  return (
    <>
      <GlobalHeader
        onBack={handleBack}
        heading={'Add Memory'}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAvoidingView enabled={true} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="always">
          {openConfirmPopup && (
            <Confirm
              accessibilityLabel={'add-memory-confirm-popup'}
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
          <GlobalStyle>
            <View>
              {mediaToPreview && (
                <MediaPreview
                  preAddedMedia={file ? [file] : []}
                  totalVideoCountAllowed={1}
                  totalImageCountAllowed={1}
                  maxFiles={1}
                  mediaData={[mediaToPreview]}
                  onCloseMediaPreview={handleCloseMediaPreview}
                  onSaveMedia={handleBlobData}
                  onSavedMediaDataCopy={handleSaveOriginalCopy}
                  onAspectRatioChange={event => {
                    handleAspectRatioChange(event);
                    setSelectedRatio(event);
                  }}
                  selectedRatio={selectedRatio}
                  isEditing={false}
                  onRemovedMedia={() =>
                    handleRemovedFromPreview(mediaToPreview._id)
                  }
                  onUpdateMediaPreview={e => handleSetMediaPreview(e, true)}
                />
              )}

              <View style={styles.row}>
                <View style={[styles.column12, {padding: 4}]}>
                  <View
                    style={{
                      height: 300,
                      width: '100%',
                      borderWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: theme.colors.altoGray,
                      borderRadius: 6,
                    }}>
                    {file ? (
                      file?.type?.toLowerCase() === 'image' ? (
                        <Image
                          source={{uri: file.mediaUrl}}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 6,
                          }}
                        />
                      ) : (
                        <VideoThumbnail
                          thumbnailUrl={file?.thumbnailUrl || file?.mediaUrl}
                          src={file.mediaUrl}
                          resize="cover"
                          preventPlay={false}
                          imuwMediaStyle={{width: '100%', height: '100%'}}
                          imuwThumbStyle={{borderRadius: 6, width: '100%'}}
                          renderLocalThumbnailIos={true}
                        />
                      )
                    ) : (
                      <FileUploader
                        allowedFiles={['image', 'video']}
                        accessibilityLabel={'add-memory-File-upload'}
                        totalVideoCountAllowed={1}
                        totalImageCountAllowed={1}
                        maxFiles={1}
                        blobData={file ? [file] : []}
                        onGetMedia={handleSetMediaPreview}>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          accessibilityLabel={'AddMediaIcon'}>
                          <AddMediaIcon accessibilityLabel={'AddMediaIcon'} />
                          <Text
                            style={{color: NewTheme.colors.secondaryDarkBlue}}
                            accessibilityLabel={'Add media'}>
                            Add media
                          </Text>
                        </View>
                      </FileUploader>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.column12, {padding: 4}]}>
                  <CustomInput
                    accessibilityLabel={'note'}
                    name="MediaNote"
                    testID="note"
                    mode="outlined"
                    label="Note"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    onChangeText={text => {
                      setMediaNote(text);
                    }}
                    maxLength={50}
                    value={MediaNote}
                    right={<Text>{`${MediaNote.length}/50`}</Text>}
                    outlineColor={theme.colors.altoGray}
                    disabled={loading}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.column12, {padding: 4}]}>
                  <CustomInput
                    accessibilityLabel={'location'}
                    name="location"
                    testID="location"
                    mode="outlined"
                    label=" Location"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    contentStyle={{paddingStart: 5}}
                    left={<LocationPinkIcon testID="LocationMemoryIcon" />}
                    leftContentStyles={{width: 30, alignItems: 'flex-end'}}
                    onChangeText={text => {
                      setLocationInfo(text);
                    }}
                    clearable
                    value={locationinfo}
                    outlineColor={theme.colors.altoGray}
                    disabled={loading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View
                  style={[styles.column12, {padding: 4}]}
                  onTouchEnd={() => {
                    if (!loading) {
                      setShowDatePicker(true);
                    }
                  }}>
                  <CustomInput
                    accessibilityLabel={'date'}
                    name="date"
                    ref={dateInputRef}
                    testID="date"
                    mode="outlined"
                    label=" Date"
                    style={[styles.textInputStyle, {backgroundColor: 'white'}]}
                    contentStyle={{paddingStart: 5}}
                    left={<CalendarPinkIcon testID="CalendarMemoryIcon" />}
                    leftContentStyles={{width: 30, alignItems: 'flex-end'}}
                    value={
                      selectedDate
                        ? moment(selectedDate).format('DD MMM YYYY')
                        : ''
                    }
                    disabled={true}
                    onPress={() => {
                      if (!loading) {
                        setShowDatePicker(true);
                      }
                    }}
                    outlineColor={theme.colors.altoGray}
                    showSoftInputOnFocus={false}
                  />
                  <Animated.View
                    entering={SlideInDown.duration(250).damping(10)}>
                    <ImuwDatePicker
                      accessibilityLabel={'datepicker'}
                      onClose={() => {
                        setShowDatePicker(false);
                        dateInputRef.current.blur();
                      }}
                      open={showDatePicker}
                      testID="datepicker"
                      selectedDate={
                        selectedDate ? new Date(selectedDate) : new Date()
                      }
                      mode="date"
                      onDateChange={handleDateChange}
                    />
                  </Animated.View>
                </View>
              </View>
              <View style={[styles.row, {marginBottom: 100, paddingTop: 20}]}>
                <View style={styles.column12}>
                  <CustomButton
                    accessibilityLabel={'createMemoryBtn'}
                    testID="createMemoryBtn"
                    className="createMemoryBtn"
                    label={'Save'}
                    loading={loading}
                    onPress={() => {
                      SaveMemory();
                    }}
                    disabled={!file || loading}
                  />
                </View>
              </View>
            </View>
          </GlobalStyle>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default AddMemory;
