import React, {memo, useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {
  Appbar,
  Text,
  Modal as ModalPaper,
  Portal,
  useTheme,
} from 'react-native-paper';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import CropEditor from '../CropEditor';
import {VideoThumbnail} from '../../core';
import CropRotationIcon from '../../images/Icons/CropRotationIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import ErrorBoundary from '../../common/ErrorBoundary';
import MediaUploader from '../../common/media-uploader';
import {CrossIcon} from '../../images';
import Toast from 'react-native-toast-message';
import {MainToast} from '../../../App';

function MediaPreview({
  onUpdateMediaPreview = () => null,
  maxFiles = 1,
  totalVideoCountAllowed,
  totalImageCountAllowed,
  mediaData = [],
  isEditing,
  originalMedia = [],
  selectedRatio,
  onCloseMediaPreview,
  onSaveMedia,
  onSavedMediaDataCopy,
  onAspectRatioChange,
  onRemovedMedia = () => undefined,
  preAddedMedia = [],
  isAstrology = false,
}) {
  const theme = useTheme();
  const supportedAspectRatios = [
    {
      width: 1,
      height: 1,
    },
    {
      width: 16,
      height: 9,
    },
    {
      width: 4,
      height: 3,
    },
    {
      width: 3,
      height: 4,
    },
  ];

  const foundRatio = supportedAspectRatios.find(
    item => item.width / item.height === selectedRatio,
  );
  const styles = useCreateStyles(isAstrology);
  const {bottom, top} = useSafeAreaInsets();

  const [imageToEditIndex, setImageToEditIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [mediaDataCopy, setMediaDataCopy] = useState([...mediaData]);
  const [editedImagesInfo, setEditedImagesInfo] = useState([]);
  const [lastSavedAspectRatio, setLastSavedAspectRatio] = useState(
    foundRatio || {
      width: 1,
      height: 1,
    },
  );
  const [lockingRatio, setLockingRatio] = useState(false);

  useEffect(() => {
    onAspectRatioChange(
      lastSavedAspectRatio.width / lastSavedAspectRatio.height,
    );
  }, [lastSavedAspectRatio]);

  useEffect(() => {
    let foundUnEdited = false;
    if (
      lockingRatio &&
      editedImagesInfo.length < mediaData.length &&
      !showCropEditor
    ) {
      for (let index = 0; index < mediaData.length; index++) {
        const alreadyEdited =
          editedImagesInfo[index]?.width === lastSavedAspectRatio.height &&
          editedImagesInfo[index]?.height === lastSavedAspectRatio.height;
        if (!alreadyEdited) {
          foundUnEdited = true;
          setImageToEditIndex(index);
          break;
        }
        foundUnEdited = false;
      }
      if (!foundUnEdited) {
        setLockingRatio(false);
        onSavedMediaDataCopy(mediaDataCopy);
        onSaveMedia(mediaData);
      }
    }
  }, [lockingRatio, editedImagesInfo, mediaData]);

  const handleImagePress = index => {
    setImageToEditIndex(index);
    setShowCropEditor(true);
  };

  const handleSavedCrop = data => {
    setShowCropEditor(false);
    setLastSavedAspectRatio({...data.aspectRatio});

    const newEditedInfo = editedImagesInfo;
    newEditedInfo[imageToEditIndex] = {
      ...data.aspectRatio,
      index: imageToEditIndex,
    };
    setEditedImagesInfo([...newEditedInfo]);
    const fileUri = 'file://' + data.uri;
    const updatedMediaData = [...mediaData];
    updatedMediaData[imageToEditIndex].mediaUrl = fileUri;
    setMediaDataCopy(updatedMediaData);
  };

  const startLockAspectRation = () => {
    onSaveMedia(mediaData);
    onSavedMediaDataCopy(mediaDataCopy);
  };

  function handleRemoveFile(id) {
    const mediaIndex = mediaData.findIndex(media => media._id === id);
    const index = currentIndex;

    setMediaDataCopy(items => items.filter(item => item._id !== id));

    onRemovedMedia(id);

    if (mediaIndex === index && mediaIndex === mediaData.length - 1) {
      setCurrentIndex(Math.max(0, mediaIndex - 1));
    } else if (mediaIndex < index) {
      setCurrentIndex(index - 1);
    } else if (mediaIndex > index) {
      setCurrentIndex(index);
    }
  }

  const memoizedMediaComponents = useMemo(() => {
    return mediaData.map((media, index) => (
      <View style={styles.memoizedMedia} key={media.mediaUrl + index}>
        {media && media.type === 'Image' && (
          <Pressable
            accessibilityLabel={`click image position ${index + 1} to edit`}
            onPress={() => handleImagePress(index)}>
            <Image
              source={{uri: media.mediaUrl}}
              style={[
                styles.media,

                {
                  aspectRatio:
                    lastSavedAspectRatio.width / lastSavedAspectRatio.height,
                  resizeMode: 'cover',
                  alignItems: 'stretch',
                  borderRadius: 8,
                },
              ]}
            />
          </Pressable>
        )}
        {media && media.type === 'Video' && (
          <VideoThumbnail
            renderLocalThumbnailIos={true}
            thumbnailUrl={media.mediaUrl}
            resize={'cover'}
            src={media.mediaUrl}
            preventPlay={true}
            imuwThumbStyle={{
              ...styles.media,
              aspectRatio:
                lastSavedAspectRatio.width / lastSavedAspectRatio.height,
            }}
            imuwMediaStyle={{
              ...styles.media,
              aspectRatio:
                lastSavedAspectRatio.width / lastSavedAspectRatio.height,
            }}
          />
        )}
        <Text>
          {index + 1}/{mediaData.length}
        </Text>
      </View>
    ));
  }, [mediaData, lastSavedAspectRatio]);

  const previewMemoizedMediaComponents = useMemo(() => {
    return mediaData.map((media, index) => (
      <View
        key={media._id}
        style={{
          position: 'relative',
          width: 70,
          height: 80,
          marginHorizontal: 10,
          marginTop: 4,
        }}>
        <TouchableOpacity
          accessibilityLabel="crossIconStory"
          onPress={event => {
            event.stopPropagation();
            handleRemoveFile(media._id);
          }}
          style={{
            backgroundColor: 'lightgray',
            position: 'absolute',
            top: -5,
            zIndex: 10,
            padding: 5,
            borderRadius: 5,
            right: -8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
          }}>
          <CrossIcon fill={'rgb(133,130,126)'} width={10} height={10} />
        </TouchableOpacity>
        {media?.type?.toLowerCase() === 'image' && media.mediaUrl && (
          <Pressable
            onPress={event => {
              event.stopPropagation();
              setCurrentIndex(index);
            }}>
            <Image
              style={{
                zIndex: 1,
                resizeMode: 'cover',
                borderRadius: 8,
                width: 70,
                aspectRatio: 1,
                ...(currentIndex === index
                  ? {
                      borderWidth: 2,
                      borderColor: isAstrology
                        ? theme.colors.astrologylightBlue
                        : theme.colors.primary,
                    }
                  : {}),
              }}
              alt={media.type}
              source={{uri: media.mediaUrl}}
            />
          </Pressable>
        )}
        {media?.type?.toLowerCase() === 'video' && media.mediaUrl && (
          <Pressable
            style={{
              borderRadius: 8,
              width: 70,
              height: 70,
              overflow: 'hidden',
              ...(currentIndex === index
                ? {borderWidth: 2, borderColor: theme.colors.primary}
                : {}),
            }}>
            <VideoThumbnail
              customPress={() => {
                setCurrentIndex(index);
              }}
              renderLocalThumbnailIos={true}
              thumbnailUrl={
                media?.thumbnailUrl ? media?.thumbnailUrl : media.mediaUrl
              }
              resize={'cover'}
              src={media.mediaUrl}
              preventPlay={true}
              imuwMediaStyle={{
                width: 70,
                height: 70,
              }}
              imuwThumbStyle={{borderRadius: 6, width: '100%'}}
            />
          </Pressable>
        )}
      </View>
    ));
  }, [mediaData, lastSavedAspectRatio, currentIndex]);

  return (
    <ErrorBoundary.Screen>
      <View style={styles.parent}>
        <Portal>
          <ModalPaper
            visible={!showCropEditor}
            style={styles.modal}
            contentContainerStyle={{
              height: '100%',
              paddingTop: top,
              backgroundColor: isAstrology
                ? theme.colors.astrologyDeepBlue
                : theme.colors.onWhite100,
              paddingBottom: bottom,
              marginTop: 0,
            }}
            dismissableBackButton
            onDismiss={onCloseMediaPreview}>
            <MainToast />
            <View
              style={{
                height: '100%',
                marginTop: 0,
              }}>
              <Appbar.Header
                statusBarHeight={0}
                elevated={false}
                style={styles.header}
                theme={{
                  colors: {
                    surface: isAstrology
                      ? theme.colors.astrologyDeepBlue
                      : theme.colors.onWhite100,
                  },
                }}>
                <Appbar.BackAction
                  accessibilityLabel="close media preview"
                  onPress={onCloseMediaPreview}
                  color={isAstrology ? '#fff' : ''}
                />
                <TouchableOpacity
                  style={styles.ctaButton}
                  accessibilityLabel="media preview complete"
                  onPress={startLockAspectRation}>
                  <Text style={styles.ctaText}>Next</Text>
                </TouchableOpacity>
              </Appbar.Header>
              <View style={styles.contentContainer}>
                <View
                  style={{
                    margin: 'auto',
                    height: Dimensions.get('window').height * 0.7,
                  }}>
                  <Swiper
                    accessibilityLabel="media preview slider"
                    index={currentIndex}
                    onIndexChanged={setCurrentIndex}
                    loop={false}
                    loadMinimal
                    loadMinimalSize={1}
                    showsPagination={false}
                    style={{
                      height: '90%',
                    }}>
                    {memoizedMediaComponents}
                  </Swiper>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingLeft: 34,
                      overflow: 'hidden',
                      width: Dimensions.get('screen').width,
                    }}>
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                      }}>
                      <Pressable
                        style={{
                          width: 70,
                          height: 68,
                          marginTop: 4,
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}>
                        <MediaUploader
                          totalVideoCountAllowed={totalVideoCountAllowed}
                          totalImageCountAllowed={totalImageCountAllowed}
                          blobData={[
                            ...(preAddedMedia || []),
                            ...(mediaData || []),
                          ].filter(
                            (item, index, self) =>
                              index ===
                              self.findIndex(obj => obj._id === item._id),
                          )}
                          maxFiles={maxFiles}
                          allowedFiles={['image', 'video']}
                          onGetMedia={onUpdateMediaPreview}
                          style={{
                            backgroundColor: '#D9D9D9',
                            flex: 1,
                            width: 70,
                            height: 68,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            variant="bold"
                            style={{color: '#fff', fontSize: 32}}>
                            +
                          </Text>
                        </MediaUploader>
                      </Pressable>
                      <ScrollView horizontal>
                        {previewMemoizedMediaComponents}
                      </ScrollView>
                    </View>
                  </View>
                </View>

                <Pressable
                  accessibilityLabel={'edit image'}
                  style={{
                    marginBottom: 20 + top,
                    borderWidth: 2,
                    borderColor: isAstrology
                      ? theme.colors.astrologylightBlue
                      : theme.colors.primary,
                    borderRadius: 4,
                    height: 40,
                    width: '80%',
                    display: 'flex ',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 6,
                    opacity: mediaData[currentIndex]?.type === 'Image' ? 1 : 0,
                  }}
                  onPress={() => {
                    if (mediaData[currentIndex]?.type === 'Image') {
                      handleImagePress(currentIndex);
                    }
                  }}>
                  <CropRotationIcon color="white" />
                  <Text style={styles.editButton}>Edit Image</Text>
                </Pressable>
              </View>
            </View>
          </ModalPaper>
          {showCropEditor && (
            <ModalPaper
              visible
              style={styles.modal}
              contentContainerStyle={{
                height: '100%',
                paddingTop: top,
                // backgroundColor: isAstrology
                //   ? theme.colors.astrologyDeepBlue
                //   : theme.colors.onWhite100,
                backgroundColor: 'transparent',
                paddingBottom: bottom,
                marginTop: 0,
              }}
              dismissableBackButton
              onDismiss={() => setShowCropEditor(false)}>
              <View style={styles.cropEditorContainer}>
                <CropEditor
                  isEditing={isEditing}
                  mediaUrl={mediaData[currentIndex].originalMedia}
                  onCloseImageEditor={() => setShowCropEditor(false)}
                  onSaveCrop={handleSavedCrop}
                  autoCrop={lockingRatio}
                  autoCropRatio={lastSavedAspectRatio}
                  isAstrology={isAstrology}
                />
              </View>
            </ModalPaper>
          )}
        </Portal>
      </View>
    </ErrorBoundary.Screen>
  );
}

function useCreateStyles(isAstrology) {
  const theme = useTheme();

  return StyleSheet.create({
    parent: {
      flex: 1,
      backgroundColor: theme.colors.onBackground,
    },
    memoizedMedia: {
      height: '100%',
      width: Dimensions.get('screen').width,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
      alignContent: 'space-between',
      alignItems: 'center',
    },
    header: {
      justifyContent: 'space-between',
      paddingRight: 20,
      paddingTop: 0,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    modal: {
      height: '100%',
      marginTop: 0,
      marginBottom: 0,
      backgroundColor: isAstrology
        ? theme.colors.astrologyDeepBlue
        : theme.colors.onWhite100,
    },
    media: {
      width: 280,
      margin: 5,
      resizeMode: 'cover',
      alignItems: 'stretch',
      borderRadius: 8,
      overflow: 'hidden',
    },
    ctaButton: {
      backgroundColor: isAstrology ? '#fff' : theme.colors.primary,
      width: 88,
      height: 33,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      color: isAstrology ? theme.colors.astrologylightBlue : '#fff',
      fontWeight: 'bold',
    },
    editButton: {
      textAlign: 'center',
      color: isAstrology ? 'white' : theme.colors.primary,
      fontWeight: '800',
    },
    cropEditorContainer: {height: '100%'},
    cropCta: {
      backgroundColor: theme.colors.primary,
      padding: 10,
      color: isAstrology ? theme.colors.astrologylightBlue : '#FFF',
      bottom: 0,
    },
    mediaOptionsContainer: {
      display: 'flex',
      flexDirection: 'row',
      height: 60,
      backgroundColor: 'red',
    },
    mediaOption: {
      flex: 1,
    },
  });
}

export default memo(MediaPreview);

MediaPreview.displayName = 'MediaPreview';

MediaPreview.propTypes = {
  mediaData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      mediaUrl: PropTypes.string.isRequired,
      originalMedia: PropTypes.string.isRequired,
      mimeType: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['Image', 'Audio', 'Video']).isRequired,
    }),
  ).isRequired,
  isEditing: PropTypes.bool,
  originalMedia: PropTypes.array,
  selectedRatio: PropTypes.number,
  onAspectRatioChange: PropTypes.func.isRequired,
  onCloseMediaPreview: PropTypes.func.isRequired,
  onSaveMedia: PropTypes.func.isRequired,
  onSavedMediaDataCopy: PropTypes.func.isRequired,
};
