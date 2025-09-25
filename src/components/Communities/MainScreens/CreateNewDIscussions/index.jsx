import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ImageBackground,
  Platform,
  Keyboard,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FileUploader from '../../../../common/media-uploader';
import {
  AddImage,
  CameraIcon,
  CreateNewPollIcon,
  CrossIcon,
  DocsIcon,
  DocumentFileIcon,
  GallaryIcon,
  RightArrow,
  VideoIcon,
} from '../../../../images';
import { SCREEN_WIDTH } from '../../../../constants/Screens';
import { CloseIcon } from '../../../../images/Icons/ModalIcon';
import {
  createDiscussionAPI,
  uploadMediaDiscussion,
} from '../../../../api/index';
import { useSelector } from 'react-redux';
import { getRandomLetters } from '../../../../utils';
import BottomBarButton from '../../CommunityComponents/BottomBarButton';
import CustomTextInput from '../../../CustomTextInput';
import Theme from '../../../../common/NewTheme';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { VideoThumbnail } from '../../../../core';
import { DocumentUploader } from '../../../../common/document-uploader';
import NewTheme from '../../../../common/NewTheme';
import Axios from '../../../../plugin/Axios';
import Toast from 'react-native-toast-message';
import { Text } from 'react-native-paper';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import { Track } from '../../../../../App';
import { desanitizeInput, sanitizeInput } from '../../../../utils/sanitizers';
import { createThumbnail } from 'react-native-create-thumbnail';
import MediaPreview from '../../../MediaPreview';
import CommunitySelector from '../CreateCommunityPost/CommunitySelector';
import { useNavigation } from '@react-navigation/native';
import MentionsInput from '../../../MentionsInput';
import { fetchMember } from '../../../../store/apps/createCommunity';
import { useQueryClient } from '@tanstack/react-query';
import FastImage from '@d11/react-native-fast-image';

