import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import PropTypes from 'prop-types';
import {useFormik} from 'formik';
import {SCREEN_WIDTH} from '../../../../constants/Screens';
import FileUploader from '../../../../common/media-uploader';
import {CrossIcon} from '../../../../images';
import {VideoThumbnail} from '../../../../core';
import {useDispatch, useSelector} from 'react-redux';
import {setNewWrittenStory} from '../../../../store/apps/story';
import CustomInput from '../../../CustomTextInput';
import * as Yup from 'yup';
import {createStoryStyles} from '../styles';
import MediaPreview from '../../../MediaPreview';

export default function MomentsForm({
  formDataRef,
  deletedMediaIds,
  setRatio,
  isEditing,
  onValidationChange,
  postingInProgress,
  originalAspectRatio = 1,
  setOpenOptions,
  setOpenCamera,
  setOpenVideo,
  setOpenGallery,
}) {
  const theme = useTheme();
  const customTheme = {
    colors: {
      primary: theme.colors.orange,
    },
  };
  const dispatch = useDispatch();
  const styles = useCreateStyles();

  const formik = useFormik({
    initialValues: {
      location: '',
      storiesTitle: formDataRef.current.storiesTitle || '',
      storyMonth: '',
      storyYear: '',
      storyDay: '',
    },
    validateOnChange: true,
    validationSchema: Yup.object().shape({
      storiesTitle: Yup.string()
        .required('This field is required')
        .max(50, 'Length cannot be more than 50')
        .test('space-check', 'This field is required', val => {
          return !/^\s+$/.test(val);
        }),
    }),
  });
  const [mediaToPreviewCopy, setMediaToPreviewCopy] = useState([]);
  const [blobData, setBlobData] = useState([]);
  const [selectedRatio, setSelectedRatio] = useState(originalAspectRatio);
  const [isReEditing, setIsReEditing] = useState(false);
  const [mediaToPreview, setMediaToPreview] = useState([]);
  const [plusButtonCount, setPlusButtonCount] = useState(9);
  const recentlyPublishedBlob = useSelector(
    state => state.story.recentlyPublishedBlob,
  );

  const uniqueMediaLength = useMemo(() => {
    const combined = [...blobData, ...mediaToPreview];
    const uniqueFiles = new Map();

    combined.forEach(file => {
      if (file._id) {
        uniqueFiles.set(file._id, file);
      }
    });
    return uniqueFiles.size;
  }, [blobData, mediaToPreview]);

  useEffect(() => {
    if (!blobData.length) {
      setSelectedRatio(1);
    }

    const mediaLength = [...blobData]?.length;
    if (mediaLength <= 9) {
      setPlusButtonCount(9 - mediaLength);
    }
    if (mediaLength >= 9) {
      setPlusButtonCount(1);
    }
    if (mediaLength === 9) {
      setPlusButtonCount(0);
    }
  }, [blobData]);

  useEffect(() => {
    onValidationChange(formik.isValid);
  }, [formik.isValid, formik.values]);

  useEffect(() => {
    if (!recentlyPublishedBlob.length) {
      return;
    }

    setBlobData(recentlyPublishedBlob);
  }, [recentlyPublishedBlob]);

  useEffect(() => {
    {
      blobData;
    }
    formDataRef.current.blobData = blobData;
    dispatch(setNewWrittenStory({mediaLength: blobData?.length}));
  }, [blobData]);

  useEffect(() => {
    dispatch(
      setNewWrittenStory({
        storiesTitle: formik.values.storiesTitle,
      }),
    );
    formDataRef.current.storiesTitle = formik.values.storiesTitle;
  }, [formik]);

  /**
   * @param {import('../../../../common/media-uploader').Media[]} data
   */
  function handleSetMediaPreview(data, shouldAppend = false) {
    const allAreVideo = data.every(media => media.type === 'Video');
    data.forEach((_element, index) => {
      //set all the video ids which user is trying to upload

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

  /**
   * @param {import('../../../../common/media-uploader').Media[]} data
   */
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
      setBlobData(prev => {
        const newData = updatedData.filter(
          newFile =>
            !prev.some(existingFile => existingFile._id === newFile._id),
        );
        return [...prev, ...newData];
      });
    } else {
      setBlobData(prev => [...prev, ...updatedData]);
    }
    setIsReEditing(false);
  }

  function handleRemoveFile(file) {
    // remove the id from the state if user removes a video from the list
    const fileIndex = blobData.findIndex(i => i._id === file._id);
    if (fileIndex >= 0) {
      if (file?._id && !file._id.startsWith('local-')) {
        deletedMediaIds.current.push(file._id);
      }

      const newData = blobData.filter(i => i._id !== file._id);
      const newMediaToPreviewCopy = mediaToPreviewCopy.filter(
        i => i._id !== file._id,
      );
      const newMediaToPreview = mediaToPreview.filter(i => i._id !== file._id);

      setBlobData(newData);
      setMediaToPreviewCopy(newMediaToPreviewCopy);
      setMediaToPreview(newMediaToPreview);
    }
  }
  function handleRemovedFromPreview(_id) {
    const updatedBlobData = blobData.filter(b => b._id !== _id);
    const updatedMediaToPreviewCopy = mediaToPreviewCopy.filter(
      media => media._id !== _id,
    );
    const updatedMediaToPreview = mediaToPreview.filter(
      media => media._id !== _id,
    );

    setMediaToPreviewCopy(updatedMediaToPreviewCopy);
    setMediaToPreview(updatedMediaToPreview);
    setBlobData(updatedBlobData);
  }
  function handleReEdit(isEditing) {
    if (isEditing) {
      return;
    }
    setIsReEditing(true);
    setMediaToPreview(mediaToPreviewCopy);
  }
  function handleSaveOriginalCopy(data) {
    const updatedData = [...mediaToPreviewCopy, ...data];

    const uniqueData = Array.from(
      new Map(updatedData.map(item => [item._id, item])).values(),
    );

    setMediaToPreviewCopy(uniqueData);
  }

  function handleCloseMediaPreview() {
    setMediaToPreview([]);
    setIsReEditing(false);
  }

  function handleCloseMediaPreview() {
    setMediaToPreview([]);
    setIsReEditing(false);
  }

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

  function renderFilePreview() {
    return [...blobData, ...Array(plusButtonCount).fill(null)].map(
      (file, index) => {
        return (
          <React.Fragment key={index}>
            {file ? (
              <View style={{position: 'relative'}}>
                <TouchableOpacity
                  accessibilityLabel="crossButton"
                  disabled={postingInProgress}
                  onPress={() => handleRemoveFile(file)}
                  style={{
                    backgroundColor: 'lightgray',
                    position: 'absolute',
                    top: -8,
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
                {file?.type?.toLowerCase() === 'image' ? (
                  <Pressable onPress={handleReEdit.bind(null, isEditing)}>
                    <Image
                      style={[
                        styles.plusBox,
                        {
                          borderRadius: 8,
                          height: SCREEN_WIDTH / 3.8,
                          width: SCREEN_WIDTH / 3.8,
                        },
                      ]}
                      source={{uri: file.mediaUrl}}
                    />
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.plusBox,
                      {
                        borderRadius: 8,
                        height: SCREEN_WIDTH / 3.8,
                        width: SCREEN_WIDTH / 3.8,
                        overflow: 'hidden',
                      },
                    ]}>
                    <VideoThumbnail
                      renderLocalThumbnailIos={true}
                      thumbnailUrl={
                        file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
                      }
                      src={file.mediaUrl}
                      preventPlay={true}
                      resize="cover"
                      imuwMediaStyle={{width: '100%', height: '100%'}}
                      imuwThumbStyle={{borderRadius: 6, width: '100%'}}
                    />
                  </View>
                )}
              </View>
            ) : null}
          </React.Fragment>
        );
      },
    );
  }

  return (
    <>
      {/* Title Input */}
      <View>
        <CustomInput
          customTheme={customTheme}
          accessibilityLabel="moments-title"
          maxLength={50}
          disabled={postingInProgress}
          label="Title of Moment"
          required
          style={[
            styles.textInputStyle,
            {backgroundColor: 'white', height: 50.9},

            createStoryStyles.inputContainer,
          ]}
          onBlur={formik.handleBlur('storiesTitle')}
          error={
            Boolean(formik.errors.storiesTitle) && formik.touched.storiesTitle
          }
          restingLabelStyle={createStoryStyles.titlePadding}
          contentStyle={{
            ...(postingInProgress
              ? {
                  opacity: 0.5,
                  color: 'rgba(51, 48, 60, 0.3)',
                }
              : {}),
          }}
          inputHeight={50.9}
          errorText={formik.errors.storiesTitle}
          right={
            <Text
              style={
                postingInProgress
                  ? {
                      color: 'rgba(51, 48, 60, 0.3)',
                    }
                  : {}
              }>{`${formik.values.storiesTitle.length}/50`}</Text>
          }
          value={formik.values.storiesTitle}
          onChangeText={text => {
            if (text?.length <= 50) {
              if (!formik.touched.storiesTitle) {
                formik.setFieldTouched('storiesTitle', true, true);
              }

              formik.handleChange('storiesTitle')(text);
            }
          }}
          rightContentStyles={{
            opacity: postingInProgress ? 0.5 : 1,
          }}
        />
      </View>
      {blobData.length ? (
        <View style={styles.grid}>{renderFilePreview()}</View>
      ) : (
        <View
          style={{
            borderWidth: 2,
            borderRadius: 10,
            borderColor: '#E77237',
            marginHorizontal: 15,
            marginVertical: 100,
          }}>
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 20,
              color: ' #000000',
              fontWeight: 600,
            }}>
            Add photos or videos to create your moment
          </Text>
        </View>
      )}

      {/* Title input ends */}

      {mediaToPreview.length > 0 && (
        <MediaPreview
          preAddedMedia={blobData}
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
          isEditing={isEditing}
          onRemovedMedia={handleRemovedFromPreview}
          onUpdateMediaPreview={e => handleSetMediaPreview(e, true)}
        />
      )}
      <FileUploader
        setOpenGallery={fn => (openGallery.current = fn)}
        setOpenCamera={fn => (openCamera.current = fn)}
        setOpenVideo={fn => (openVideo.current = fn)}
        totalVideoCountAllowed={1}
        totalImageCountAllowed={9}
        blobData={blobData}
        disabled={postingInProgress}
        allowedFiles={['image', 'video']}
        accessibilityLabel="ImagePicker"
        onGetMedia={e => handleSetMediaPreview(e)}
      />
    </>
  );
}

