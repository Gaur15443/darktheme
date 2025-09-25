import React, {memo, useEffect, useRef, useState} from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Modal, Portal} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import PropTypes from 'prop-types';
import Theme from '../Theme';
import {CloseIcon} from '../../images/Icons/ModalIcon';
import Toast from 'react-native-toast-message';
import {PERMISSIONS, request} from 'react-native-permissions';
import {capitalize, numberToWords} from './../../utils/format';
import {launchImageLibrary} from 'react-native-image-picker';
import {CommunityDocumentUploader} from '../community-document-uploader';
import {WINDOW_HEIGHT} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MainToast} from '../../../App';
import GalleryIcon from '../../images/Icons/UploadMedia/GalleryIcon';
import VideoIcon from '../../images/Icons/UploadMedia/VideoIcon';
import CameraIcon from '../../images/Icons/UploadMedia/CameraIcon';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import DocumentIcon from '../../images/Icons/UploadMedia/DocumentIcon';
import * as Sentry from "@sentry/react-native";

/**
 * @global
 * @typedef {Object} Media - Media data container.
 * @property {string} [_id] - Optional unique identifier for the media file.
 * @property {string} name - The name of the media file.
 * @property {number} size - The size of the media file in bytes.
 * @property {string} mediaUrl - The URL or path to access the media file.
 * @property {string} mimeType - The MIME type of the media file.
 * @property {('Image'|'Audio'|'Video')} type - The type of the media file (e.g., image, video, audio).
 * @property {boolean} documentUpload - allow document to be uploaded or not
 * @property {function} setOpenGallery - callback to provide function refrence to open gallery from parent
 * @property {function} setOpenCamera - callback to provide function refrence to open gallery from parent
 * @property {function} setOpenVideo- callback to provide function refrence to open gallery from parent
 * @property {function} onGetMedia - callback which returns selected media | files
 * @property {number} maxFileSize - maximum allowed file size
 * @property {number} totalImageCountAllowed - maximum allowed image count
 * @property {number} totalVideoCountAllowed - maximum allowed video count
 * @property {number} totalDocumentCountAllowed - maximum allowed document count
 * @property {number} maxVideoDuration - maximum allowed video duration
 * @property {number} maxImageSize - maximum allowed image size
 * @property {Array} blobData - array of media | file data
 */

/**
 * Component for uploading files.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} [props.children] - Child components.
 * @param {Object} [props.childrenStyle] - Child component stlye.
 * @param {number} [props.totalImageCountAllowed] - Total files to allow, including the ones already uploaded.
 * @param {number} [props.maxFileSize=50] - Maximum file size allowed (in MB).
 * @param {(media: Media[]) => Media[]} [props.onGetMedia] - Function to handle getting media data.
 * @param {('image'|'audio'|'video')[]} [props.allowedFiles] - Types of files allowed to upload ('image', 'audio', 'video').
 * @param {number} [props.maxVideoDuration=300] - Maximum allowed video duration (in seconds).
 * @param {number} [props.maxImageSize=20] - Maximum allowed image size (in MB).
 * @param {Media[]} [props.blobData] - Array of media data to be uploaded.
 * @param {boolean} [props.documentUpload=false] - allow document to be uploaded or not
 * @param {function} [props.setOpenGallery] - callback to provide function refrence to open gallery from parent
 * @param {function} [props.setOpenCamera] - callback to provide function refrence to open gallery from parent
 * @param {function} [props.setOpenVideo] - callback to provide function refrence to open gallery from parent.
 * @param {boolean} [props.disabled=false] - disable the file uploader
 * @param {number} [props.totalVideoCountAllowed=1] - maximum allowed video count
 * @param {number} [props.totalDocumentCountAllowed=1] - maximum allowed document count
 */