const capitalizeFirstLetter = str => {
  if (typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const { height } = Dimensions.get('window');

const CreateNewDIscussions = ({
  route,
  fromScreen = 'communityHome',
  setDiscussionFormChanged,
  setCurrentScreen,
  setScreenChangeConfirmPopup,
  communityDetails,
}) => {
  const isIos = Platform.OS === 'ios';
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState(route?.params?.action || 'Create');
  const [openConfirmPopup, seOpenConfirmPopup] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const [titleTyped, setTitleTyped] = useState(true);
  const [descriptionTyped, setDescriptionTyped] = useState(true);
  const [selectedRatio, setSelectedRatio] = useState(1);
  const [acceptatio, setRatio] = useState(1);
  const [community, setCommunity] = useState(communityDetails || null);
  const [openCommunitySelector, setOpenCommunitySelector] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const navigation = useNavigation();
  const userId = useSelector(state => state?.userInfo?._id);
  const userInfo = useSelector(state => state?.userInfo);
  const communityData = useSelector(
    state => state?.getCommunityDetails?.communityDetails?.data,
  );
  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  });
  const toastMessages = useSelector(
    state => state?.getToastMessages?.toastMessages?.Communities,
  );

  // Remove Mentions and convert it to plain text
  const removeMentions = text => text.replace(/@\[(.*?)\]\([^)]+\)/g, '$1');

  // const {discussionData} = route.params;
  const { discussionData = {} } = route?.params || {};
  // Function to check if any input field is filled
  const checkIfFormIsDirty = () => {
    return (
      formik.values.title.trim() !== '' ||
      formik.values.description.trim() !== '' ||
      files?.length > 0 ||
      (fromScreen !== 'insideCommunity' ? community : false)
    );
  };
  useEffect(() => {
    if (Object.keys(discussionData).length !== 0) {
      setCommunity(discussionData?.communityDetails);
    }
  }, [discussionData]);

  const handleUploadMedia = async discussionId => {
    if (files?.length < 0 && action === 'create') {
      files?.length;
      return true;
    }
    const formData = new FormData();
    files.forEach(blobData => {
      const fileName = getRandomLetters();
      // Determine the correct file extension
      const fileExtension =
        blobData?.mimeType === 'image/jpg' ||
          blobData?.type?.toLowerCase() === 'image'
          ? '.jpg'
          : blobData?.mimeType === 'video/mp4' ||
            blobData?.type?.toLowerCase() === 'video'
            ? '.mp4'
            : '';
      const imageData = {
        uri: blobData?.mediaUrl,
        name:
          blobData?.mimeType === 'image/jpeg' ||
            blobData?.mimeType === 'video/mp4' ||
            blobData?.type?.toLowerCase() === 'video' ||
            blobData?.type?.toLowerCase() === 'image'
            ? `${fileName}${fileExtension}` // Use the random name with an extension
            : blobData?.name,
        type:
          blobData?.mimeType ||
          (blobData?.type?.toLowerCase() === 'image'
            ? 'image/jpeg'
            : blobData?.type?.toLowerCase() === 'video'
              ? 'video/mp4'
              : blobData?.type?.toLowerCase() === 'pdf'
                ? 'application/pdf'
                : blobData?.type?.toLowerCase() === 'docx'
                  ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  : blobData?.type?.toLowerCase() === 'xlsx'
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : blobData?.type),
      };
      formData.append('image', imageData);
    });

    formData.append('imgCategory', 'Communitypost');
    const payload = {
      userId,
      discussionId,
      formData,
    };

    try {
      const response = await uploadMediaDiscussion(payload);
      return true;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
      return false;
    }
  };

  const getDiscussionById = async _id => {
    if (!_id) {
      return;
    }
    const data = await Axios.get(`getDiscussionById/${_id}`);
    if (data) {
      return data?.data?.data;
    }
  };
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema,
    onSubmit: async values => {
      if (!values.title || !values.description) {
        Alert.alert(toastMessages?.validation?.["5024"], toastMessages?.validation?.["5018"]);
        return;
      }
      const sanitizedInput = sanitizeInput(values.description);
      const originalOutput = desanitizeInput(sanitizedInput);
      const uniqueTagIds = [
        ...new Set(
          values?.description
            .match(/imeuswe:([a-f0-9]+)/g)
            ?.map(id => id.split(':')[1]),
        ),
      ];
      const payload = {
        communityId: community?._id,
        shortDescription: values?.description,
        title: values?.title,
        tagUserIds: uniqueTagIds,
      };

      let isMediaUploaded = 'No';
      try {
        if (action === 'Create') {
          setIsLoading(true);
          const response = await createDiscussionAPI(payload);
          const discussionId = response?.data?.discussionData?._id;
          const createdAt = response?.data?.discussionData?.createdAt;
          const mediaUploadSuccess = await handleUploadMedia(discussionId);
          // Refresh Data for feed page
          await Promise.all([
            queryClient.invalidateQueries([
              'communityAllPosts',
              'community',
              community?._id,
            ]),
          ]);

          if (mediaUploadSuccess) {
            isMediaUploaded = 'Yes';
            if (fromScreen === 'communityHome') {
              route.params.onGoBack({
                updated: Math.random(),
                thumbnailUrl: thumbnailUri,
                createdAt: createdAt,
              });

              navigation.goBack();
            } else {
              navigation.navigate('CommunityDetails', {
                created: Math.random(),
                communityId: community?._id,
                thumbnailUrl: thumbnailUri,
                createdAt: createdAt,
              });
            }
          } else {
            Toast.show({
              type: 'error',
              text1: toastMessages?.["5025"],
            });
          }
        } else if (action === 'Edit') {
          setIsLoading(true);
          const uniqueTagIds = [
            ...new Set(
              values?.description
                .match(/imeuswe:([a-f0-9]+)/g)
                ?.map(id => id.split(':')[1]),
            ),
          ];
          const payload = {
            communityId: discussionData?.communityDetails?._id,
            shortDescription: values.description,
            title: values.title,
            tagUserIds: uniqueTagIds,
          };
          const response = await Axios.put(
            `discussions/${discussionData?._id}`,
            payload,
          );
          // Edit media upload is pending
          const mediaUploadSuccessUpdate = await handleUploadMedia(
            discussionData?._id,
          );
          if (mediaUploadSuccessUpdate) {
            isMediaUploaded = 'Yes';
            const newdiscussionData = await getDiscussionById(
              discussionData?._id,
            );
            const createdAt = newdiscussionData?.createdAt;
            if (
              route?.params?.screen === 'community' &&
              route?.params?.location === 'communityFeeds'
            ) {
              route?.params?.onGoBack({
                newUpdated: Math.random(),
                communityId: discussionData?.communityDetails?._id,
                newDiscussionData: newdiscussionData,
                thumbnailUrl: thumbnailUri,
                createdAt: createdAt,
              });
              // Go back to the previous screen
              navigation.goBack();
            } else {
              navigation.navigate('ViewSingleDiscussion', {
                routeParamsForsetData: route?.params?.previousRouteParams,
                _id: discussionData?._id,
                updated: Math.random(),
                screen: route?.params?.screen,
                newDiscussionData: newdiscussionData,
                thumbnailUrl: thumbnailUri,
                createdAt: createdAt,
              });
            }
          } else {
            Toast.show({
              type: 'error',
              text1: toastMessages?.["5025"],
            });
          }
        }
        /* customer io and mixpanel event changes  start */
        const props = {
          community_name: communityData?.communityName,
          category: communityData?.categoryName,
          title: payload?.title,
          description: payload?.shortDescription,
          media_uploaded: isMediaUploaded,
        };
        Track({
          cleverTapEvent: 'discussion_published',
          mixpanelEvent: 'discussion_published',
          userInfo,
          cleverTapProps: props,
          mixpanelProps: props,
        });
        /* clevertap and mixpanel events ---end****/
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (action === 'Edit' && discussionData) {
      formik.setValues({
        title: discussionData.title,
        description: discussionData.shortDescription,
      });
      // Assuming discussionData contains a list of files if any

      const media = [];
      discussionData.mediaDetails?.forEach(content => {
        media.push({
          mediaUrl: content.mediaUrl,
          type: content.urlType,
          _id: content._id,
          thumbnailUrl: content.thumbnailUrl,
          name: content.fileName || 'fileName',
        });
      });
      setFiles(media);
      gernerateThumbAfterUpdate(media);
    }
  }, [action, discussionData]);

  // Generate Thumbnail When We Update Discussion
  const gernerateThumbAfterUpdate = async files => {
    try {
      // Find the first video file in the array
      const firstVideoFile = files.find(
        file => file?.type.toLowerCase() === 'video',
      );

      if (firstVideoFile) {
        // Generate the thumbnail for the first video file
        const { path } = await createThumbnail({
          url: firstVideoFile.mediaUrl,
          timeStamp: 2000, // 2 seconds
        });

        setThumbnailUri(path); // Store the thumbnail URI
      }
    } catch (error) { }
  };

  function formatFileName(fileName) {
    // Find the file extension if it exists
    let extensionIndex = fileName?.lastIndexOf('.');
    let extension =
      extensionIndex !== -1 ? fileName?.slice(extensionIndex) : '';

    // Get the base name without extension
    let baseName =
      extensionIndex !== -1 ? fileName?.slice(0, extensionIndex) : fileName;

    // Check if the base name is longer than 5 characters
    if (baseName && baseName?.length > 5) {
      // Truncate base name to 5 characters and add ellipsis
      baseName = baseName?.slice(0, 5) + '...';
    }

    // Combine the truncated base name and the extension
    return baseName + extension;
  }

  const [mediaToPreview, setMediaToPreview] = useState([]);

  /**
   * @param {import('../../../../common/media-uploader').Media[]} data
   */
  function handleSetMediaPreview(data, shouldAppend = false) {
    const allAreVideo = data.every(media => media.type === 'Video');
    const allDocs = data.every(media => media.type === 'Application');
    data.forEach((_element, index) => {
      if (!data[index]._id) {
        data[index]._id =
          `local-${Date.now() + index}-${Math.floor(Math.random() * 100000)}`;
      }
      data[index].originalMedia = data[index].mediaUrl;
    });
    // Avoid editing videos
    if ((!allAreVideo && !allDocs) || shouldAppend) {
      if (shouldAppend) {
        data = [...mediaToPreview, ...data];
      }
      setMediaToPreview(data);
    } else {
      handleBlobData(data);
    }
  }

  const [isReEditing, setIsReEditing] = useState(false);

  async function handleBlobData(data) {
    const firstFile = data[0];
    if (firstFile && firstFile.mimeType === 'video/mp4' && !thumbnailUri) {
      try {
        // Generate the video thumbnail for the first video file only
        const { path } = await createThumbnail({
          url: firstFile.mediaUrl,
          timeStamp: 2000, // 4 seconds
        });
        setThumbnailUri(path); // Store the thumbnail URI
      } catch (error) { }
    }
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

  // const handleBlobData = async val => {
  //   setFiles([...files, ...val]);
  //   // Check if the first file in the array is a video
  //   const firstFile = val[0];
  //   if (firstFile && firstFile.mimeType === 'video/mp4' && !thumbnailUri) {
  //     try {
  //       // Generate the video thumbnail for the first video file only
  //       const {path} = await createThumbnail({
  //         url: firstFile.mediaUrl,
  //         timeStamp: 2000, // 4 seconds
  //       });
  //       setThumbnailUri(path); // Store the thumbnail URI
  //     } catch (error) {}
  //   }
  // };
  function handleReEdit(isEditing) {
    if (isEditing) {
      return;
    }
    setIsReEditing(true);
    setMediaToPreview(mediaToPreviewCopy);
  }
  const handleRemoveFile = async file => {
    let filtered;
    if (action === 'Edit') {
      filtered = files.filter(i => i._id !== file._id);
      setFiles(filtered);
    } else {
      filtered = files.filter(i => i._id !== file._id);
      let filterMediaToPreview = mediaToPreview.filter(i => i._id !== file._id);
      let filterMediaToPreviewCopy = mediaToPreviewCopy.filter(
        i => i._id !== file._id,
      );
      setFiles(filtered);
      setMediaToPreview(filterMediaToPreview);
      setMediaToPreviewCopy(filterMediaToPreviewCopy);
    }
    // If there are files left, update the thumbnail
    if (filtered?.length > 0) {
      const firstFile = filtered[0];
      // If the first file is a video, regenerate the thumbnail
      if (
        firstFile?.mimeType === 'video/mp4' ||
        firstFile?.type?.toLowerCase() === 'video'
      ) {
        try {
          const { path } = await createThumbnail({
            url: firstFile.mediaUrl,
            timeStamp: 2000, // 2 seconds timestamp to generate the thumbnail
          });
          setThumbnailUri(path); // Set the thumbnail URI for the video
        } catch (error) { }
      } else {
        // If the First file is not a video, reset thumbnailUri to null
        setThumbnailUri(null);
      }
    } else {
      // If no files are left, reset the thumbnailUri to null
      setThumbnailUri(null);
    }
  };
  const closeForm = () => {
    Keyboard.dismiss();
    if (checkIfFormIsDirty()) {
      seOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (formik?.values?.title?.length === 0) {
      setTitleTyped(true);
    }
    if (formik?.values?.description?.length === 0) {
      setDescriptionTyped(true);
    }
  }, [formik?.values?.title, formik?.values?.description]);

  useEffect(() => {
    if (checkIfFormIsDirty()) {
      setDiscussionFormChanged(true);
    }
  }, [formik?.values, community, files]);

  const onSwitch = () => {
    if (checkIfFormIsDirty()) {
      setScreenChangeConfirmPopup(true);
    } else {
      setCurrentScreen('poll');
    }
  };

  function handleCloseMediaPreview() {
    setMediaToPreview([]);
    setIsReEditing(false);
  }
  const renderFilePreview = file => {
    return (
      <View style={styles.filePreviewContainer} key={file.uri}>
        <TouchableOpacity
          disabled={isLoading}
          onPress={() => handleRemoveFile(file)}
          accessibilityLabel={`Remove ${file.name} from the file preview`}
          style={styles.closeIconButton}>
          <CloseIcon size={15} />
        </TouchableOpacity>
        {file?.type?.toLowerCase() === 'image' ? (
          <Pressable onPress={handleReEdit.bind(null, action === 'Edit')}>
            <Image
              style={styles.imagePreview}
              source={{ uri: file.mediaUrl }}
              accessibilityLabel={`Image preview of ${file.name}`}
            />
          </Pressable>
        ) : file?.type?.toLowerCase() === 'video' ? (
          <View style={styles.videoPreviewContainer}>
            <VideoThumbnail
              renderLocalThumbnailIos={true}
              thumbnailUrl={
                file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
              }
              resize="cover"
              src={file.mediaUrl}
              preventPlay={false}
              imuwMediaStyle={
                Platform.OS === 'android' ? { width: '100%', height: '100%' } : {}
              }
              imuwThumbStyle={{ borderRadius: 6, width: '100%' }}
              accessibilityLabel={`Video preview of ${file.name}`}
            />
          </View>
        ) : (
          <View
            style={{
              borderRadius: 5,
              overflow: 'hidden', // Ensures border radius is applied to child elements
              width: 100,
              height: 100,
            }}>
            <FastImage
              source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/bgimgdocumen.png' }} // Replace with your local image reference
              style={{
                flex: 1,
                justifyContent: 'center', // Center content inside the ImageBackground
                borderRadius: 5,
              }}
              accessibilityLabel={`Document file: ${file.name}`}
              resizeMode="cover">
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <DocumentFileIcon />
                <Text
                  style={{
                    color: 'black', // Adjust text color as needed
                    // marginTop: 10,
                    fontSize: 12,
                  }}
                  accessibilityLabel={`File name: ${formatFileName(file.name)}`}>
                  {formatFileName(file.name)}
                </Text>
              </View>
            </FastImage>
          </View>
        )}
      </View>
    );
  };
  const [mediaToPreviewCopy, setMediaToPreviewCopy] = useState([]);

  function handleSaveOriginalCopy(data) {
    const updatedData = [...mediaToPreviewCopy, ...data];

    const uniqueData = updatedData.filter((item, index) => {
      return (
        updatedData.findIndex(_item => _item.mediaUrl === item.mediaUrl) ===
        index
      );
    });

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

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    // Cleanup listeners on unmount
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <>
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="always">
            <View style={{ marginTop: 50, marginHorizontal: 20 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  navigation.navigate('CommunitySelector', {
                    onGoBack: data => {
                      setCommunity(data);
                      formik.setFieldValue(
                        'description',
                        removeMentions(formik.values.description),
                      );
                    },
                  });
                }}
                style={{
                  pointerEvents:
                    fromScreen === 'insideCommunity' ||
                      Object.keys(discussionData).length !== 0
                      ? 'none'
                      : 'auto',
                }}>
                {!community ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 10,
                      paddingRight: 35,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        color: '#888888',
                        paddingVertical: 10,
                        fontSize: 16,
                        lineHeight: 16,
                      }}>
                      Select Community
                      <Text
                        style={{
                          color: '#FF0000',
                          fontSize: 16,
                          lineHeight: 16,
                        }}>
                        *
                      </Text>
                    </Text>
                    <RightArrow />
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      height: 34,
                      alignItems: 'center',
                      marginBottom: 10,
                      borderRadius: 8,
                      // shadowColor: '#000',
                      // shadowOpacity: 0.3,
                      // shadowRadius: 4.65,
                      // shadowOffset: {width: 0, height: 4},
                    }}>
                    <View
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          overflow: 'hidden',
                          paddingHorizontal: 5,
                          paddingVertical: 2,
                          gap: 5,
                        },
                        community?._id
                          ? {
                            backgroundColor:
                              fromScreen === 'insideCommunity' ||
                                Object.keys(discussionData).length !== 0
                                ? '#DCDCDC'
                                : 'white',
                            // elevation: 7,
                            borderRadius: 8,
                            borderColor: '#dbdbdb',
                            borderWidth: 1.1,
                          }
                          : {},
                      ]}>
                      {community?.logoUrl ? (
                        <Image
                          style={styles.profilePic}
                          source={{ uri: community?.logoUrl }}
                          accessibilityLabel={`${community?.communityName || community?.name} community logo`}
                        />
                      ) : (
                        <FastImage
                          style={styles.profilePic}
                          source={{ uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/CommunityDefaultImage.png' }}
                          accessibilityLabel="Default community logo"
                        />
                      )}
                      <Text
                        variant="bold"
                        numberOfLines={2}
                        style={{
                          color: 'black',
                          fontSize: 12,
                          lineHeight: 12,
                          flexShrink: 1,
                          flexGrow: 0,
                        }}>
                        {community?.communityName}
                      </Text>
                      <RightArrow />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ marginBottom: 10 }}>
                <CustomTextInput
                  autoCorrect={true}
                  mode="outlined"
                  inputHeight={48}
                  label="Title of Discussion"
                  maxLength={200}
                  value={formik.values.title}
                  innerContainerStyle={{
                    backgroundColor: NewTheme.colors.backgroundCreamy,
                  }}
                  onChangeText={text => {
                    let inputValue = text;
                    if (text?.length > 0 && titleTyped) {
                      // Capitalize the first letter only when the input is initially empty
                      inputValue = capitalizeFirstLetter(inputValue);
                      setTimeout(() => {
                        setTitleTyped(false);
                      }, 1000);
                    }
                    if (
                      text?.length === 0 ||
                      formik?.values?.title.length === 0
                    ) {
                      setTitleTyped(true);
                    }
                    formik.setFieldValue('title', inputValue);
                  }}
                  onBlur={formik.handleBlur('title')}
                  error={formik.touched.title && formik.errors.title}
                  clearable={true}
                  crossIconBackground={NewTheme.colors.backgroundCreamy}
                  required
                  contentStyle={{
                    backgroundColor: NewTheme.colors.backgroundCreamy,
                  }}
                  accessibilityLabel="Discussion title input"
                  disabled={isLoading}
                />
                {formik.touched.title && formik.errors.title && (
                  <Text style={styles.errorText}>{formik.errors.title}</Text>
                )}
              </View>

              <MentionsInput
                label={'Description'}
                required
                autoCorrect={true}
                useCommunityApi={true}
                inputHeight={268}
                textVerticalAlign="top"
                error={formik.touched.description && formik.errors.description}
                contentStyle={{
                  height: height / 3.4,
                  borderColor: NewTheme.colors.lightGrey,
                  color: NewTheme.colors.text,
                  backgroundColor: NewTheme.colors.backgroundCreamy,
                  // marginTop: Platform.OS === 'ios' ? 8 : 0,
                }}
                style={styles.description}
                accessibilityLabel="Discussion description"
                value={formik.values.description}
                onChangeText={text => {
                  formik.setFieldValue('description', text);
                  let inputValue = text;
                  if (text?.length > 0 && descriptionTyped) {
                    // Capitalize the first letter only when the input is initially empty
                    inputValue = capitalizeFirstLetter(inputValue);
                    setTimeout(() => {
                      setDescriptionTyped(false);
                    }, 1000);
                  }
                  if (
                    text?.length === 0 ||
                    formik?.values?.description.length === 0
                  ) {
                    setDescriptionTyped(true);
                  }
                  formik.setFieldValue('description', inputValue);
                }}
                onBlur={formik.handleBlur('description')}
                disabled={isLoading}
                communityId={community?._id}
              />
              {formik.touched.description && formik.errors.description && (
                <Text style={[styles.errorText, { marginTop: 0 }]}>
                  {formik.errors.description}
                </Text>
              )}
            </View>

            <View style={styles.mediaSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={files?.length > 1}
                bounces={files?.length > 2}>
                <View style={styles.filesPreviewContainer}>
                  {files.map(file => renderFilePreview(file))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {openConfirmPopup && (
        <Confirm
          title={'Are you sure you want to leave?'}
          subTitle={'If you discard, you will lose your changes.'}
          discardCtaText={'Discard Changes'}
          continueCtaText={'Continue'}
          onContinue={() => seOpenConfirmPopup(false)}
          onDiscard={() => {
            navigation.goBack();
          }}
          buttonSwap={true}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={() => seOpenConfirmPopup(false)}
        />
      )}
      {mediaToPreview.length > 0 && (
        <MediaPreview
          preAddedMedia={files}
          key={mediaToPreview.length}
          totalVideoCountAllowed={1}
          totalImageCountAllowed={9}
          maxFiles={9 - uniqueMediaLength}
          mediaData={mediaToPreview}
          onCloseMediaPreview={handleCloseMediaPreview}
          onSaveMedia={handleBlobData}
          onSavedMediaDataCopy={handleSaveOriginalCopy}
          onAspectRatioChange={event => {
            setRatio(event);
            setSelectedRatio(event);
          }}
          selectedRatio={selectedRatio}
          isEditing={action === 'Edit'}
          onRemovedMedia={handleRemovedFromPreview}
          onUpdateMediaPreview={e => handleSetMediaPreview(e, true)}
        />
      )}

      {/* Post Media Options */}
      {!keyboardVisible && (
        <>
          <View
            style={{
              backgroundColor: '#FFF0D8',
              width: '100%',
              height: 150,
              position: 'absolute',
              bottom:
                Platform.OS === 'ios'
                  ? insets.bottom - height / 24
                  : insets.bottom,
              paddingHorizontal: 50,
              paddingTop: 15,
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'baseline',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              {/* Launch Camera */}
              <FileUploader
                disabled={isLoading}
                uploadType="camera"
                documentUpload={true}
                totalVideoCountAllowed={1}
                blobData={files}
                totalImageCountAllowed={9}
                allowedFiles={['image', 'video']}
                accessibilityLabel="camera"
                onGetMedia={handleSetMediaPreview}>
                <View
                  style={{
                    height: 24,
                    justifyContent: 'center',
                  }}>
                  <CameraIcon />
                </View>
              </FileUploader>

              {/* Video Files */}
              <FileUploader
                disabled={isLoading}
                uploadType="video"
                documentUpload={true}
                totalVideoCountAllowed={1}
                blobData={files}
                allowedFiles={['video']}
                accessibilityLabel="video"
                onGetMedia={handleSetMediaPreview}>
                <View
                  style={{
                    height: 24,
                    justifyContent: 'center',
                  }}>
                  <VideoIcon />
                </View>
              </FileUploader>

              {/* Open Gallary */}
              <FileUploader
                disabled={isLoading}
                uploadType="gallary"
                documentUpload={true}
                totalVideoCountAllowed={1}
                blobData={files}
                totalImageCountAllowed={9}
                accessibilityLabel="gallery"
                allowedFiles={['image', 'video']}
                onGetMedia={handleSetMediaPreview}>
                <View
                  style={{
                    height: 24,
                    justifyContent: 'center',
                  }}>
                  <GallaryIcon />
                </View>
              </FileUploader>

              {/* Upload Files */}
              <FileUploader
                disabled={isLoading}
                totalDocumentCountAllowed={3}
                uploadType="docs"
                documentUpload={true}
                blobData={files}
                accessibilityLabel="docs"
                onGetMedia={handleSetMediaPreview}>
                <View
                  style={{
                    height: 24,
                    justifyContent: 'center',
                  }}>
                  <DocsIcon />
                </View>
              </FileUploader>

              {/* Switch Screen */}
              {action === 'Create' &&
                <TouchableOpacity
                  accessibilityLabel="create-new-poll"
                  onPress={() => {
                    onSwitch();
                  }}>
                  <View
                    style={{
                      height: 24,
                      justifyContent: 'center',
                    }}>
                    <CreateNewPollIcon />
                  </View>
                </TouchableOpacity>
              }
            </View>
          </View>
          <BottomBarButton
            label="Publish"
            onPress={formik.handleSubmit}
            loading={isLoading}
            disabled={
              !(formik.isValid && formik.dirty && community) || isLoading
            }
          />
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    // flex: 1,
    backgroundColor: NewTheme.colors.backgroundCreamy,
  },

  profilePic: {
    width: 22,
    height: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  header: {
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NewTheme.colors.secondaryLightBlue,

    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  iconButton: {
    position: 'absolute',
  },
  coloredBackground: {
    width: '100%',
    // height: '20%',
    backgroundColor: NewTheme.colors.secondaryLightBlue,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    padding: '5%',
  },
  textTitle: {
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 8,
    zIndex: 2,
  },
  imagePreview: {
    resizeMode: 'cover',
    borderRadius: 8,
    width: 100,
    height: 100,
  },
  videoPreviewContainer: {
    borderRadius: 8,
    width: 100,
    height: 100,
  },
  filePreviewContainer: {
    position: 'relative',
    marginRight: 10,
  },
  closeIconButton: {
    backgroundColor: 'lightgray',
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
    borderRadius: 5,
    padding: 5,
  },
  additionalContent: {
    marginTop: 10,
    height: 100,
    width: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  mediaIcon: {
    marginTop: 7,
    color: '#FF725E',
  },
  addMediaText: {
    color: '#FF725E',
    paddingBottom: 12,
    paddingTop: 6,
    textAlign: 'center',
    fontSize: 14,
  },
  filesPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    marginTop: 10,
    minWidth: SCREEN_WIDTH,
  },
  mediaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 20,
  },
  addMediaContainer: {
    width: '30%',
    alignItems: 'center',
  },
  errorText: {
    color: '#8B0000',
    marginTop: 5,
  },
  description: {
    marginTop: 10,
    backgroundColor: 'white',
    height: 124,
  },
  backgroundImage: {
    width: 100, // Set your desired width
    height: 100, // Set your desired height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentIcon: {
    resizeMode: 'cover',
    height: 50, // Adjust the height to your preference
    width: 50, // Adjust the width to your preference
    marginBottom: 5, // Space between icon and text
  },
  fileName: {
    fontSize: 14, // Adjust text size
    color: '#000', // Set text color
    textAlign: 'center',
  },
});

export default CreateNewDIscussions;