MomentsForm.propTypes = {
  formDataRef: PropTypes.object,
  onValidationChange: PropTypes.func.isRequired,
  postingInProgress: PropTypes.bool,
};

function useCreateStyles() {
  const theme = useTheme();

  return StyleSheet.create({
    grid: {
      marginLeft: 25,
      gap: 10,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    plusBox: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    plusText: {
      color: theme.colors.orange,
      fontSize: 24,
      textAlign: 'center',
    },

    input: {
      backgroundColor: 'white',
      margin: 12,
      borderWidth: 1,
      borderColor: 'lightgrey',
      borderRadius: 10,

      // padding: 10,
    },
    descriptionInput: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: 'lightgrey',
      borderRadius: 10,
      height: 200,
      marginBottom: 200,
    },
    backgroundContainer: {
      height: 150,
      backgroundColor: '#2DAAFF',
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
    tabButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#FFFFFF',
      padding: 8,
      borderRadius: 7,
    },
    buttonText: {
      fontWeight: 'bold',
      color: 'black',
      fontSize: 15,
      paddingHorizontal: 6,
    },
    tabContainer: {
      alignItems: 'center',
      padding: 10,
    },
    headerText: {
      textAlign: 'center',
      fontWeight: '600',
      color: 'white',
      fontSize: 17,
      marginHorizontal: 20,
    },
    // inputContainer: {
    //   flex: 1,
    // },
    textInputStyle: {
      marginHorizontal: 18,
    },
  });
}
