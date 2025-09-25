import React, {useEffect, useState, useRef, useMemo} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableOpacity,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable as RNPressable,
} from 'react-native';
import { Pressable as GesturePressable} from 'react-native-gesture-handler';
import {HelperText, Text, useTheme} from 'react-native-paper';
import {useFormik} from 'formik';
import {
  fetchFamilyMembers,
  resetFamilyMembers,
} from '../../../../store/apps/story';
import * as Yup from 'yup';
import {CrossIcon} from '../../../../images';
import {CustomInput} from '../../../../components';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {DefaultImage} from '../../../../components';
import {setNewWrittenStory} from '../../../../store/apps/story';
import FileUploader from '../../../../common/media-uploader';
import {SCREEN_WIDTH} from '../../../../constants/Screens';
import {VideoThumbnail} from '../../../../core';
import MediaUploaderIcon from '../../../../images/Icons/StoryMediaUploaderIcon';
import AIHelperIcon from '../../../../images/Icons/AIHelperIcon';
import Confirm from '../../../Confirm';
import MentionsInput from './../../../MentionsInput/index';
import MediaPreview from './../../../MediaPreview/index';
import {colors} from '../../../../common/NewTheme';
import {createStoryStyles} from '../styles';
import NewTheme from '../../../../common/NewTheme';
import {useNavigation} from '@react-navigation/native';
import {set} from 'lodash';
import useKeyboardHeight from '../../../../hooks/useKeyboardheight';