const FileUploader = ({
  setOpenGallery = () => undefined,
  setOpenCamera = () => undefined,
  setOpenVideo = () => undefined,
  uploadType = null,
  documentUpload = false,
  children,
  childrenStyle = {},
  disabled,
  maxFileSize = 50,
  totalImageCountAllowed = 1,
  totalVideoCountAllowed = 1,
  totalDocumentCountAllowed = 1,
  onGetMedia = () => undefined,
  allowedFiles = ['image', 'video', 'audio'],
  maxVideoDuration = 300, //5 minutes
  maxImageSize = 20,
  blobData = [],
  isAstroTheme = false,
  ...props
}) => {
  const [myUri, setUri] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const {bottom} = useSafeAreaInsets();

  const translateY = new Animated.Value(0);

  useEffect(() => {
    if (setOpenGallery) {
      setOpenGallery(handleFileSelectionImage);
    }
    if (setOpenCamera) {
      setOpenCamera(launchCamera);
    }
    if (setOpenVideo) {
      setOpenVideo(handleFileSelectionVideo);
    }
  }, [setOpenGallery, setOpenCamera, setOpenVideo]);

  const onGestureEvent = Animated.event(
    [{nativeEvent: {translationY: translateY}}],
    {useNativeDriver: true},
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 50) {
        hideModal();
      }
      // Reset position
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  class CustomUploadError extends Error {
    constructor(name, message) {
      super(message);
      this.name = name;
    }
  }

  const ErrorNames = {
    MAX_FILES: 'MAX_FILES',
    MAX_SIZE: 'MAX_SIZE',
    UNSUPPORTED_FILE: 'UNSUPPORTED_FILE',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
  };

  async function checkCameraPermissions() {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.CAMERA;
    } else {
      permission = PERMISSIONS.ANDROID.CAMERA;
    }

    const result = await request(permission);

    return result;
  }

  async function checkGalleryPermissions() {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    let result = await request(permission);
    return result;
  }

  // Check For Docs
  const checkIsDocPresent = () => {
    return (
      blobData?.filter(file =>
        ['pdf', 'docx', 'xlsx', 'application'].includes(
          file?.type?.toLowerCase(),
        ),
      )?.length || 0
    );
  };
  const blobLength = blobData.filter(
    item => item?.type?.toLowerCase?.() === 'image',
  ).length;

  const launchCamera = async () => {
    try {
      const numberOfDocsPresent = checkIsDocPresent();
      if (numberOfDocsPresent > 0) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          'Files cannot be combined with images or videos in the same post.',
        );
      }

      if (blobLength >= totalImageCountAllowed) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          `You can't select more than ${totalImageCountAllowed} files.`,
        );
      }
      const permissionResult = await checkCameraPermissions();

      if (permissionResult !== 'granted' && permissionResult !== 'limited') {
        throw new CustomUploadError(
          ErrorNames.PERMISSION_DENIED,
          'Please enable access to the camera through settings on your phone.',
        );
      }

      const result = await ImagePicker.openCamera({
        compressImageQuality: 0.6,
        cropping: false,
        mediaType: 'photo',
        cropperToolbarTitle: 'Edit Image',
      });

      onGetMedia([
        {
          _id: `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          name: result.filename,
          size: result.size,
          mediaUrl: result.path,
          mimeType: result.mime,
          type: capitalize(result.mime.split('/')[0]),
        },
      ]);
      setModalVisible(false);
    } catch (error) {
      onGetMedia([]);
      if (error.message === 'User cancelled image selection') {
        return;
      }
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setModalVisible(false);
    }
  };

  const handleFileSelectionImage = async () => {
    try {
      const permissionResult = await checkGalleryPermissions();
      if (permissionResult !== 'granted' && permissionResult !== 'limited') {
        throw new CustomUploadError(
          ErrorNames.PERMISSION_DENIED,
          'Please enable access to your photo library through settings on your phone.',
        );
      }
      
      const numberOfDocsPresent = checkIsDocPresent();
      if (numberOfDocsPresent > 0) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          'Files cannot be combined with images or videos in the same post.',
        );
      }

      const maxImages = blobData?.filter?.(
        file => file?.type?.toLowerCase?.() === 'image',
      )?.length;
      if (maxImages >= totalImageCountAllowed) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          `You can only upload ${totalImageCountAllowed} images per post.`,
        );
      }

      const itemsToPick = 'photo';

      const {assets: files = []} = await launchImageLibrary({
        mediaType: itemsToPick,
        selectionLimit: totalImageCountAllowed - maxImages,
      });

      if (files.length + maxImages > totalImageCountAllowed) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          `You can only upload ${totalImageCountAllowed} images per post.`,
        );
      }

      const selectedMedia = [];

      files.forEach((file, index) => {
        if (file?.fileSize > maxImageSize * 1024 * 1024) {
          throw new CustomUploadError(
            ErrorNames.MAX_SIZE,
            'One or more images exceed the maximum file size allowed',
          );
        }

        selectedMedia.push({
          _id: `local-${Date.now()}-${index}-${Math.floor(Math.random() * 100000)}`,
          mediaUrl: file.uri,
          name: file.fileName,
          size: file.size,
          mimeType: file.type,
          type: capitalize(file.type.split?.('/')?.[0]),
        });
      });

      onGetMedia(selectedMedia);
      setModalVisible(false);

      if (files.length) {
        setUri(files[0].uri);
      }
    } catch (error) {
      onGetMedia([]);
      if (error.message === 'User cancelled image selection') {
        return;
      }
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setModalVisible(false);
    }
  };

  const handleFileSelectionVideo = async () => {
    try {
      const permissionResult = await checkGalleryPermissions();
      if (permissionResult !== 'granted' && permissionResult !== 'limited') {
        throw new CustomUploadError(
          ErrorNames.PERMISSION_DENIED,
          'Please enable access to your photo library through settings on your phone.',
        );
      }
      const numberOfDocsPresent = checkIsDocPresent();
      if (numberOfDocsPresent > 0) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          'Files cannot be combined with images or videos in the same post.',
        );
      }

      const maxVideos = blobData?.filter?.(
        file => file?.type?.toLowerCase?.() === 'video',
      )?.length;
      if (maxVideos >= totalVideoCountAllowed) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          `You can only upload ${numberToWords(totalVideoCountAllowed)} video per post.`,
        );
      }

      const itemsToPick = 'video';

      const {assets: files = []} = await launchImageLibrary({
        mediaType: itemsToPick,
        selectionLimit: totalVideoCountAllowed,
      });

      const selectedMedia = [];

      files.forEach((file, index) => {
        if (Math.round(file?.duration) > maxVideoDuration) {
          return Toast.show({
            type: 'error',
            text1: 'The video exceeds the maximum duration allowed.',
          });
        }

        selectedMedia.push({
          _id: `local-${Date.now()}-${index}-${Math.floor(Math.random() * 100000)}`,
          mediaUrl: file.uri,
          name: file.fileName,
          size: file.size,
          mimeType: file.type,
          type: capitalize(file.type.split?.('/')?.[0]),
        });
      });

      onGetMedia(selectedMedia);
      setModalVisible(false);

      if (files.length) {
        setUri(files[0].uri);
      }
    } catch (error) {
      onGetMedia([]);
      if (error.message === 'User cancelled video selection') {
        return;
      }
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setModalVisible(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      let isImagesAndImagesPresent = 0;
      isImagesAndImagesPresent = blobData?.filter?.(
        file =>
          file?.type?.toLowerCase?.() === 'image' ||
          file?.type?.toLowerCase?.() === 'video',
      )?.length;

      if (isImagesAndImagesPresent > 0) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          'Files cannot be combined with images or videos in the same post.',
        );
      }

      const maxDocuments = blobData.filter(
        file =>
          file.type?.toLowerCase?.() !== 'video' &&
          file.type?.toLowerCase?.() !== 'image',
      )?.length;
      if (maxDocuments >= totalDocumentCountAllowed) {
        throw new CustomUploadError(
          ErrorNames.MAX_FILES,
          'You have exceeded the maximum number of files allowed for a post.',
        );
      }
      const pickedFile = await CommunityDocumentUploader();

      if (pickedFile) {
        const {name, size, uri, type} = pickedFile[0];
        if (size > maxFileSize * 1024 * 1024) {
          throw new CustomUploadError(
            ErrorNames.MAX_SIZE,
            'One or more files exceed the maximum file size allowed.',
          );
        }

        const media = {
          _id: `local-${Date.now()}-0-${Math.floor(Math.random() * 100000)}`,
          name: name || uri.split('/').pop(),
          size: size,
          mediaUrl: uri,
          mimeType: type,
          type: capitalize(type.split('/')[0]),
        };

        onGetMedia([media]);
      } else {
        onGetMedia([]);
      }
    } catch (error) {
      onGetMedia([]);
      if (error.message !== 'User cancelled document picker') {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    } finally {
      setModalVisible(false);
    }
  };

  const slideAnimation = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const hideModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  return (
    <Sentry.Mask>
    <View {...props}>
      <TouchableOpacity
        disabled={disabled}
        accessibilityLabel="open media upload options"
        style={childrenStyle}
        onPress={() => {
          try {
            Keyboard.dismiss();
          } catch (_error) {
            /** empty. */
          }
          if (uploadType === null) {
            setModalVisible(true);
          } else {
            switch (uploadType) {
              case 'docs':
                handleFileUpload();
                break;
              case 'video':
                handleFileSelectionVideo();
                break;
              case 'gallary':
                handleFileSelectionImage();
                break;
              case 'camera':
                launchCamera();
                break;

              default:
                break;
            }
          }
        }}>
        {children}
      </TouchableOpacity>
      <Portal>
        <MainToast />
        <Modal
          style={{marginBottom: 0}}
          visible={modalVisible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalOverlay}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{translateY: slideAnimation}],
                  paddingBottom: Platform.OS === 'ios' ? bottom : 10,
                  backgroundColor: isAstroTheme
                    ? 'rgba(42, 39, 64, 1)'
                    : 'white',
                },
              ]}>
              <View style={styles.bottomDialogContainer}>
                <View
                  style={{
                    width: '15%',
                    height: 4,
                    backgroundColor: 'lightgrey',
                    borderRadius: 8,
                    alignSelf: 'center',
                    marginBottom: 10,
                    marginTop: 15,
                  }}
                />
                <TouchableOpacity
                  accessibilityLabel="open camera"
                  style={[
                    styles.buttonStyle,
                    {
                      borderBottomWidth: 1,
                      borderColor: isAstroTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'lightgrey',
                    },
                  ]}
                  onPress={launchCamera}>
                  <CameraIcon stroke={isAstroTheme ? 'white' : '#E77237'} />
                  <Text
                    style={[
                      styles.bottomOptionText,
                      {color: isAstroTheme ? 'white' : 'black'},
                    ]}>
                    {isAstroTheme ? 'Take a Photo' : 'Photos'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonStyle,
                    {
                      borderBottomWidth: 1,
                      borderColor: isAstroTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'lightgrey',
                    },
                  ]}
                  onPress={handleFileSelectionImage}
                  accessibilityLabel="open media library">
                  <GalleryIcon stroke={isAstroTheme ? 'white' : '#E77237'} />
                  <Text
                    style={[
                      styles.bottomOptionText,
                      {color: isAstroTheme ? 'white' : 'black'},
                    ]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonStyle,
                    documentUpload
                      ? {
                          borderBottomWidth: 1,
                          borderColor: isAstroTheme
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'lightgrey',
                        }
                      : {},
                  ]}
                  onPress={handleFileSelectionVideo}
                  accessibilityLabel="open media library">
                  <VideoIcon stroke={isAstroTheme ? 'white' : '#E77237'} />
                  <Text
                    style={[
                      styles.bottomOptionText,
                      {color: isAstroTheme ? 'white' : 'black'},
                    ]}>
                    Videos
                  </Text>
                </TouchableOpacity>
                {documentUpload && (
                  <TouchableOpacity
                    style={[styles.buttonStyle]}
                    onPress={handleFileUpload}
                    accessibilityLabel="open media library">
                    <DocumentIcon stroke={isAstroTheme ? 'white' : '#E77237'} />
                    <Text
                      style={[
                        styles.bottomOptionText,
                        {color: isAstroTheme ? 'white' : 'black'},
                      ]}>
                      Document
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </PanGestureHandler>
          <TouchableWithoutFeedback onPress={hideModal}>
            <View
              style={{
                flex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: WINDOW_HEIGHT / 4,
              }}
            />
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>
    </View>
    </Sentry.Mask>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  bottomSheet: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 23,
    paddingHorizontal: 25,
  },
  bottomDialogContainer: {
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'black',
    fontWeight: '500',
  },
  buttonStyle: {
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  bottomOptionText: {
    color: Theme.light.shadow,
    fontSize: 16,
    paddingLeft: 16,
    fontWeight: Platform.OS === 'ios' ? '500' : '600',
  },
});

FileUploader.propTypes = {
  allowedFiles: PropTypes.arrayOf(PropTypes.oneOf(['image', 'video', 'audio']))
    .isRequired,
  children: PropTypes.node,
  childrenStyle: PropTypes.object,
  disabled: PropTypes.bool,
  maxFileSize: PropTypes.number,
  totalImageCountAllowed: PropTypes.number,
  onGetMedia: PropTypes.func.isRequired,
  totalVideoCountAllowed: PropTypes.number,
  totalDocumentCountAllowed: PropTypes.number,
  documentUpload: PropTypes.bool,
  maxVideoDuration: PropTypes.number,
  maxImageSize: PropTypes.number,
  blobData: PropTypes.array,
  setOpenGallery: PropTypes.func,
  setOpenCamera: PropTypes.func,
  setOpenVideo: PropTypes.func,
};

FileUploader.displayName = 'FileUploader';

export default memo(FileUploader);
