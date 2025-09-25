import React, {useState, useEffect, useRef, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import {BottomChapter} from '../../../components';
import MediaUploaderIcon from '../../../images/Icons/StoryMediaUploaderIcon';

import Milestones from '../Milestones';
import {GlobalHeader} from '../../../components';

import {GlobalStyle, CustomButton, VideoThumbnail} from '../../../core';
import Toast from 'react-native-toast-message';
import {getRandomLetters} from '../../../utils';
import {uploadMedia} from '../../../store/apps/mediaSlice';
import {useTheme, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {SCREEN_WIDTH} from '../../../constants/Screens';
import {AddChapterHeader, CustomInput} from '../../../components';
import Confirm from '../../Confirm';
import MentionsInput from '../../../components/MentionsInput/index';
import useKeyboardHeight from './../../../hooks/useKeyboardheight';
import LifestorySmallBottomSheet from '../../../common/LifestorySmallBottomSheet';

import {
  CrossIcon,
  Milestone,
  CalendarIcon,
  LocationIcon,
} from '../../../images';
import {CloseIcon} from '../../../images/Icons/ModalIcon';
import {CameraIcon, GallaryIcon, VideoIcon} from '../../../images';
import FileUploader from '../../../common/media-uploader';

import {
  fetchChaptersData,
  fetchOneChapterData,
  updateOneChapterData,
  setRecentlyPublishedBlob,
  setResetFetchAll,
} from '../../../store/apps/viewChapter';
import {
  resetAllPages,
  resetViewStoriesFromLifestory,
} from '../../../store/apps/story';
import {colors} from '../../../common/NewTheme';
import Lifestorybgimg from '../../../images/Icons/Lifestorybgimg';
import MediaPreview from '../../MediaPreview';

const EditChapter = ({route}) => {
  const fullHeight = Dimensions.get('screen').height;
  const originalAspectRatio = 1;
  const {chapterId} = route.params;
  const id = route.params ? route.params.id : undefined;
  const memberTreeId = route.params ? route.params.memberTreeId : undefined;
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const keyboardHeight = useKeyboardHeight();
  const [showBottomBar, setShowBottomBar] = useState(true);

  const theme = useTheme();
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const viewchapter = useSelector(state => state.apiViewChapter);
  const [files, setFiles] = useState([]);

  const [publishedMedia, setPublishedMedia] = useState([]);
  const titleInputRef = useRef(null);
  const deletedMediaIds = useRef([]);
  const descriptionInputRef = useRef(null);
  const [, setPageElements] = useState([]);
  const mediaIds = useRef([]);
  const selectedMedias = useRef([]);
  const [, setLoadingMessage] = useState('Uploading...');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const newlyPublishedMedias = useRef([]);
  const [selectedRatio, setSelectedRatio] = useState(originalAspectRatio);
  const [mediaToPreview, setMediaToPreview] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isReEditing, setIsReEditing] = useState(false);
  const [mediaToPreviewCopy, setMediaToPreviewCopy] = useState([]);

  const userId = id ? id : useSelector(state => state?.userInfo._id);
  const treeId = memberTreeId
    ? memberTreeId
    : useSelector(state => state?.userInfo?.treeIdin?.[0]);

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Lifestory,
  );

  const bottomSheetRef = useRef(null);

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.open();
  };

  const [sheetState, setSheetState] = useState({open: false, sheetNumber: 0});
  const [milestoneValue, setMilestoneValue] = useState(null);
  const [, setMilestoneTitle] = useState(null);
  const [openMilestone, setOpenMilestone] = useState(false);
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );

  const [flag, setFlag] = useState(true);

  const handleUpload = async data => {
    try {
      let newlyPublishedMedia = [];
      let response;

      for (let i = 0; i < data.length; i += 2) {
        const formData = new FormData();
        formData.append('image', {
          uri: data[i]?.mediaUrl,
          name: getRandomLetters(),
          type: data[i]?.mimeType,
        });
        if (data[i + 1]) {
          formData.append('image', {
            uri: data[i + 1]?.mediaUrl,
            name: getRandomLetters(),
            type: data[i + 1]?.mimeType,
          });
        }

        formData.append('groupId', JSON.stringify([]));
        formData.append('imgCategory', 'Lifechapter');

        const payload = {
          id: userId,
          formData,
        };

        let cloneOwner = null;
        if (basicInfo?.isClone) {
          cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
            ?.linkId?.[0];
          payload.id = cloneOwner;
        }
        if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
          cloneOwner = basicInfo?._id;
          payload.id = cloneOwner;
        }

        response = await dispatch(uploadMedia(payload));

        if (response?.payload?.data) {
          const newMedia = response.payload.data.map((datanewmedia, index) => {
            const currentIndex = i + index;
            return {
              mediaId: datanewmedia._id,
              mediaUrl: data[currentIndex]?.mediaUrl,
              thumbnailUrl: data[currentIndex]?.mediaUrl,
              type: datanewmedia.urlType,
            };
          });

          newlyPublishedMedia = [...newlyPublishedMedia, ...newMedia];
          newlyPublishedMedias.current = newlyPublishedMedia;

          setPageElements(prevElements => [
            ...prevElements,
            ...response?.payload?.data.map(datapageelement => ({
              mediaId: datapageelement?._id,
              mediaUrl: datapageelement?.mediaUrl,
              type: datapageelement?.urlType,
            })),
          ]);

          response?.payload?.data.forEach(res => {
            mediaIds?.current?.unshift(res._id);
            selectedMedias?.current?.unshift(res.mediaUrl);
          });
        }
      }

      return newlyPublishedMedia;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    if (!files.length) {
      setSelectedRatio(1);
    }
  }, [files]);

  function renderFilePreview(file) {
    return (
      <View style={{position: 'relative'}}>
        <TouchableOpacity
          onPress={() => handleRemoveFile(file)}
          style={{
            position: 'absolute',
            top: -8,
            zIndex: 10,
            backgroundColor: 'lightgray',
            borderRadius: 5,
            right: -8,
          }}>
          <CloseIcon accessibilityLabel={'Edit-Chapter-CloseIcon'} />
        </TouchableOpacity>
        {file?.type?.toLowerCase() === 'image' ? (
          <Pressable onPress={handleReEdit.bind(null, true)}>
            <Image
              style={{
                zIndex: 1,
                resizeMode: 'cover',
                borderRadius: 8,
                width: SCREEN_WIDTH / 4,
                height: SCREEN_WIDTH / 4,
              }}
              alt={file.type}
              source={{uri: file.mediaUrl}}
              accessibilityLabel={`Edit-Chapter-${file.type}`}
            />
          </Pressable>
        ) : (
          <View
            style={{
              borderRadius: 8,
              width: SCREEN_WIDTH / 4,
              height: SCREEN_WIDTH / 4,
            }}>
            <VideoThumbnail
              key={file?.thumbnailUrl}
              renderLocalThumbnailIos={true}
              thumbnailUrl={
                file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
              }
              src={file.mediaUrl}
              preventPlay={false}
              thumbnailStyle={{width: '100%', height: '100%'}}
              imuwMediaStyle={{width: '100%', height: '100%'}}
              imuwThumbStyle={{borderRadius: 6, width: '100%'}}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 6,
                overflow: 'hidden',
              }}
              resize="cover"
              accessibilityLabel={`Edit-Chapter-${file.type}`}
            />
          </View>
        )}
      </View>
    );
  }

  function handleRemoveFile(file) {
    const publishedIndex = publishedMedia.findIndex(i => i._id === file._id);

    const filesIndex = files.findIndex(i => i._id === file._id);
    if (publishedIndex >= 0 || filesIndex >= 0) {
      if (file?._id && !file._id.startsWith('local-')) {
        deletedMediaIds.current.push(file._id);
      }
      const newPublishedMedia = publishedMedia.filter(i => i._id !== file._id);
      const newFiles = files.filter(i => i._id !== file._id);
      const newMediaToPreviewCopy = mediaToPreviewCopy.filter(
        i => i._id !== file._id,
      );
      const newMediaToPreview = mediaToPreview.filter(i => i._id !== file._id);
      setFiles(newFiles);
      setPublishedMedia(newPublishedMedia);
      setMediaToPreviewCopy(newMediaToPreviewCopy);
      setMediaToPreview(newMediaToPreview);
    }
  }

  useEffect(() => {
    if (chapterId) {
      try {
        const fetchOneChapterData = async () => {
          await dispatch(fetchOneChapterData(chapterId)).unwrap();
        };

        fetchOneChapterData();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    }
  }, []);

  useEffect(() => {
    try {
      if (flag && viewchapter && viewchapter?.data) {
        if (
          viewchapter?.data?.EventTitle &&
          formik.values.title !== viewchapter?.data?.EventTitle
        ) {
          formik.setFieldValue('title', viewchapter?.data?.EventTitle);
        }
        if (
          viewchapter?.data?.description &&
          formik.values.description !== viewchapter?.data?.description
        ) {
          formik.setFieldValue('description', viewchapter?.data?.description);
        }

        if (
          viewchapter?.data?.location?.formatted_address &&
          formik.values.location !==
            viewchapter?.data?.location?.formatted_address
        ) {
          formik.setFieldValue(
            'location',
            viewchapter?.data?.location?.formatted_address ?? '',
          );
        }
        if (
          typeof viewchapter?.data?.location === 'string' &&
          formik.values.location !== viewchapter?.data?.location
        ) {
          formik.setFieldValue('location', viewchapter?.data?.location);
        }

        if (viewchapter?.data?.eventDate) {
          setSelectedDate(moment(viewchapter?.data?.eventDate).toDate());
        }
        const media = [];
        viewchapter?.data.contents?.[0]?.elements?.forEach(content => {
          media.push({
            mediaUrl: content.mediaUrl,
            type: content.type,
            _id: content.mediaId,
            thumbnailUrl: content.thumbnailUrl,
          });
        });

        setPublishedMedia(media);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [viewchapter]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),

    description: Yup.string().required('Description is required'),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      location: '',
      description: '',
    },
    validationSchema,

    onSubmit: async (values, {setSubmitting, resetForm}) => {
      try {
        setFlag(false);
        setLoading(true);
        const newlyPublishedMedia = await handleUpload(files);
        dispatch(setResetFetchAll(userId))
        setLoadingMessage('Uploading...');
        const updatechapterdata = {
          EventTitle: formik.values.title,
          description: formik.values.description,

          CD_Flag: 1,

          eventDate: `${selectedDate || null}`,
          location: formik.values.location,

          userId,
          isStory: !viewchapter?.data?.isStory ? false : true,
          storiesTitle: !viewchapter?.data?.isStory ? '' : formik.values.title,
          isEvent: true,

          contents: [],
          chapterId,
        };
        let cloneOwner = null;
        if (basicInfo?.isClone) {
          cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
            ?.linkId?.[0];
          updatechapterdata.userId = cloneOwner;
        }
        if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
          cloneOwner = basicInfo?._id;
          updatechapterdata.userId = cloneOwner;
        }
        const elements = [];
        let mediaData = [];
        const allFiles = [...newlyPublishedMedia, ...publishedMedia];
        mediaIds.current = allFiles.map(item => item._id || item.mediaId);

        for (let index = 0; index < mediaIds.current.length; index++) {
          const id = mediaIds.current[index];
          elements.push({
            type: allFiles?.[index]?.type,
            mediaId: id,
            mediaUrl: allFiles[index].mediaUrl,
          });
        }
        mediaData = [{elements}];
        if (mediaData?.length) {
          updatechapterdata.contents = mediaData;
        } else {
          updatechapterdata.contents = [];
        }
        if (viewchapter?.data?.isStory) {
          if (updatechapterdata.contents?.[0]) {
            let obj = updatechapterdata.contents?.[0];
            obj.templateContent = updatechapterdata?.description;
            updatechapterdata.description = updatechapterdata?.description;
            // const templateContent = {templateContent : storyDescription }
            // Data.contents.push(templateContent)
          } else {
            updatechapterdata.contents.push({
              templateContent: updatechapterdata?.description,
            });
            updatechapterdata.description = updatechapterdata?.description;
          }
          updatechapterdata.isStory = true;
        }
        await dispatch(updateOneChapterData(updatechapterdata)).unwrap();
        if (newlyPublishedMedias?.current.length) {
          dispatch(
            setRecentlyPublishedBlob([
              {
                media: newlyPublishedMedias.current,
                chapterid: updatechapterdata.chapterId,
              },
            ]),
          );
        } else {
          dispatch(setRecentlyPublishedBlob([]));
        }
        if (chapterId) {
          let cloneOwner = null;
          if (basicInfo?.isClone) {
            cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
              ?.linkId?.[0];
          }
          if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
            cloneOwner = basicInfo?._id;
          }
          dispatch(fetchOneChapterData(chapterId))
            .unwrap()
            .then(() => {
              dispatch(
                fetchChaptersData({
                  userId: userId,
                  treeId: treeId,
                  clinkowner: cloneOwner,
                }),
              ).unwrap();
              setTimeout(() => {
                Toast.show({
                  type: 'success',
                  text1: toastMessages?.['7002'],
                });
              }, 1000);
              navigation.goBack();
              setLoading(false);
            });
        }
      } catch (error) {
        setLoading(false);

        Toast.show({
          type: 'error',
          text1: toastMessages?.Lifestory_Error?.['7005'],
        });
      } finally {
        setSubmitting(false);
        dispatch(resetViewStoriesFromLifestory());
        dispatch(resetAllPages());
      }
    },
  });

  function handleAspectRatioChange(number) {
    setAspectRatio(number);
  }

  function handleReEdit(isEditing) {
    if (isEditing) {
      return;
    }
    setIsReEditing(true);
    setMediaToPreview(mediaToPreviewCopy);
  }

  function handleSetMediaPreview(data, shouldAppend = false) {
    const allAreVideo = data.every(media => media.type === 'Video');
    data.forEach((_element, index) => {
      if (!data[index]._id) {
        data[index]._id =
          `local-${Date.now() + index}-${Math.floor(Math.random() * 100000)}`;
      }
      data[index].originalMedia = data[index].mediaUrl;
    });

    // Avoid editing videos
    if (!allAreVideo || shouldAppend) {
      if (shouldAppend) {
        data = [...mediaToPreview, ...data];
      }
      setMediaToPreview(data);
    } else {
      handleBlobData(data);
      handleSaveOriginalCopy(data);
    }
  }

  function handleCloseMediaPreview() {
    setMediaToPreview([]);
    setIsReEditing(false);
  }
  function handleBlobData(data) {
    setMediaToPreview([]);
    const updatedData = data.map((_file, index) => {
      const result = {
        ..._file,
        _id:
          _file._id ||
          `local-${Date.now() + index}-${Math.floor(Math.random() * 100000)}`,
      };
      return result;
    });
    if (isReEditing) {
      setFiles(prev => {
        const newData = updatedData.filter(
          newFile =>
            !prev.some(existingFile => existingFile._id === newFile._id),
        );
        return [...prev, ...newData];
      });
    } else {
      setFiles(prev => [...prev, ...updatedData]);
    }
    setIsReEditing(false);
  }

  function handleSaveOriginalCopy(data) {
    const updatedData = [...mediaToPreviewCopy, ...data];

    const uniqueData = Array.from(
      new Map(updatedData.map(item => [item._id, item])).values(),
    );

    setMediaToPreviewCopy(uniqueData);
  }

  function handleRemovedFromPreview(_id) {
    const updatedBlobData = files.filter(b => b._id !== _id);
    const updatedMediaToPreviewCopy = mediaToPreviewCopy.filter(
      media => media._id !== _id,
    );
    const updatedMediaToPreview = mediaToPreview.filter(
      media => media._id !== _id,
    );

    setMediaToPreviewCopy(updatedMediaToPreviewCopy);
    setMediaToPreview(updatedMediaToPreview);
    setFiles(updatedBlobData);
  }

  const uniqueMediaLength = useMemo(() => {
    const combined = [...files, ...mediaToPreview];
    const uniqueFiles = new Map();

    combined.forEach(file => {
      if (file._id) {
        uniqueFiles.set(file._id, file);
      }
    });
    return uniqueFiles.size;
  }, [files, mediaToPreview]);

  useEffect(() => {
    setSaveButtonDisabled(
      !formik.values.title || !selectedDate || !formik.values.description,
    );
  }, [formik.values.title, selectedDate, formik.values.description]);
  function handleBack() {
    seOpenConfirmPopup(true);
  }
  const handleClickOpenMilestone = () => {
    titleInputRef?.current?.blur();
    descriptionInputRef?.current?.blur();
    setOpenMilestone(true);
  };
  const handleMilestoneChange = (value, title) => {
    setMilestoneValue(value);
    setMilestoneTitle(title);
    formik.setFieldValue('title', title);
    setOpenMilestone(false);
  };
  const closeMilestone = () => {
    setOpenMilestone(false);
  };
  const BottomSheetOpen = number => {
    setSheetState({open: true, sheetNumber: number});
  };
  const BottomSheetClose = () => {
    setSheetState({open: false, sheetNumber: 0});
  };

  const options = [
    {
      icon: CalendarIcon,
      text: 'Date',
      onPress: () => {
        BottomSheetOpen(0);
      },
    },
    {
      icon: LocationIcon,
      text: 'City, State, Country',
      onPress: () => {
        setShowBottomBar(true);
        BottomSheetOpen(2);
      },
    },
    // Add more options as needed
  ];

  return (
    <>
      <>
        <GlobalHeader
          heading={'Edit Lifestory'}
          onBack={handleBack}
          backgroundColor={colors.backgroundCreamy}
        />
        {openMilestone && (
          <Milestones
            openPopUp={openMilestone}
            handleClickCloseMilestone={handleMilestoneChange}
            closeMilestone={closeMilestone}
            title={'Edit Lifestory'}
            milestoneValue={milestoneValue}
          />
        )}
        <View
          style={{
            position: 'absolute',
            height: fullHeight,
            right: -10,
            zIndex: -1,
            top: Platform.OS === 'ios' ? '10%' : '2%',
            // bottom: '12%',
          }}>
          <View
            style={{
              transform: [{rotate: '180deg'}],
            }}>
            <Lifestorybgimg />
          </View>
        </View>
        <ScrollView keyboardShouldPersistTaps="always">
          {openConfirmPopup && (
            <Confirm
              accessibilityLabel={'confirm-popup-add-chapter'}
              title={'Are you sure you want to leave?'}
              subTitle={'If you discard, you will lose your changes.'}
              discardCtaText={'Discard'}
              continueCtaText={'Continue Editing'}
              onContinue={() => seOpenConfirmPopup(false)}
              onDiscard={() => {
                navigation.goBack();
              }}
              onCrossClick={() => seOpenConfirmPopup(false)}
              onBackgroundClick={() => seOpenConfirmPopup(false)}
            />
          )}

          <>
            <View style={newStyles.container}>
              {/* <ImageBackground
                source={lifestoryimgbg1} // Replace with your image path
                style={newStyles.backgroundImage}
                resizeMode="cover"> */}
              <View style={{paddingTop: 30}}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.column12,
                      {padding: 10},
                      {borderRadius: 10},
                      {paddingBottom: 20},
                    ]}>
                    {milestoneValue && (
                      <>
                        <View
                          style={{
                            backgroundColor: 'white',
                            width: '100%',
                            paddingVertical: 20,
                            paddingHorizontal: 10,
                            marginTop: 15,
                            marginBottom: 0,
                            borderRadius: 6,
                            flexDirection: 'row', // Changed from 'flex' to 'row'
                            alignItems: 'center', // Align items vertically
                            borderWidth: 3,
                            borderColor: '#E77237',
                            borderStyle: 'dashed',
                            marginBottom: 25,
                          }}>
                          {/* Icon or Milestone Component */}
                          {/* <View style={{paddingHorizontal: 12}}>
                            <TouchableOpacity
                              onPress={handleClickOpenMilestone}>
                              <Milestone
                                strokeColor={colors.primaryOrange}
                                accessibilityLabel={'Milestone'}
                                // style={{marginHorizontal: 10}} // Add margin if needed for spacing
                              />
                            </TouchableOpacity>
                          </View> */}
                          {/* Text Component */}
                          <Text
                            style={{
                              color: '#444444',
                              fontSize: 16, // Adjust size if needed
                              flexShrink: 1,
                              flexWrap: 'wrap',
                            }}
                            accessibilityLabel={`${milestoneValue}`}>
                            {milestoneValue}
                          </Text>
                        </View>
                      </>
                    )}
                    <CustomInput
                      accessibilityLabel={'chapter-title'}
                      name="title"
                      testID="chapter-title"
                      mode="outlined"
                      ref={titleInputRef}
                      label="Chapter Title"
                      disabled={loading}
                      style={[
                        styles.textInputStyle,
                        {backgroundColor: 'white'},
                      ]}
                      onChangeText={text => {
                        if (text.length <= 50) {
                          formik.handleChange('title')(text);
                        }
                      }}
                      required
                      onBlur={formik.handleBlur('title')}
                      value={formik.values.title}
                      error={
                        formik.touched.title && Boolean(formik.errors.title)
                      }
                      right={
                        <TouchableOpacity
                          onPress={handleClickOpenMilestone}
                          disabled={loading}>
                          <Milestone strokeColor={colors.primaryOrange} />
                        </TouchableOpacity>
                      }
                      outlineColor={theme.colors.altoGray}
                    />
                  </View>
                </View>
                <View style={[styles.row, {paddingTop: 0}]}>
                  <View
                    style={[
                      styles.column12,
                      {paddingRight: 10, paddingLeft: 10},
                    ]}>
                    <MentionsInput
                      label="Write your lifestory"
                      required
                      // disabled={postingInProgress}
                      error={
                        Boolean(formik.errors.description) &&
                        formik.touched.description
                      }
                      contentStyle={{
                        height: 190,
                        borderColor: theme.colors.lightGrey,
                        textAlign: 'justify',
                        color: theme.colors.text,
                      }}
                      // style={[EditStoryStyles.backgroundColor]}
                      accessibilityLabel="chapterDescription"
                      value={formik.values.description}
                      onChangeText={text => {
                        if (!formik.touched.description) {
                          formik.setFieldTouched('description', true, true);
                        }
                        formik.handleChange('description')(text);
                        // setDescription(description);
                      }}
                      onBlur={formik.handleBlur('description')}
                      bottomStyles={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: '#FFDBC9',
                        flex: 1,
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginHorizontal: 5,
                    alignItems: 'center',
                    marginTop: 25,
                    paddingBottom: 50,
                  }}>
                  {[...files, ...publishedMedia].map(file => (
                    <View key={file.uri}>{renderFilePreview(file)}</View>
                  ))}
                </View>
              </View>
              {/* </ImageBackground> */}
            </View>
          </>
        </ScrollView>
      </>

      <View
        style={{
          position: 'absolute',
          bottom: '2%',
          zIndex: -1,
        }}>
        <View>
          <Image
            source={require('../../../images/lifestorybg2.png')}
            style={{
              width: 400,
              height: 400,
              resizeMode: 'contain',
            }}
          />
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#FFF0D8',
          width: '100%',
          height: 150,
          position: 'absolute',
          bottom: 0,
          paddingHorizontal: 50,
          paddingTop: 15,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'baseline',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            width: '100%',
          }}>
          {/* Upload Files */}

          {/* Launch Camera */}
          <FileUploader
            disabled={loading}
            uploadType="camera"
            documentUpload={true}
            totalVideoCountAllowed={1}
            blobData={[...(publishedMedia || []), ...(files || [])]}
            totalImageCountAllowed={9}
            allowedFiles={['image', 'video']}
            onGetMedia={e => handleSetMediaPreview(e)}>
            <View
              style={{
                height: 24,
                justifyContent: 'center',
              }}>
              <CameraIcon />
            </View>
          </FileUploader>

          {/* Open Gallary */}
          <FileUploader
            disabled={loading}
            uploadType="gallary"
            totalVideoCountAllowed={1}
            blobData={[...(publishedMedia || []), ...(files || [])]}
            totalImageCountAllowed={9}
            allowedFiles={['image', 'video']}
            onGetMedia={e => handleSetMediaPreview(e)}>
            <View
              style={{
                height: 24,
                justifyContent: 'center',
              }}>
              <GallaryIcon />
            </View>
          </FileUploader>

          {/* Video Files */}
          <FileUploader
            disabled={loading}
            uploadType="video"
            documentUpload={true}
            totalVideoCountAllowed={1}
            blobData={[...(publishedMedia || []), ...(files || [])]}
            allowedFiles={['video']}
            onGetMedia={e => handleSetMediaPreview(e)}>
            <View
              style={{
                height: 24,
                justifyContent: 'center',
              }}>
              <VideoIcon />
            </View>
          </FileUploader>
        </View>
      </View>

      {mediaToPreview.length > 0 && (
        <MediaPreview
          preAddedMedia={files && publishedMedia ? [...files, ...publishedMedia] : []}
          totalVideoCountAllowed={1}
          totalImageCountAllowed={9}
          maxFiles={9 - uniqueMediaLength}
          mediaData={mediaToPreview}
          onCloseMediaPreview={handleCloseMediaPreview}
          onSaveMedia={handleBlobData}
          onSavedMediaDataCopy={handleSaveOriginalCopy}
          onAspectRatioChange={event => {
            handleAspectRatioChange(event);
            setSelectedRatio(event);
          }}
          selectedRatio={selectedRatio}
          isEditing={true}
          onRemovedMedia={handleRemovedFromPreview}
          onUpdateMediaPreview={e => handleSetMediaPreview(e, true)}
        />
      )}

      <View style={[styles.bottomCard]}>
        <View style={[styles.row, {paddingTop: 20, marginBottom: 0}]}>
          <View style={styles.column12}>
            <CustomButton
              testID="craeteChapterBtn"
              className="craeteChapterBtn"
              label={'Next'}
              loading={loading}
              onPress={handleOpenBottomSheet}
              disabled={saveButtonDisabled || loading}
            />
          </View>
        </View>
      </View>

      <LifestorySmallBottomSheet
        ref={bottomSheetRef}
        options={options}
        customOptionStyle={{color: 'black', fontSize: 18}}
        customTitleStyle={{color: 'black', fontSize: 22}}
        titleVariant={'bold'}
        contentHeight={300}
        containerStyle={{height: 200}}
        disableSnapPoint={true}
        enableDynamicSizingProp={false}
        submitOnPress={() => formik.handleSubmit()}
        loading={loading}
        saveButtonDisabled={saveButtonDisabled}
        inputData={data => {
          formik.values.location = data.selectedLocation;
          setSelectedDate(data.selectedDate);
        }}
        locationData={formik.values.location}
        editDate={selectedDate}
      />
    </>
  );
};

export default EditChapter;

const styles = StyleSheet.create({
  threeButtons: {
    borderRadius: 8,
    paddingHorizontal: '23%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  bottomCard: {
    height: 'auto',
    position: 'relative',
    bottom: 0,
    left: 0,
    width: '100%',

    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderColor: 'black',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 0,
  },
  threeButtonsContainer: {
    gap: 10,
    marginHorizontal: 20,
    marginTop: 40,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  mediaIcon: {},
  textInputStyle: {
    border: '0px solid #ccc6c6',
  },
  location: {
    backgroundColor: 'white',
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
    height: 35,
    backgroundColor: '#FFDBC9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    // borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
});

const newStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    width: '100%',
  },
  backgroundImage2: {
    flex: 1, // Ensures the image stretches to fill its container
    // width: '100%', // Ensures full width
    // height: '100%', // Ensures full height
    resizeMode: 'cover', // Ensures the image covers the container
    // paddingBottom: 180,
  },
});