export default function StoriesForm({
  formDataRef,
  deletedMediaIds,
  isAuthor,
  status,
  originalAspectRatio = 1,
  isEditing,
  setRatio,
  onValidationChange,
  postingInProgress,
  setOpenOptions,
  setOpenCamera,
  setOpenVideo,
  setOpenGallery,
}) {
  const navigation = useNavigation();
  const theme = useTheme();
  const customTheme = {
    colors: {
      primary: theme.colors.orange,
    },
  };
  const [description, setDescription] = useState('');
  const styles = createStyles();
  const [editorFocus, setEditorFocus] = useState(false);
  const [openCollab, setOpenCollab] = useState(false);
  const [temporarilySavedCollabs, setTemporarilySavedCollabs] = useState([]);
  const [isReEditing, setIsReEditing] = useState(false);
  const [originalMedia, setOriginalMedia] = useState([]);
  const [mediaToPreview, setMediaToPreview] = useState([]);
  const [mediaToPreviewCopy, setMediaToPreviewCopy] = useState([]);
  const [isLifestoryChecked, setIsLifestoryChecked] = useState(
    formDataRef?.current?.isLifestory,
  );
  const [selectedRatio, setSelectedRatio] = useState(originalAspectRatio);
  const [lsFirstTime, setLsFirstTime] = useState(isEditing);
  const [lsPopUpOpen, setLsPopUpOpen] = useState(false);
  const [showList, setShowList] = useState(false);
  const [blobData, setBlobData] = useState([]);
  const [openSaveDrafts, setOpenSaveDrafts] = useState(false);
  const firstTime = useRef(0);
  const [selectedColab, setSelectedColab] = useState([]);
  const [showSelectedColab, setShowSelectedColab] = useState(
    formDataRef?.current?.collaboratingMembers?.length > 0 || false,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const aiStory = useSelector(state => state.story.aiStory);
  const isReRender = useRef(false);
  const scrollParentRef = useRef(null);
  const descriptionBoxRef = useRef(null);
  const keyboardHeight = useKeyboardHeight();
  const groupId = useSelector(state => state.Tree.groupId);

  const Pressable = Platform.OS === 'ios' ? RNPressable : GesturePressable;

  useEffect(() => {
    if (keyboardHeight < 1 && scrollParentRef?.current?.scrollTo) {
      scrollParentRef.current.scrollTo({y: 0, animated: true});
    } else if (keyboardHeight > 0 && scrollParentRef?.current?.scrollTo) {
      descriptionBoxRef.current.measure((_, fy, ___, height) => {
        const scrollToY = fy + height - keyboardHeight + 15;
        scrollParentRef.current.scrollTo({y: scrollToY, animated: true});
      });
    }
  }, [keyboardHeight]);

  const formik = useFormik({
    initialValues: {
      location: '',
      storiesTitle: formDataRef?.current?.storiesTitle || '',
      storyMonth: '',
      storyYear: '',
      storyDay: '',
      description: formDataRef?.current?.description || '',
    },
    validateOnChange: true,
    validationSchema: Yup.object().shape({
      storiesTitle: Yup.string()
        .required('This field is required')
        .max(50, 'Length cannot be more than 50')
        .test('space-check', 'This field is required', val => {
          return !/^\s+$/.test(val);
        }),
      description: Yup.string()
        .required('This field is required')
        .test('space-check', 'This field is required', val => {
          return !/^\s+$/.test(val);
        }),
    }),
  });

  useEffect(() => {
    if (formDataRef?.current?.isLifestory) {
      setIsLifestoryChecked(true);
    } else {
      setIsLifestoryChecked(false);
    }
  }, [formDataRef?.current?.isLifestory]);
  useEffect(() => {
    if (aiStory) {
      formik.setFieldValue('description', aiStory);
      setEditorFocus(true);
    }
  }, [aiStory]);

  //formik.handleChange('description')(storyResult);
  const getFamilyMembers = useSelector(state => state.story.familyMembers);
  const recentlyPublishedBlob = useSelector(
    state => state.story.recentlyPublishedBlob,
  );

  const disabledState = useMemo(() => {
    return postingInProgress || !isAuthor;
  }, [postingInProgress, isAuthor]);

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
  }, [blobData]);

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
    setSelectedColab(formDataRef.current.collaboratingMembers);
  }, []);

  useEffect(() => {
    if (setOpenOptions) {
      setOpenOptions([hangleCameraOpen, hangleGalleryOpen, hangleVideoOpen]);
    }
  }, [setOpenCamera, setOpenGallery, setOpenVideo]);

  useEffect(() => {
    dispatch(
      setNewWrittenStory({
        storiesTitle: formik.values.storiesTitle,
        description: formik.values.description,
      }),
    );
    formDataRef.current.storiesTitle = formik.values.storiesTitle;
    formDataRef.current.description = formik.values.description;
  }, [formik]);

  useEffect(() => {
    if (!isLifestoryChecked || lsFirstTime) {
      return;
    } else {
      setLsFirstTime(false);
      openLifestoryPopUp();
    }
    setLsPopUpOpen(true);
  }, [isLifestoryChecked]);

  useEffect(() => {
    formDataRef.current.blobData = blobData;
  }, [blobData]);

  useEffect(() => {
    dispatch(
      setNewWrittenStory({
        collabsLength: selectedColab?.length,
        collabIds: selectedColab,
      }),
    );
  }, [selectedColab]);

  useEffect(() => {
    if (!recentlyPublishedBlob?.length) {
      return;
    }

    setBlobData(recentlyPublishedBlob);
  }, [recentlyPublishedBlob]);

  useEffect(() => {
    onValidationChange(formik.isValid);
  }, [formik.isValid, formik.values]);

  function unselectCollab(id) {
    formDataRef.current.collaboratingMembers =
      formDataRef.current.collaboratingMembers?.filter?.(
        data => data.collaboratorId !== id,
      );
    setSelectedColab(
      () => selectedColab?.filter?.(data => data._id !== id) || [],
    );
  }

  function selectCollab(d) {
    isReRender.current = true;
    setSearchTerm('');
    const data = formDataRef.current?.collaboratingMembers?.find(
      c => c.collaboratorId === d._id,
    );
    if (typeof data === 'undefined') {
      const allSelected = [...selectedColab, d];
      setSelectedColab(allSelected);
      setShowSelectedColab(true);

      const newCollab = {
        collaboratorId: d._id,
        fullName: d.fullName,
      };

      formDataRef.current.collaboratingMembers = [
        ...(Array.isArray(formDataRef.current.collaboratingMembers)
          ? formDataRef.current.collaboratingMembers
          : []),
        newCollab,
      ];
      setTemporarilySavedCollabs([newCollab]);
    }
    setShowList(false);
  }

  async function searchCollaborators(val) {
    try {
      // if (singleStory?.status === 'Published') return;
      if (val?.length > 1) {
        dispatch(resetFamilyMembers());
        await dispatch(fetchFamilyMembers({name: val, groupId})).unwrap();
      }
      if (val?.length <= 1) {
        dispatch(resetFamilyMembers());
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  const clearSearch = () => {
    setSearchTerm('');
    setShowList(false);
    dispatch(resetFamilyMembers());
  };

  const closeCollabPopUp = () => {
    clearSearch(); // Clear search when closing modal
    setTemporarilySavedCollabs([]);
    setOpenCollab(false);
  };
  const openCollabPopUp = () => {
    // setOpenCollab(true);
    if (firstTime.current > 0 && !status) {
      setOpenCollab(true);
      return;
    }
    firstTime.current += 1;
    setOpenSaveDrafts(true);
  };
  function openLifestoryPopUp() {
    setLsPopUpOpen(true);
    setIsLifestoryChecked(true);
    formDataRef.current.isLifestory = true;
    setLsPopUpOpen(true);
  }
  /**
   * @param {import('../../../../common/media-uploader').Media[]} data
   */
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

  function renderFilePreview(file) {
    return (
      <View style={{position: 'relative'}}>
        <Pressable
          accessibilityLabel="crossIconStory"
          onPress={() => handleRemoveFile(file)}
          style={{
            backgroundColor: 'lightgray',
            position: 'absolute',
            top: -8,
            zIndex: 1000,
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
        </Pressable>
        {file?.type?.toLowerCase() === 'image' && file.mediaUrl ? (
          <Pressable onPress={handleReEdit.bind(null, isEditing)}>
            <Image
              style={{
                zIndex: 1,
                resizeMode: 'cover',
                borderRadius: 8,
                width: SCREEN_WIDTH / 3 - 35,
                aspectRatio: 1,
              }}
              alt={file.type}
              source={{uri: file.mediaUrl}}
            />
          </Pressable>
        ) : (
          <View
            style={{
              borderRadius: 8,
              // subtract the horizontal margin
              width: SCREEN_WIDTH / 3 - 35,
              height: SCREEN_WIDTH / 3 - 35,
              overflow: 'hidden',
            }}>
            <VideoThumbnail
              renderLocalThumbnailIos={true}
              thumbnailUrl={
                file?.thumbnailUrl ? file?.thumbnailUrl : file.mediaUrl
              }
              resize={'cover'}
              src={file.mediaUrl}
              preventPlay={true}
              imuwMediaStyle={{
                width: SCREEN_WIDTH / 3 - 35,
                height: SCREEN_WIDTH / 3 - 35,
              }}
              imuwThumbStyle={{borderRadius: 6, width: '100%', height: '100%'}}
            />
          </View>
        )}
      </View>
    );
  }

  function showListOfCollabs() {
    return (
      <>
        {showList && getFamilyMembers?.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 55,
              width: '100%',
              left: '0%',
              borderWidth: 1,
              backgroundColor: 'white',
              borderRadius: 10,
              borderColor: 'lightgrey',
            }}>
            {getFamilyMembers?.map((familyMember, index) => (
              <View
                key={index}
                style={{
                  borderRadius: 8,
                  zIndex: 100,
                }}>
                <TouchableOpacity
                  accessibilityLabel={'collabDropDown' + index}
                  type="button"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                  onPress={() => {
                    setSearchTerm('');
                    selectCollab(familyMember);
                    Keyboard.dismiss();
                  }}>
                  {typeof familyMember?.personalDetails?.profilepic !==
                    'string' ||
                  familyMember?.personalDetails?.profilepic?.length <= 0 ? (
                    <View style={{padding: 10}}>
                      <DefaultImage
                        fontWeight={700}
                        fontSize={15}
                        borderRadius={50}
                        height={35}
                        width={35}
                        firstName={familyMember?.personalDetails?.name}
                        lastName={familyMember?.personalDetails?.lastname}
                        gender={familyMember?.personalDetails?.gender}
                      />
                    </View>
                  ) : (
                    <View style={{padding: 10}}>
                      <Image
                        style={{
                          height: 35,
                          width: 35,
                          borderRadius: 50,
                        }}
                        source={{
                          uri: familyMember?.personalDetails?.profilepic?.toString(),
                        }}
                      />
                    </View>
                  )}
                  <Text style={{color: 'black', fontSize: 17}}>
                    {familyMember?.fullName}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </>
    );
  }

  function showSelectedCollabs() {
    return (
      <>
        {showSelectedColab && selectedColab?.length > 0 && (
          <View style={{marginHorizontal: 15, marginTop: 20}}>
            {showSelectedColab && selectedColab?.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  borderColor: 'black',
                  flexWrap: 'wrap',
                }}>
                {selectedColab.map((collab, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      borderRadius: 50,
                      gap: 10,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: NewTheme.colors.primaryOrange,
                    }}>
                    {collab?.personalDetails?.profilepic?.length > 0 ? (
                      <View style={{padding: 5}}>
                        <Image
                          style={{
                            height: 35,
                            width: 35,
                            borderRadius: 50,
                          }}
                          source={{
                            uri: collab?.personalDetails?.profilepic,
                          }}
                        />
                      </View>
                    ) : (
                      <View style={{padding: 5}}>
                        <DefaultImage
                          fontWeight={700}
                          fontSize={15}
                          borderRadius={50}
                          height={35}
                          width={35}
                          firstName={collab?.personalDetails?.name}
                          lastName={collab?.personalDetails?.lastname}
                          gender={collab?.personalDetails?.gender}
                        />
                      </View>
                    )}
                    <Text style={{color: theme.colors.pitchBlack}}>
                      {collab?.fullName}
                    </Text>

                    <TouchableOpacity
                      accessibilityLabel={'removeCollab' + index}
                      style={{
                        padding: 10,
                        borderRadius: 50,
                      }}
                      onPress={() => unselectCollab(collab._id)}>
                      <View style={{paddingRight: 5}}>
                        <CrossIcon height={10} width={10} fill={'black'} />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </>
    );
  }

  function collabSearchField() {
    return (
      <>
        <CustomInput
          disabled={selectedColab?.length >= 5}
          onChangeText={async evt => {
            setSearchTerm(evt);
            await searchCollaborators(evt);
            if (!showList && !isReRender.current) {
              setShowList(true);
            }
            isReRender.current = false;
          }}
          defaultValue={searchTerm}
          name="collab"
          accessibilityLabel="collabSearch"
          mode="outlined"
          placeholder="Add Member"
          style={[styles.textInputStyle, {backgroundColor: 'white'}]}
        />
        {showSelectedCollabs()}
        {showListOfCollabs()}
      </>
    );
  }

  const GotoAIHelper = () => {
    navigation.navigate('AIStoryForm');
  };

  return (
    <>
      <ScrollView ref={scrollParentRef} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <View ref={descriptionBoxRef} style={{backgroundColor: 'transparent'}}>
          <CustomInput
            customTheme={customTheme}
            disabled={disabledState}
            maxLength={50}
            value={formik.values.storiesTitle}
            name="title"
            accessibilityLabel="storiesTitle"
            label="Title of Story"
            required
            inputHeight={50.9}
            style={[
              styles.textInputStyle,
              {backgroundColor: 'white', height: 50.9},
              createStoryStyles.inputContainer,
            ]}
            restingLabelStyle={createStoryStyles.titlePadding}
            contentStyle={{
              ...(disabledState
                ? {
                    opacity: 0.5,
                    color: 'rgba(51, 48, 60, 0.3)',
                  }
                : {}),
            }}
            error={
              formik.touched.storiesTitle && Boolean(formik.errors.storiesTitle)
            }
            errorText={formik.errors.storiesTitle}
            onChangeText={text => {
              if (text.length <= 50) {
                if (!formik.touched.storiesTitle) {
                  formik.setFieldTouched('storiesTitle', true, true);
                }
                formik.handleChange('storiesTitle')(text);
              }
            }}
            onBlur={formik.handleBlur('storiesTitle')}
            right={
              <Text
                style={
                  disabledState
                    ? {
                        color: 'rgba(51, 48, 60, 0.3)',
                      }
                    : {}
                }>
                {`${formik.values.storiesTitle.length}/50`}
              </Text>
            }
            rightContentStyles={{
              opacity: disabledState ? 0.5 : 1,
            }}
          />
        </View>
        {/* Title input ends */}
        {/* Description Input */}
        <View
          style={[
            createStoryStyles.inputContainer,
            createStoryStyles.backgroundColor,
          ]}>
          <MentionsInput
            label="Write your story"
            required
            disabled={postingInProgress}
            error={
              Boolean(formik.errors.description) && formik.touched.description
            }
            contentStyle={{
              height: 190,
              borderColor: theme.colors.lightGrey,
              textAlign: 'justify',
              color: theme.colors.text,
            }}
            style={[createStoryStyles.backgroundColor]}
            accessibilityLabel="descriptionBox"
            value={formik.values.description}
            onChangeText={text => {
              if (!formik.touched.description) {
                formik.setFieldTouched('description', true, true);
              }
              formik.handleChange('description')(text);
              setDescription(description);
            }}
            onBlur={formik.handleBlur('description')}
            onFocus={() => {
              setEditorFocus(true);
            }}
            bottomStyles={{
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#FFDBC9',
              flex: 1,
            }}
            bottom={
              <View>
                <TouchableOpacity
                  accessibilityLabel="aiHelperbackbtn"
                  onPress={() => GotoAIHelper()}>
                  <View
                    style={{
                      paddingRight: 5,
                      paddingTop: 5,
                      paddingBottom: 5,
                      width: '100%',
                      backgroundColor: 'rgb(252,240,219)',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    {/* Left section: File Uploader */}
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

                    {/* Right section: AI Helper */}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={{marginRight: -5}}>
                        <AIHelperIcon stroke={colors.primaryOrange} />
                      </View>
                      <Text
                        style={[
                          {textAlign: 'right', fontWeight: 'bold'},
                          styles.headerText,
                        ]}>
                        AI Helper
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
        {formik.touched.description &&
          formik?.errors?.description?.length > 0 && (
            <HelperText
              style={{
                marginHorizontal: 28,
                // Description has a margin-top
                // of top
                marginTop: -20,
                paddingStart: 12,
              }}
              type="error">
              {formik.errors.description}
            </HelperText>
          )}
        <View style={{display: 'flex', flexDirection: 'row', paddingTop: 6}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} />
          {blobData?.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                marginTop: 2,
                marginLeft: 22,
                minWidth: SCREEN_WIDTH,
              }}>
              {blobData.map(file => (
                <View style={{paddingHorizontal: 5}} key={file.mediaUrl}>
                  {renderFilePreview(file)}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Description input ends */}

        {/* collab button */}
        {status !== 'Published' &&
          isAuthor &&
          !formDataRef?.current?.isLifestory && (
            <View style={{padding: 5, marginTop: 15}}>
              <TouchableOpacity
                accessibilityLabel="addCollabButton"
                style={styles.collabButton}
                onPress={openCollabPopUp}>
                <Text style={styles.collabText}>
                  {selectedColab?.length === 0
                    ? 'Add Collaborator'
                    : selectedColab?.length === 1
                      ? '1 Collaborator Selected'
                      : `${selectedColab?.length} Collaborators Selected`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {/* collab dialog box starts */}
        {openCollab && (
          <Confirm
            primaryColor={colors.primaryOrange}
            title={'Add Collaborator'}
            subTitle={
              'People added will have access to make changes to this story'
            }
            discardCtaText={''}
            continueCtaText={'Confirm'}
            components={collabSearchField}
            componentWrapperStyle={{
              position: 'relative',
              zIndex: 100,
            }}
            titleStyle={{fontSize: 20, paddingBottom: 10, paddingTop: 24}}
            subTitleStyle={{fontWeight: '500', paddingBottom: 15}}
            confirmButtonStyle={{
              paddingVertical: 3,
              borderRadius: 8,
              marginHorizontal: 24,
            }}
            confirmButtonLabelStyle={{fontSize: 16, fontWeight: 500}}
            onCrossClick={() => {
              const tempIds = temporarilySavedCollabs.map(
                collab => collab.collaboratorId,
              );
              formDataRef.current.collaboratingMembers =
                formDataRef.current.collaboratingMembers?.filter(
                  collab => !tempIds.includes(collab.collaboratorId),
                );
              setSelectedColab(() =>
                selectedColab.filter(item => !tempIds.includes(item._id)),
              );
              closeCollabPopUp();
            }}
            onContinue={() => closeCollabPopUp()}
            onDiscard={() => undefined}
          />
        )}
        {/* collab dialog box ends */}

        {lsPopUpOpen && (
          <Confirm
            primaryColor={colors.primaryOrange}
            title={
              'This story will also reflect in your lifestory on your Profile page.'
            }
            titleId="add to lifestory popUp title"
            continueId="add to lifestory popUp continue"
            subTitle={''}
            discardCtaText={''}
            continueCtaText={'Got it!'}
            onContinue={() => {
              setLsPopUpOpen(false);
            }}
            onDiscard={() => {
              //
              setLsPopUpOpen(false);
            }}
            onCrossClick={() => setLsPopUpOpen(false)}
          />
        )}

        {/* collab dialog box ends */}

        {openSaveDrafts && (
          <Confirm
            title={'Save to Drafts!'}
            subTitle={
              'Your story will be saved as a draft. Collaborators you have chosen can make edits, and once final changes are made, you can publish it directly from your drafts.'
            }
            discardCtaText={''}
            continueCtaText={'Got it!'}
            onContinue={() => {
              setOpenSaveDrafts(false);
              setOpenCollab(true);
            }}
            onDiscard={() => {
              //
            }}
            onCrossClick={() => setOpenSaveDrafts(false)}
          />
        )}
        {/* <View
        style={{
          padding: 5,
          flexDirection: 'row',
          justifyContent: 'start',
          alignItems: 'start',
          gap: 15,
          marginHorizontal: 20,
          marginTop: 20,
        }}>
        <View style={{marginTop: 7, marginLeft: 20}}>
          <CustomCheckBox
            accessibilityLabel="add to lifestory checkbox"
            check={isLifestoryChecked}
            onCheck={() => {
              if (!formDataRef.current.isLifestory) {
                setLsFirstTime(false);
              }
              setIsLifestoryChecked(!isLifestoryChecked);
              formDataRef.current.isLifestory =
                !formDataRef.current.isLifestory;
            }}
          />
        </View>
        <View>
          <Text
            accessibilityLabel="add to lifestory title"
            style={{color: 'black', fontWeight: 'bold', fontSize: 20}}>
            Add to lifestory
          </Text>
          <Text
            accessibilityLabel="add to lifestory subtitle"
            style={{color: 'black', fontWeight: '500', fontSize: 13}}>
            Add this story to your lifestory as well.
          </Text>
        </View>
      </View> */}
        {mediaToPreview.length > 0 && (
          <MediaPreview
            preAddedMedia={blobData}
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
      </ScrollView>
    </>
  );
}

StoriesForm.propTypes = {
  formDataRef: PropTypes.object,
  isAuthor: PropTypes.bool,
  status: PropTypes.string,
  isEditing: PropTypes.bool,
  postingInProgress: PropTypes.bool,
  onValidationChange: PropTypes.func.isRequired,
};

function createStyles() {
  return StyleSheet.create({
    lifestoryModalCard: {
      gap: 20,
      backgroundColor: 'white',
      width: '85%',
      minHeight: 100,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    additionalContent: {
      marginTop: 10,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      display: 'flex',
      width: 90,
      height: 90,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
      paddingHorizontal: 5,
    },
    LifestoryTitle: {
      marginTop: 25,
      marginHorizontal: 20,
      color: 'black',
      fontSize: 20,
      textAlign: 'center',
      fontWeight: '600',
    },
    ModalTitle: {
      marginTop: 20,
      fontWeight: 'bold',
      color: 'black',
      fontSize: 22,
      textAlign: 'center',
    },
    ModalSubTitle: {
      textAlign: 'center',
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 25,
      color: 'black',
      fontWeight: 400,
    },
    ModalCross: {
      top: -15,
      right: -15,
      position: 'absolute',
      width: 35,
      height: 35,
      backgroundColor: 'white',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ModalCard: {
      position: 'absolute',
      backgroundColor: 'white',
      width: '100%',
      minHeight: 200,
      borderRadius: 10,
    },
    container: {
      position: 'relative',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
      backgroundColor: 'white',
      margin: 12,
      borderWidth: 1,
      borderColor: 'lightgrey',
      borderRadius: 10,

      // padding: 10,
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
      //textAlign: 'center',
      fontWeight: '700',
      color: '#000',
      fontSize: 15,
      marginHorizontal: 10,
    },
    textInputStyle: {
      backgroundColor: '#FFF',
    },
    collabButton: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'white',
      marginHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    collabText: {color: colors.primaryOrange, fontWeight: 'bold', fontSize: 15},
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
  });
}
