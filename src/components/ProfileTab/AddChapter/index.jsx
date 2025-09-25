/* eslint-disable react/self-closing-comp */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import { LocationIcon, CalendarIcon } from '../../../images';
import Milestones from '../Milestones';
import { BottomChapter, GlobalHeader } from '../../../components';
import { GlobalStyle } from '../../../core';
import Toast from 'react-native-toast-message';
import FileUploader from '../../../common/media-uploader';
import { useTheme, Text } from 'react-native-paper';
import MediaUploaderIcon from '../../../images/Icons/StoryMediaUploaderIcon';
import { useNavigation } from '@react-navigation/native';
import { AddChapterHeader, CustomInput } from '../../../components';
import Confirm from '../../Confirm';
import { SCREEN_WIDTH } from '../../../constants/Screens';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getRandomLetters } from '../../../utils';
import { uploadMedia } from '../../../store/apps/mediaSlice';
import { Milestone } from '../../../images';
import { CloseIcon } from '../../../images/Icons/ModalIcon';
import useKeyboardHeight from './../../../hooks/useKeyboardheight';
import { CustomButton, VideoThumbnail } from '../../../core';
import {
  createChapter,
  fetchChaptersData,
  setRecentlyPublishedBlob,
  setResetFetchAll,
} from '../../../store/apps/viewChapter';
import { Track } from '../../../../App';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import CustomTextInput from '../../CustomTextInput';
import { colors } from '../../../common/NewTheme';

import LifestorySmallBottomSheet from '../../../common/LifestorySmallBottomSheet';
import Lifestorybgimg from '../../../images/Icons/Lifestorybgimg';
import LifestoryBgFirst from '../../../images/Icons/LifestoryBgFirst';
import lifestoryimgbg2 from '../../../images/lifestorybg2.png';
import MentionsInput from '../../MentionsInput';
import { CameraIcon, GallaryIcon, VideoIcon } from '../../../images';
import { Portal } from 'react-native-paper';
import MediaPreview from '../../MediaPreview';
import FastImage from '@d11/react-native-fast-image';

function LifestoryBackground() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
      <View
        style={{
          flex: 1,
        }}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/leaves/leaves1.png',
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
        }}>
        <FastImage
          source={{
            uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/leaves/leaves2.png',
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={{
            height: '100%',
            width: '100%',
          }}
        />
      </View>
    </View>
  );
}

const AddChapter = ({
  route,
  setOpenOptions,
  setOpenCamera,
  setOpenVideo,
  setOpenGallery,
}) => {
  const fullHeight = Dimensions.get('screen').height;
  const originalAspectRatio = 1;
  useNativeBackHandler(handleBack);
  const theme = useTheme();
  const navigation = useNavigation();
  const keyboardHeight = useKeyboardHeight();

  const dispatch = useDispatch();
  const id = route.params ? route.params.id : undefined;
  const memberTreeId = route.params ? route.params.memberTreeId : undefined;
  const [sheetState, setSheetState] = useState({ open: false, sheetNumber: 0 });
  const [milestoneValue, setMilestoneValue] = useState(null);
  const [, setMilestoneTitle] = useState(null);
  const [, setLoadingMessage] = useState('Uploading...');
  const [loading, setLoading] = useState(false);
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [openMilestone, setOpenMilestone] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(originalAspectRatio);
  const [mediaToPreview, setMediaToPreview] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isReEditing, setIsReEditing] = useState(false);
  const [mediaToPreviewCopy, setMediaToPreviewCopy] = useState([]);

  const [showBottomBar, setShowBottomBar] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const userData = useSelector(state => state?.userInfo);
  const [files, setFiles] = useState([]);
  const newlyPublishedMedias = useRef([]);
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const [, setPageElements] = useState([]);
  const mediaIds = useRef([]);
  const selectedMedias = useRef([]);

  const userInfo = useSelector(state => state.userInfo);

  const userId = id ? id : userInfo._id;
  const treeId = memberTreeId ? memberTreeId : userInfo?.treeIdin?.[0];
  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );

  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Lifestory,
  );

  const bottomSheetRef = useRef(null);

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.open();
  };

  const openCamera = useRef();
  const openGallery = useRef();
  const openVideo = useRef();

  const hangleCameraOpen = () => {
    openCamera?.current?.();
  };
  const hangleGalleryOpen = () => {
    openGallery?.current?.();
  };
  const hangleVideoOpen = () => {
    openVideo?.current?.();
  };

  useEffect(() => {
    if (setOpenOptions) {
      setOpenOptions([hangleCameraOpen, hangleGalleryOpen, hangleVideoOpen]);
    }
  }, [setOpenCamera, setOpenGallery, setOpenVideo]);

  useEffect(() => {
    if (!files.length) {
      setSelectedRatio(1);
    }
  }, [files]);

  function renderFilePreview(file) {
    return (
      <View style={{ position: 'relative' }}>
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
          <CloseIcon accessibilityLabel={'media-CloseIcon'} />
        </TouchableOpacity>
        {file?.type?.toLowerCase() === 'image' ? (
          <Pressable onPress={handleReEdit.bind(null, false)}>
            <Image
              style={{
                zIndex: 1,
                resizeMode: 'cover',
                borderRadius: 8,
                width: SCREEN_WIDTH / 4,
                height: SCREEN_WIDTH / 4,
              }}
              alt={file.type}
              source={{ uri: file.mediaUrl }}
              accessibilityLabel={`media-${file.type}`}
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
              renderLocalThumbnailIos={true}
              thumbnailUrl={
                file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
              }
              accessibilityLabel={`media-video-${file.type}`}
              src={file.mediaUrl}
              preventPlay={false}
              imuwMediaStyle={{ width: '100%', height: '100%' }}
              imuwThumbStyle={{ borderRadius: 6, width: '100%' }}
            />
          </View>
        )}
      </View>
    );
  }

  function handleRemoveFile(file) {
    const fileIndex = files.findIndex(i => i._id === file._id);
    if (fileIndex >= 0) {
      if (file?._id && !file._id.startsWith('local-')) {
        deletedMediaIds.current.push(file._id);
      }

      const newData = files.filter(i => i._id !== file._id);
      const newMediaToPreviewCopy = mediaToPreviewCopy.filter(
        i => i._id !== file._id,
      );
      const newMediaToPreview = mediaToPreview.filter(i => i._id !== file._id);

      setFiles(newData);
      setMediaToPreviewCopy(newMediaToPreviewCopy);
      setMediaToPreview(newMediaToPreview);
    }
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),

    description: Yup.string().required('Description is required'),
  });

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

        // Add additional fields
        formData.append('groupId', JSON.stringify([]));
        formData.append('imgCategory', 'Lifechapter');

        const payload = {
          id: userId,
          formData,
        };

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

          setPageElements(prev => [
            ...prev,
            ...response.payload.data.map(datapageelement => ({
              mediaId: datapageelement._id,
              mediaUrl: datapageelement.mediaUrl,
              type: datapageelement.urlType,
            })),
          ]);

          response.payload.data.forEach(res => {
            mediaIds?.current?.push(res._id);
            selectedMedias?.current?.push(res.mediaUrl);
          });
        }
      }

      newlyPublishedMedias.current = newlyPublishedMedia;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      location: '',
      description: '',
    },
    validationSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true);
        await handleUpload(files);
        setLoadingMessage('Uploading...');
        dispatch(setResetFetchAll(userId));
        const createchapterdata = {
          EventTitle: formik.values.title,
          description: formik.values.description,

          CD_Flag: 1,

          eventDate: `${selectedDate || null}`,
          location: formik.values.location,

          userId,
          isStory: false,
          isEvent: true,

          contents: [],
        };
        let cloneOwner = null;
        if (basicInfo?.isClone) {
          cloneOwner = basicInfo?.cLink?.find(link => link?.treeId === treeId)
            ?.linkId?.[0];
          createchapterdata.userId = cloneOwner;
        }
        if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
          cloneOwner = basicInfo?._id;
          createchapterdata.userId = cloneOwner;
        }
        const elements = [];
        let mediaData = [];

        mediaIds?.current?.map((id, index) => {
          elements.push({
            type: files?.[index]?.type,
            mediaId: id,
            mediaUrl: selectedMedias.current[index],
          });
          mediaData = [{ elements }];
        });
        createchapterdata.contents = mediaData;
        await dispatch(createChapter(createchapterdata))
          .unwrap()
          .then(__response => {
            setSubmitting(false);
            if (newlyPublishedMedias?.current.length) {
              dispatch(
                setRecentlyPublishedBlob([
                  {
                    media: newlyPublishedMedias.current,
                    chapterid: __response._id,
                  },
                ]),
              );
            } else {
              dispatch(setRecentlyPublishedBlob([]));
            }
            if (userId || treeId) {
              let cloneOwner = null;
              if (basicInfo?.isClone) {
                cloneOwner = basicInfo?.cLink?.find(
                  link => link?.treeId === treeId,
                )?.linkId?.[0];
              }
              if (!basicInfo?.isClone && basicInfo?.cLink?.length > 0) {
                cloneOwner = basicInfo?._id;
              }
              dispatch(
                fetchChaptersData({
                  userId: userId,
                  treeId: treeId,
                  clinkowner: cloneOwner,
                }),
              ).then(() => {
                setTimeout(() => {
                  Toast.show({
                    type: 'success',
                    text1: toastMessages?.['7001'],
                  });
                }, 1000);

                navigation.goBack();
                formik.resetForm();
                setLoading(false);
              }).catch(() => {
                Toast.show({
                  type: 'error',
                  text1: toastMessages?.Lifestory_Error?.['7004'],
                })
              })
            }
          });

        /* customer io and mixpanel event changes  start */
        Track({
          cleverTapEvent: 'lifestory_created',
          mixpanelEvent: 'lifestory_created',
          userData,
        });
        /* clevertap and mixpanel events ---end****/
      } catch (error) {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    setSaveButtonDisabled(
      !formik.values.title || !selectedDate || !formik.values.description,
    );
  }, [formik.values.title, selectedDate, formik.values.description]);

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

  function handleBack() {
    if (
      formik.values.title !== '' ||
      formik.values.location !== '' ||
      formik.values.description !== '' ||
      files.length > 0
    ) {
      seOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  }
  const BottomSheetOpen = number => {
    setSheetState({ open: true, sheetNumber: number });
  };
  const BottomSheetClose = () => {
    setSheetState({ open: false, sheetNumber: 0 });
  };
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
          heading={'Create Lifestory'}
          onBack={handleBack}
          backgroundColor={colors.backgroundCreamy}
        />
        <View
          style={{
            flex: 1,
            borderColor: 'red',
            position: 'relative',
          }}>
          <LifestoryBackground />
          {openMilestone && (
            <Milestones
              openPopUp={openMilestone}
              handleClickCloseMilestone={handleMilestoneChange}
              closeMilestone={closeMilestone}
              title={'Create Lifestory'}
              milestoneValue={milestoneValue}
            />
          )}
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
              />
            )}

            <>
              <View style={newStyles.container}>
                <View style={{ paddingTop: 30 }}>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.column12,
                        { padding: 10 },
                        { borderRadius: 10 },
                        { paddingBottom: 20 },
                      ]}>
                      {!milestoneValue && (
                        <TouchableOpacity
                          disabled={loading}
                          onPress={handleClickOpenMilestone}
                          style={{
                            width: '100%',
                            padding: 9,
                            marginTop: 0,
                            marginBottom: 15,
                            borderRadius: 10,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderColor: colors.primaryOrange,
                            border: '2px solid ',
                            borderWidth: 2,
                          }}>
                          <Milestone
                            strokeColor={colors.primaryOrange}
                            accessibilityLabel={'Milestone'}
                          />
                          <Text
                            style={{
                              margin: 0,
                              color: colors.primaryOrange,
                              paddingLeft: 5,
                            }}
                            accessibilityLabel={'Milestone-prompt-text'}>
                            Select a prompt to mark a milestone
                          </Text>
                        </TouchableOpacity>
                      )}
                      {!milestoneValue && (
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
                            { backgroundColor: 'white' },
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
                            <Text>{`${formik?.values?.title?.length}/50`}</Text>
                          }
                          outlineColor={theme.colors.altoGray}
                          inputHeight={50.9}
                        />
                      )}
                      {milestoneValue && (
                        <>
                          <View
                            style={{
                              backgroundColor: 'white',
                              width: '100%',
                              paddingVertical: 20,
                              marginTop: 15,
                              marginBottom: 0,
                              borderRadius: 6,
                              flexDirection: 'row', // Changed from 'flex' to 'row'
                              alignItems: 'center', // Align items vertically
                              borderWidth: 3,
                              borderColor: '#E77237',
                              borderStyle: 'dashed',
                            }}>
                            {/* Icon or Milestone Component */}
                            <View style={{ paddingHorizontal: 12 }}>
                              <TouchableOpacity
                                onPress={handleClickOpenMilestone}>
                                <Milestone
                                  strokeColor={colors.primaryOrange}
                                  accessibilityLabel={'Milestone'}
                                />
                              </TouchableOpacity>
                            </View>
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
                          <CustomInput
                            accessibilityLabel={'chapter-title'}
                            name="title"
                            testID="chapter-title"
                            ref={titleInputRef}
                            mode="outlined"
                            label="Chapter Title"
                            disabled={loading}
                            style={[
                              styles.textInputStyle,
                              { backgroundColor: 'white', marginTop: '10%' },
                            ]}
                            onChangeText={text => {
                              if (text.length <= 50) {
                                formik.handleChange('title')(text);
                              }
                            }}
                            inputHeight={50.9}
                            required
                            onBlur={formik.handleBlur('title')}
                            value={formik.values.title}
                            error={
                              formik.touched.title &&
                              Boolean(formik.errors.title)
                            }
                            right={
                              <TouchableOpacity
                                onPress={handleClickOpenMilestone}>
                                {/* <Milestone strokeColor="#000" /> */}
                                <Text>{`${formik?.values?.title?.length}/50`}</Text>
                              </TouchableOpacity>
                            }
                            outlineColor={theme.colors.altoGray}
                          />
                        </>
                      )}
                    </View>
                  </View>
                  <View style={[styles.row, { paddingTop: 0 }]}>
                    <View
                      style={[
                        styles.column12,
                        { paddingRight: 10, paddingLeft: 10 },
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
                        // style={[createStoryStyles.backgroundColor]}
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
                      paddingBottom: 60,
                    }}>
                    {files.map(file => (
                      <View key={file.uri}>{renderFilePreview(file)}</View>
                    ))}
                  </View>
                </View>
                {/* </ImageBackground> */}
              </View>
            </>
          </ScrollView>
        </View>
      </>

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
            blobData={files}
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
            blobData={files || []}
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
            blobData={files}
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
          preAddedMedia={files}
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
          isEditing={false}
          onRemovedMedia={handleRemovedFromPreview}
          onUpdateMediaPreview={e => handleSetMediaPreview(e, true)}
        />
      )}

      <View style={[styles.bottomCard]}>
        <View style={[styles.row, { paddingTop: 20, marginBottom: 0 }]}>
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

      <Portal>
        <LifestorySmallBottomSheet
          ref={bottomSheetRef}
          options={options}
          customOptionStyle={{ color: 'black', fontSize: 18 }}
          customTitleStyle={{ color: 'black', fontSize: 22 }}
          titleVariant={'bold'}
          contentHeight={300}
          containerStyle={{ height: 200 }}
          disableSnapPoint={true}
          enableDynamicSizingProp={false}
          submitOnPress={() => formik.handleSubmit()}
          loading={loading}
          saveButtonDisabled={saveButtonDisabled}
          inputData={data => {
            formik.values.location = data.selectedLocation;
            setSelectedDate(data.selectedDate);
          }}
        />
      </Portal>
    </>
  );
};

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

export default AddChapter;

const styles = StyleSheet.create({
  backgroundContainer: {
    height: 200,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    // borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
});
