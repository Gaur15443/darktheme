import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  memo,
  useCallback,
} from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import FileUploader from '../../../common/media-uploader';
import Animated, {SlideInRight, SlideInLeft} from 'react-native-reanimated';
import {useSelector, useDispatch} from 'react-redux';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import {
  AudiosTabIcon,
  MomentsTabIcon,
  QuotesIcon,
  StoriesTabIcon,
} from '../../../images';
import {
  AudiosForm,
  BottomBar,
  CreateStoryHeader,
  CustomCheckBox,
  MomentsForm,
  QuotesForm,
  StoriesForm,
} from '../../../components';

import {setResetFetchAll} from '../../../store/apps/viewChapter';
import {
  fetchOneStory,
  publishStory,
  resetAllPages,
  resetCurrentlyWritten,
  resetNewWrittenStory,
  resetPublishStatus,
  resetRecentlyPublishedBlob,
  resetSelectedQuote,
  resetSingleStory,
  resetViewStories,
  setCurrentlyWritten,
  setLayoutData,
  setNewWrittenStory,
  setRecentlyPublishedBlob,
  setSelectedFeatureTags,
  setSelectedSubgroupTrees,
  setSelectedTrees,
  updateStory,
  setAIStory,
  setLastPublishedMedia,
  resetSelectedCategory,
  setStoryFilters,
  resetFetchAllStories,
} from '../../../store/apps/story';
import {getGroupData} from '../../../store/apps/memberDirectorySlice';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Confirm from '../../Confirm';
import {
  cleanS3Media,
  uploadMedia,
  resetLoaded,
  resetTotal,
} from '../../../store/apps/mediaSlice';
import {getRandomLetters} from '../../../utils';
import {useSocket} from '../../../hooks/useSocket';
import {Button, Text} from 'react-native-paper';
import {Track} from '../../../../App';
import useNativeBackHandler from './../../../hooks/useBackHandler';
import useKeyboardHeight from './../../../hooks/useKeyboardheight';
import DrawerContent from '../BottomSheet/DrawerContent';
import CustomBottomSheet from '../../CustomBottomSheet';
import StoryFlowerIcon from './../../../images/Icons/StoryFlowerIcon/index';
import newTheme from '../../../common/NewTheme';
import Spinner from '../../../common/ButtonSpinner';
import {useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoIcon from '../../../images/Icons/UploadMedia/VideoIcon';
import CameraIcon from '../../../images/Icons/UploadMedia/CameraIcon';
import GalleryIcon from '../../../images/Icons/UploadMedia/GalleryIcon';

const SaveAsDraftButton = memo(
  ({
    currentTabValue,
    styles,
    customTheme,
    disableDraftButton,
    sharedWithLength,
    isSubmittingPublish,
    isSubmittingDraft,
    onPress,
  }) => {
    const theme = useTheme();

    if (currentTabValue !== 0) return null;
    return (
      <Button
        mode="elevated"
        buttonColor={theme.colors.onBackground}
        theme={customTheme}
        disabled={
          disableDraftButton ||
          !sharedWithLength ||
          isSubmittingPublish ||
          isSubmittingDraft
        }
        accessibilityLabel="save as draft"
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.onBackground,
            opacity:
              !sharedWithLength ||
              isSubmittingPublish ||
              isSubmittingDraft ||
              disableDraftButton
                ? 0.5
                : 1,
          },
        ]}
        onPress={onPress}>
        {isSubmittingDraft ? <Spinner /> : 'Save as a draft'}
      </Button>
    );
  },
);

const PublishButton = memo(
  ({
    styles,
    customTheme,
    sharedWithLength,
    isAuthor,
    isSubmittingPublish,
    isSubmittingDraft,
    disablePublishButton,
    onPress,
  }) => {
    return (
      <Button
        style={[
          styles.button,
          {
            backgroundColor: customTheme.colors.primary,
            opacity:
              !sharedWithLength ||
              !isAuthor ||
              isSubmittingPublish ||
              isSubmittingDraft ||
              disablePublishButton
                ? 0.5
                : 1,
          },
        ]}
        accessibilityLabel="publish"
        mode="elevated"
        labelStyle={{color: '#FFF'}}
        onPress={onPress}
        disabled={
          disablePublishButton ||
          !sharedWithLength ||
          !isAuthor ||
          isSubmittingPublish ||
          isSubmittingDraft
        }>
        {isSubmittingPublish ? <Spinner color="white" /> : 'Publish'}
      </Button>
    );
  },
);

const DrawerComponent = memo(
  ({
    pageIsFocused,
    showDrawer,
    isIos,
    bottom,
    currentTabValue,
    isAuthor,
    storyData,
    styles,
    customTheme,
    disableDraftButton,
    sharedWithLength,
    isSubmittingPublish,
    isSubmittingDraft,
    publishPost,
    singleStory,
    formDataRef,
    handleSheetClose,
    isLifestoryChecked,
    toggleLifestory,
    disablePublishButton,
    handleViewSubGroups,
  }) => {
    return (
      <>
        {showDrawer && pageIsFocused ? (
          <CustomBottomSheet
            footerContainerStyles={{padding: 0}}
            BottomSheetFooter={
              <View
                style={{
                  // paddingTop: 10,
                  paddingHorizontal: 24,
                  zIndex: 999,
                  gap: 10,
                  paddingBottom: isIos ? bottom + 70 : 105,
                  backgroundColor: 'white',
                }}>
                {currentTabValue === 0 &&
                  isAuthor &&
                  !storyData?.collabsLength && (
                    <View style={styles.lifestorySection}>
                      <CustomCheckBox
                        accessibilityLabel="lifestoryCheckbox"
                        check={isLifestoryChecked}
                        onCheck={toggleLifestory}
                      />
                      <TouchableOpacity onPress={toggleLifestory}>
                        <Text style={styles.lifestoryTitle}>
                          Add to lifestory
                        </Text>
                        <Text style={styles.lifestorySubtitle}>
                          Add this story to your lifestory as well.
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                <SaveAsDraftButton
                  currentTabValue={currentTabValue}
                  customTheme={customTheme}
                  disableDraftButton={disableDraftButton}
                  sharedWithLength={sharedWithLength}
                  isSubmittingPublish={isSubmittingPublish}
                  isSubmittingDraft={isSubmittingDraft}
                  styles={styles}
                  onPress={publishPost.bind(null, 'Draft')}
                />
                <PublishButton
                  styles={styles}
                  customTheme={customTheme}
                  sharedWithLength={sharedWithLength}
                  isAuthor={isAuthor}
                  isSubmittingPublish={isSubmittingPublish}
                  isSubmittingDraft={isSubmittingDraft}
                  disablePublishButton={disablePublishButton}
                  onPress={publishPost}
                />
              </View>
            }
            // useScrollView
            onClose={handleSheetClose}
            maxDynamicContentSize={650}
            contentStyle={{
              minHeight: 540,
              height: 'auto',
              position: 'relative',
            }}>
            <DrawerContent
              editDate={singleStory?.eventDate}
              bottom={bottom}
              isSubmittingDraft={isSubmittingDraft}
              isSubmittingPublish={isSubmittingPublish}
              isAuthor={isAuthor}
              disablePublishButton={disablePublishButton}
              disableDraftButton={disableDraftButton}
              onViewSubGroups={handleViewSubGroups}
              onPublish={publishPost}
              onDraft={publishPost.bind(null, 'Draft')}
              tab={currentTabValue}
              formDataRef={formDataRef}
            />
          </CustomBottomSheet>
        ) : null}
      </>
    );
  },
);

export default function CreateStory({route}) {
  useNativeBackHandler(handleBack);
  const pageIsFocused = useIsFocused();
  const isIos = Platform.OS === 'ios';
  const styles = createStyles();
  const dispatch = useDispatch();
  const fullHeight = Dimensions.get('screen').height;
  const socket = useSocket();
  const keyboardHeight = useKeyboardHeight();
  const navigator = useNavigation();
  const [currentTabValue, setCurrentTabValue] = useState(
    route?.params?.currentTabValue,
  );
  const theme = useTheme();
  const {bottom} = useSafeAreaInsets();
  const keyboardDenominator = useMemo(() => {
    return Platform.OS === 'android' ? 2.8 : 1;
  }, []);
  const snapPoint = useMemo(() => {
    return [
      (currentTabValue === 0 ? 540 : 440) +
        (keyboardHeight || 1) / keyboardDenominator,
    ];
  }, [keyboardHeight, keyboardDenominator, currentTabValue]);
  const flowerColors = ['#D3E0F8', '#F1D98E', '#A5F1B1', '#FFC7C3'];
  const [oldTaggedFeature, setOldTaggedFeature] = useState([]);
  const [dateOpen, setDateOpen] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [Wrapper, setWrapper] = useState(ScrollView);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Publishing...');
  const [slideRight, setSlideRight] = useState(false);
  const [isSubmittingPublish, setIsSubmittingPublish] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discardPopUp, setDiscardPopUp] = useState(false);
  const [newValue, setNewValue] = useState(0);
  const [discardPopUpForTabChange, setDiscardPopUpForTabChange] =
    useState(false);
  const [validations, setValidations] = useState([]);
  const [everyoneLength, setEveryoneLength] = useState(0);
  const [oldTags, setOldTags] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const [openingLocation, setOpeningLocation] = useState(false);
  const [disableDraftButton, setShouldDisableDraftButton] = useState(false);
  const [disablePublishButton, setShouldDisablePublishButton] = useState(true);

  const names = ['Stories', 'Moments', 'Audios', 'Quotes'];
  const collabModeId = '606ee801e66b6884b2e11c16';
  const soloModeId = '606ee92ce66b6884b2e1eefe';
  const headerTitle = [
    "Share your family's rich history through the power of words.",
    "Preserve visual memories with photos, videos, and documents that tell your family's unique story.",
    "Bring your ancestors' voices to life with captivating narrations and recordings.",
    'Capture cherished family memories and humorous tales to pass down through generations.',
  ];
  const deletedMediaIds = useRef([]);
  const mediaIds = useRef([]);
  const pageElements = useRef([]);
  const postDataRef = useRef({});
  const lastPublishedRef = useRef([]);
  const formDataRef = useRef({
    storiesTitle: '',
    eventDate: Date.now(),
    mode: '',
    collaboratingMembers: [],
    location: '',
    storyMonth: '',
    storyYear: '',
    storyDay: '',
    description: '',
    isLifestory: false,
    blobData: [],
  });
  const currentlyWritten = useSelector(state => state.story.currentlyWritten);
  const uploadPrecentage = useSelector(state => state.media.uploadPrecentage);
  const loaded = useSelector(state => state.media.loaded);
  const total = useSelector(state => state.media.total);
  const getSelectedFamilySubGroups = useSelector(
    state => state.story.currentlyWritten?.familySubGroupId,
  );
  const groupOwnerId = useSelector(state => state.Tree.groupId);
  const progressBar = useRef(0);
  const [lsFirstTime, setLsFirstTime] = useState(editStoryId ? true : false);
  const [isLifestoryChecked, setIsLifestoryChecked] = useState(
    !!formDataRef?.current?.isLifestory,
  );
  const openOptions = useRef({
    1: () => undefined,
    2: () => undefined,
    3: () => undefined,
  });
  const [bottomDrawerHeight, setBottomDrawerheight] = useState(0);

  useEffect(() => {
    if (!!formDataRef?.current?.isLifestory) {
      setIsLifestoryChecked(true);
    }
  }, [formDataRef?.current?.isLifestory]);
  const customTheme = {
    colors: {
      primary: theme.colors.orange,
    },
  };

  useEffect(() => {
    if (Math.floor((loaded / total) * 100) / 100 === 1) {
    }
    progressBar.current =
      (Math.floor((loaded / total) * 100) / 100).toString() === 'NaN'
        ? 0
        : Math.floor((loaded / total) * 100);
  }, [uploadPrecentage, loaded, total]);

  useEffect(() => {
    const unsubscribe = navigator.addListener('beforeRemove', () => {
      dispatch(resetSelectedQuote());
    });

    return unsubscribe;
  }, [navigator]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShown(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const singleStory = useSelector(state => state.story.singleStory);
  const editStoryId = route.params._id;
  const userId = useSelector(state => state?.userInfo?._id);
  const userData = useSelector(state => state?.userInfo);
  const storyData = useSelector(state => state.story.newWrittenStory);
  const getSelectedFamilyGroups = useSelector(state => state.Tree.groupId);
  const groupList = useSelector(
    state => state?.memberDirectory?.memberGroupDetails,
  );

  const postingInProgress = useMemo(() => {
    return isSubmittingPublish || isSubmittingDraft;
  }, [isSubmittingPublish, isSubmittingDraft]);

  //below code runs for edit story
  useEffect(() => {
    try {
      if (!editStoryId) {
        return;
      }
      setLoading(true);
      const groups = [];
      fetchEditStory(editStoryId);
      if (singleStory) {
        //setting collab mode or solo mode
        formDataRef.current.mode =
          singleStory.collaboratingMembers?.length > 0
            ? collabModeId
            : soloModeId;

        const collabArray = [];

        setAspectRatio(() => singleStory?.aspectRatio || 1);

        if (singleStory?.collaboratingMembers?.length > 0) {
          singleStory?.collaboratingMembers?.forEach(collab => {
            collabArray.push({
              _id: collab?.collaboratorId?._id,
              collaboratorId: collab?.collaboratorId?._id,
              fullName:
                collab.collaboratorId?.personalDetails?.name +
                ' ' +
                collab.collaboratorId?.personalDetails?.lastname,
              personalDetails: collab.collaboratorId?.personalDetails,
            });
          });
        }

        const savedText = singleStory?.contents?.[0]?.templateContent || '';
        const _oldFeatureTags = singleStory?.featureTags || [];

        dispatch(setSelectedFeatureTags(singleStory?.featureTags || []));

        setOldTaggedFeature(_oldFeatureTags);

        let _oldTags = savedText.match(/(imeuswe:(\w+))/gm) || [];

        if (_oldTags.length) {
          _oldTags = Array.from(new Set(_oldTags));

          const ids = _oldTags.map(id => id.split('imeuswe:')[1]);
          _oldTags = ids;
        }

        setOldTags(_oldTags);

        //assigning event date title and description
        formDataRef.current.eventDate = singleStory?.eventDate;
        // currently lifestory is saving location in object
        formDataRef.current.location =
          typeof singleStory?.location?.formatted_address === 'string'
            ? singleStory?.location?.formatted_address
            : typeof singleStory?.location === 'string'
              ? singleStory?.location
              : '';

        formDataRef.current.description =
          singleStory?.contents?.[0]?.templateContent;
        formDataRef.current.storiesTitle = singleStory?.storiesTitle;
        formDataRef.current.collaboratingMembers = collabArray;

        //finding the story belongs to sub groups or families and updating the selection
        if (singleStory?.familyGroupId?.length > 0) {
          // if (isSubgroup(singleStory?.familyGroupId)) {
          //   singleStory?.familyGroupId?.forEach(subGroup => {
          //     groups?.push(subGroup?._id);
          //     dispatch(setSelectedSubgroupTrees(subGroup?._id));
          //   });
          // } else {
          singleStory?.familyGroupId?.forEach(families => {
            groups?.push(families?._id);
            dispatch(setSelectedTrees(families?._id));
          });
          // }
        }

        if (singleStory?.contents?.[0]?.elements?.length > 0) {
          const arr = [];
          singleStory?.contents?.[0]?.elements?.forEach(media => {
            arr.push(media);
          });
          dispatch(setRecentlyPublishedBlob(arr));
        }

        formDataRef.current.isLifestory = !singleStory?.isEvent ? false : true;

        dispatch(
          setNewWrittenStory({
            storiesTitle: singleStory?.storiesTitle,
            description: singleStory?.contents?.[0]?.templateContent,
            EventDate: formDataRef?.current?.eventDate,
            location: formDataRef?.current?.location,
            collabsLength: collabArray?.length,
          }),
        );

        dispatch(
          setCurrentlyWritten({
            familyGroupId: Array.isArray(groupOwnerId)
              ? groupOwnerId
              : [String(groupOwnerId)] || [],
            mediaIds: mediaIds?.current || [],
            CD_Flag: 1, //its always one as we are using date picker
            contentType: 'SP',
            // tagUserId: allTags,
            // newlytagged,
            categoryId: [singleStory?.categoryId?.[0]._id],
            ...formDataRef.current,
          }),
        );
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [editStoryId]);

  useEffect(() => {
    if (discardPopUp || discardPopUpForTabChange) {
      Keyboard.dismiss();
    }
  }, [discardPopUp, discardPopUpForTabChange]);

  useEffect(() => {
    dispatch(resetSelectedQuote());
    if (currentTabValue === 3 || currentTabValue === 2) {
      setWrapper(View);
    } else {
      setWrapper(ScrollView);
    }
    if (!editStoryId) {
      dispatch(
        setNewWrittenStory({
          storiesTitle: '',
          description: '',
        }),
      );
    }
    if (
      !editStoryId &&
      groupList?.length &&
      (!currentlyWritten?.familyGroupId?.length ||
        !currentlyWritten?.familySubGroupId?.length)
    ) {
      groupList.forEach(family => {
        dispatch(setSelectedTrees(family?._id));
      });
      setEveryoneLength(groupList?.length);
    }

    return () => {
      if (!editStoryId) {
        dispatch(
          setNewWrittenStory({
            storiesTitle: '',
            description: '',
          }),
        );
      }
    };
  }, [currentTabValue]);

  useEffect(() => {
    try {
      setSlideRight(true);
      if (!editStoryId) {
        let everyone = [];
        (async () => {
          everyone = await dispatch(getGroupData()).unwrap();
          everyone.forEach(family => {
            dispatch(setSelectedTrees(family?._id));
          });
          setEveryoneLength(everyone?.length);
        })();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
    return () => {
      deletedMediaIds.current = [];
      dispatch(resetLoaded());
      dispatch(resetTotal());
      dispatch(resetSingleStory());
      dispatch(resetRecentlyPublishedBlob());
      dispatch(resetNewWrittenStory());
    };
  }, []);

  const isAuthor = useMemo(() => {
    if (!Object.keys(singleStory)?.length > 0) {
      return true;
    }
    if (!userId || !editStoryId) {
      return true;
    }
    return editStoryId && userId === singleStory.userId;
  }, [userId, singleStory, editStoryId]);

  async function fetchEditStory(id) {
    setLoadingMessage('Loading...');
    if (singleStory?._id === id) {
      return;
    }
    await dispatch(fetchOneStory(id)).unwrap();
  }

  function isSubgroup(group) {
    if (group[0].groupType.groupType1 !== 'PU') {
      return true;
    }
    return false;
  }

  const handleTabChange = tabValue => {
    if (postingInProgress) {
      return;
    }
    if (currentTabValue > tabValue) {
      setSlideRight(false);
    } else {
      setSlideRight(true);
    }
    if (
      recordingInProgress ||
      storyData.collabsLength !== 0 ||
      storyData.description !== '' ||
      storyData.location !== '' ||
      storyData.storiesTitle !== '' ||
      // groupList.length !== everyoneLength ||
      formDataRef.current?.blobData?.length > 0
    ) {
      setDiscardPopUpForTabChange(true);
      setNewValue(tabValue);
    } else {
      deletedMediaIds.current = [];
      setCurrentTabValue(tabValue);
      resetFormData();
      dispatch(resetRecentlyPublishedBlob());
      dispatch(resetSingleStory());
      dispatch(resetCurrentlyWritten());
      dispatch(resetNewWrittenStory());
    }
  };

  async function upload(data) {
    try {
      let newMediaCount = 0;
      const mediaFormData = new FormData();
      let response;

      // Reset the arrays that will store all uploaded media data
      lastPublishedRef.current = [];
      pageElements.current = [];
      mediaIds.current = [];

      // Collect all media that needs to be uploaded
      formDataRef?.current?.blobData?.forEach?.(_data => {
        if (!_data?.createdAt) {
          newMediaCount += 1;
          const fileName = getRandomLetters();
          mediaFormData.append('image', {
            uri: _data?.mediaUrl,
            name: fileName,
            type: _data?.mimeType,
          });
        }
      });

      if (newMediaCount > 0) {
        // Get all new media items that need to be uploaded
        const publishedMedia = formDataRef.current.blobData.filter(
          media => !media?.createdAt,
        );

        for (let i = 0; i < newMediaCount; i = i + 2) {
          const chunkFormData = new FormData();
          chunkFormData.append('image', mediaFormData?.getAll?.('image')?.[i]);
          chunkFormData.append(
            'image',
            mediaFormData?.getAll?.('image')?.[i + 1],
          );

          if (data.length > 0) {
            chunkFormData.append('groupId', JSON.stringify([]));
            chunkFormData.append('status', 'Draft');
          }
          const payload = {
            id: userId,
            formData: chunkFormData,
          };

          response = await dispatch(uploadMedia(payload));

          if (Array.isArray(response?.payload?.data)) {
            // Map the response data to the correct format and append to existing arrays
            const newLastPublished = response.payload.data.map(
              (_data, index) => {
                const currentIndex = i + index;
                const objectUrl = publishedMedia[currentIndex]?.mediaUrl;
                return {
                  mediaId: _data._id,
                  mediaUrl: objectUrl,
                  thumbnailUrl: objectUrl,
                  type: _data.urlType,
                };
              },
            );

            const newPageElements = response.payload.data.map(_data => ({
              mediaId: _data._id,
              mediaUrl: _data.mediaUrl,
              type: _data.urlType,
            }));

            // Append new data to existing arrays
            lastPublishedRef.current = [
              ...lastPublishedRef.current,
              ...newLastPublished,
            ];

            pageElements.current = [
              ...pageElements.current,
              ...newPageElements,
            ];

            mediaIds.current = [
              ...mediaIds.current,
              ...response.payload.data.map(res => res._id),
            ];
          }
        }
      }

      // Remove local blob data from array
      formDataRef.current.blobData = formDataRef.current.blobData.filter(
        media => !media?._id?.startsWith('local'),
      );
    } catch (error) {
      if (error.response && error.response.status === 503) {
        throw new Error('Unable to upload. Please try again.');
      } else {
        throw new Error(error.message);
      }
    }
  }

  function filterNewGroupIds(oldGroups, newGroups) {
    const setA = new Set(oldGroups);
    return newGroups.filter(item => !setA.has(item));
  }

  /**
   * Publishes new/edit story, moments, audios and quotes.
   * @param {('Published'|'Draft')} status
   */
  const publishPost = useCallback(
    async (status = 'Published') => {
      AsyncStorage.removeItem('AIStory');
      dispatch(resetSelectedCategory());
      let storyType = 'stories';
      if (status !== 'Published' && status !== 'Draft') {
        status = 'Published';
      }
      // setLoading(true);
      if (status === 'Published') {
        setIsSubmittingPublish(true);
        setLoadingMessage('Publishing...');
      } else {
        setIsSubmittingDraft(true);
        setLoadingMessage('Saving as draft...');
      }
      // setPosting(true);
      const categoryArray = [];
      if (currentTabValue === 1) {
        // for moments
        storyType = 'moment';
        categoryArray.push('6579c44617e904513c45aa1b');
      }
      // audio
      else if (currentTabValue === 2) {
        storyType = 'audio';
        categoryArray.push('65ae0ed9820f7c7a926fd4c7');
      } else if (currentTabValue === 3) {
        storyType = 'quotes';
        categoryArray.push('6582f9baec963cbaeab490b5');
      } else {
        categoryArray.push('606ee362e66b6884b2ddccf6');
      }

      try {
        let markdownText = formDataRef.current.description;

        let allTags = markdownText.match(/(imeuswe:(\w+))/gm) || [];
        const allFeatureTags = currentlyWritten?.featureTags || [];

        let newlytagged = [];
        let newlytaggedFeature = [];

        newlytaggedFeature = allFeatureTags.filter(
          tag => !oldTaggedFeature.includes(tag),
        );

        if (editStoryId) {
          formDataRef.current.newlyTaggedFeature = newlytaggedFeature;
        }

        if (allTags?.length && !editStoryId) {
          allTags = Array.from(new Set(allTags));

          const ids = allTags.map(id => id.split('imeuswe:')[1]);
          allTags = ids;
        } else if (allTags?.length && editStoryId) {
          allTags = Array.from(new Set(allTags));

          const ids = allTags.map(id => id.split('imeuswe:')[1]);
          allTags = ids;

          newlytagged = allTags.filter(tag => !oldTags.includes(tag));
        }

        const savedDate = new Date(formDataRef?.current?.eventDate);

        const result = savedDate; //change this in future for ISO date conversion
        // const result = setDateInDefaultTimezone(_year, _month, _day);

        formDataRef.current.eventDate = result;

        formDataRef.current.mode =
          formDataRef.current.collaboratingMembers?.length > 0
            ? collabModeId
            : soloModeId;

        dispatch(resetPublishStatus());
        //-------below is for media-------
        if (formDataRef?.current?.blobData?.length > 0) {
          await upload(getSelectedFamilyGroups);
        }

        // here note that
        // -> formDataRef.current.blobData - this contains old media which user has already posted
        // -> pageElements.current - this contains new media which user newly posted
        const finalMedia = [
          ...formDataRef.current.blobData,
          ...pageElements.current,
        ].map(({originalMedia, ...media}) => media);

        const elements = finalMedia?.length ? finalMedia : [];

        postDataRef.current = {
          ...postDataRef.current,
          templateContent: markdownText,
          elements,
        };

        dispatch(setLayoutData([postDataRef.current]));

        const groups = currentlyWritten?.familyGroupId?.length
          ? currentlyWritten?.familyGroupId
          : currentlyWritten?.familySubGroupId;

        const newGroups = filterNewGroupIds(
          singleStory?.familyGroupId || [],
          groups || [],
        );

        const updatedCurrentlyWrittenProperties = {
          familyGroupId: Array.isArray(groupOwnerId)
            ? groupOwnerId
            : [String(groupOwnerId)] || [],
          mediaIds: mediaIds.current,
          CD_Flag: 1,
          contentType: 'SP',
          tagUserId: allTags,
          newlytagged,
          categoryId: categoryArray,
          ...formDataRef.current,
        };

        if (singleStory?._id || currentlyWritten?._id) {
          updatedCurrentlyWrittenProperties.olderFamilyGroupId =
            singleStory?.familyGroupId?.map(_group => _group._id) || [];
        }

        dispatch(setCurrentlyWritten(updatedCurrentlyWrittenProperties));

        let payload = {};
        let publishedResult = null;

        // if lifestory is checked then below condition runs
        // -> add event title
        // -> add description
        // -> make is event true
        if (formDataRef.current.isLifestory) {
          dispatch(setResetFetchAll(userId));
          const obj = {
            description: markdownText,
            isEvent: true,
            EventTitle: formDataRef?.current?.storiesTitle,
          };
          payload = {
            status,
            ...obj,
          };
        } else {
          payload = {
            status,
          };
        }
        if (editStoryId) {
          payload = {
            status,
            storyId: editStoryId,
          };
          if (formDataRef.current.isLifestory) {
            const obj = {
              description: markdownText,
              isEvent: true,
              EventTitle: formDataRef?.current?.storiesTitle,
            };
            payload = {
              status,
              storyId: editStoryId,
              ...obj,
            };
          } else {
            const obj = {
              isEvent: false,
            };
            payload = {
              status,
              storyId: editStoryId,
              ...obj,
            };
          }
          dispatch(resetFetchAllStories(groupOwnerId));
          publishedResult = await dispatch(
            updateStory({...payload, aspectRatio}),
          ).unwrap();
          dispatch(setAIStory(''));
        } else {
          publishedResult = await dispatch(
            publishStory({...payload, aspectRatio}),
          ).unwrap();
          dispatch(setAIStory(''));
        }
        if (status === 'Published') {
          dispatch(setStoryFilters('allPosts'));
        } else {
          dispatch(setStoryFilters('drafts'));
        }
        dispatch(resetFetchAllStories(groupOwnerId));
        if (lastPublishedRef.current.length) {
          dispatch(
            setLastPublishedMedia([
              {
                media: lastPublishedRef.current,
                storyId: publishedResult._id,
              },
            ]),
          );
        } else {
          dispatch(setLastPublishedMedia([]));
        }

        const props = {
          story_type: storyType,
        };

        if (status === 'Published') {
          Track({
            cleverTapEvent: 'published_story',
            mixpanelEvent: 'published_story',
            userData,
            cleverTapProps: props,
            mixpanelProps: props,
          });
        } else {
          /* customer io and mixpanel event chagnes  start */
          Track({
            cleverTapEvent: 'saved_draft',
            mixpanelEvent: 'saved_draft',
            userData,
            cleverTapProps: props,
            mixpanelProps: props,
          });
        }

        if (deletedMediaIds.current?.length > 0) {
          deletedMediaIds.current.forEach(mediaId => {
            const deletePayload = {
              userId,
              mediaId,
            };
            dispatch(cleanS3Media(deletePayload));
          });
        }

        /* customer io and mixpanel event chagnes  end */

        const dataSocket1 = {
          name: 'abc',
        };
        socket.allStories?.emit?.(
          'refresh_story_after_creation_event',
          dataSocket1,
        );
        const dataSocket = {
          data: 'abc',
        };
        socket.createStorySocket?.emit?.(
          'read_after_creating_notification_event',
          dataSocket,
        );
        resetFormData();
        dispatch(setResetFetchAll(userId));
        dispatch(resetViewStories());
        dispatch(resetAllPages());
        dispatch(resetSingleStory());
        dispatch(resetRecentlyPublishedBlob());
        dispatch(resetCurrentlyWritten());
        dispatch(resetNewWrittenStory());
        dispatch(resetSingleStory());
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      } finally {
        setLoading(false);
        setIsSubmittingDraft(false);
        setIsSubmittingPublish(false);
        // Set filter: All Post Category: Draft array to draft in Store
        navigator.navigate('Stories', {
          params: {posted: true, fromDraft: status !== 'Published'},
        });
      }
    },
    [
      dispatch,
      currentTabValue,
      editStoryId,
      formDataRef,
      getSelectedFamilyGroups,
      navigator,
      oldTaggedFeature,
      oldTags,
      collabModeId,
      soloModeId,
      singleStory,
      currentlyWritten,
      mediaIds,
      pageElements,
      lastPublishedRef,
    ],
  );

  function handleBack() {
    if (!editStoryId) {
      if (
        recordingInProgress ||
        storyData.collabsLength !== 0 ||
        storyData.description !== '' ||
        storyData.location !== '' ||
        storyData.storiesTitle !== '' ||
        // groupList.length !== everyoneLength ||
        formDataRef.current?.blobData?.length > 0
      ) {
        setDiscardPopUp(true);
        return;
      }
      setDiscardPopUp(false);
      navigator.goBack();
      resetFormData();
      dispatch(resetRecentlyPublishedBlob());
      dispatch(resetCurrentlyWritten());
      return;
    } else {
      setDiscardPopUp(true);
    }
  }

  function resetFormData() {
    formDataRef.current.storiesTitle = '';
    formDataRef.current.eventDate = Date.now();
    formDataRef.current.mode = '';
    formDataRef.current.collaboratingMembers = [];
    formDataRef.current.location = '';
    formDataRef.current.storyMonth = '';
    formDataRef.current.storyYear = '';
    formDataRef.current.storyDay = '';
    formDataRef.current.description = '';
    formDataRef.current.isLifestory = false;
    formDataRef.current.blobData = [];
  }

  const handleViewSubGroups = useCallback(() => {
    setShowDrawer(false);
    navigator.navigate('ManageGroups');
  }, []);

  function handleAspectRatioChange(number) {
    setAspectRatio(number);
  }

  const sharedWithLength = useMemo(() => {
    return (
      getSelectedFamilyGroups?.length || getSelectedFamilySubGroups?.length || 0
    );
  }, [getSelectedFamilyGroups, getSelectedFamilySubGroups]);

  function toggleLifestory() {
    if (!formDataRef?.current?.isLifestory) {
      setLsFirstTime(false);
    }
    setIsLifestoryChecked(!isLifestoryChecked);
    formDataRef.current.isLifestory = !formDataRef.current.isLifestory;
  }

  const handleSheetClose = useCallback(() => {
    if (keyboardHeight > 0) {
      return;
    }
    setShowDrawer(false);
  }, [keyboardHeight]);

  function mediaPress(num) {
    openOptions?.current?.[num]?.();
  }

  return (
    <>
      <CreateStoryHeader onBack={handleBack} tabValue={currentTabValue} />
      {!loading && (
        <SafeAreaView
          style={{
            flex: 1,
            zIndex: 10,
            position: 'relative',
            paddingTop: editStoryId ? 15 : 0,
          }}>
          {discardPopUp === true && (
            <Confirm
              primaryColor={newTheme.colors.primaryOrange}
              title={'Are you sure you want to leave?'}
              subTitle={'If you discard, you will lose your changes.'}
              discardCtaText={'Discard'}
              continueCtaText={'Continue Editing'}
              onContinue={() => setDiscardPopUp(false)}
              onDiscard={() => {
                navigator.goBack();
                resetFormData();
                dispatch(resetSingleStory());
                dispatch(resetNewWrittenStory());
                setRecordingInProgress(false);
                dispatch(resetCurrentlyWritten());
                dispatch(setAIStory(''));
                dispatch(resetRecentlyPublishedBlob());
                dispatch(resetSelectedCategory());
                AsyncStorage.removeItem('AIStory');
              }}
              onBackgroundClick={() => setDiscardPopUp(false)}
              onCrossClick={() => setDiscardPopUp(false)}
            />
          )}
          {discardPopUpForTabChange === true && (
            <Confirm
              primaryColor={newTheme.colors.primaryOrange}
              title={'Are you sure you want to leave?'}
              subTitle={'If you discard, you will lose your changes.'}
              discardCtaText={'Discard'}
              continueCtaText={'Continue Editing'}
              onContinue={() => setDiscardPopUpForTabChange(false)}
              onDiscard={() => {
                setDiscardPopUpForTabChange(false);
                setCurrentTabValue(newValue);
                setRecordingInProgress(false);
                resetFormData();
                dispatch(resetCurrentlyWritten());
                dispatch(resetRecentlyPublishedBlob());
                dispatch(setAIStory(''));
                setValidations([]);
                dispatch(resetSelectedCategory());
              }}
              onCrossClick={() => setDiscardPopUpForTabChange(false)}
            />
          )}

          <View>
            <Wrapper
              scrollEnabled={currentTabValue !== 2 || currentTabValue !== 3}
              keyboardShouldPersistTaps="always">
              {/* Buttons starts here */}
              {!editStoryId && (
                <View style={styles.tabContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      borderColor: '#E77237',
                      borderWidth: 2,
                      borderRadius: 8,
                      paddingHorizontal: 6,
                      paddingVertical: 7,
                      backgroundColor: '#fff',
                    }}>
                    <TouchableOpacity
                      disabled={postingInProgress || currentTabValue === 0}
                      accessibilityLabel="storiesTabButton"
                      style={[
                        styles.tabButtons,
                        currentTabValue === 0 && styles.activeTab,
                      ]}
                      onPress={() => handleTabChange(0)}>
                      <StoriesTabIcon />
                      {currentTabValue === 0 && (
                        <Text style={styles.buttonText}>{names[0]}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={postingInProgress || currentTabValue === 1}
                      accessibilityLabel="momentsTabButton"
                      style={[
                        styles.tabButtons,
                        currentTabValue === 1 && styles.activeTab,
                      ]}
                      onPress={() => handleTabChange(1)}>
                      <MomentsTabIcon />
                      {currentTabValue === 1 && (
                        <Text style={styles.buttonText}>{names[1]}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={postingInProgress || currentTabValue === 2}
                      accessibilityLabel="audiosTabButton"
                      style={[
                        styles.tabButtons,
                        currentTabValue === 2 && styles.activeTab,
                      ]}
                      onPress={() => handleTabChange(2)}>
                      <AudiosTabIcon />
                      {currentTabValue === 2 && (
                        <Text style={styles.buttonText}>{names[2]}</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={postingInProgress || currentTabValue === 3}
                      accessibilityLabel="quotesTabButton"
                      style={[
                        styles.tabButtons,
                        currentTabValue === 3 && styles.activeTab,
                      ]}
                      onPress={() => handleTabChange(3)}>
                      <QuotesIcon stroke="#FF4F4F" strokeWidth={1.5} />
                      {currentTabValue === 3 && (
                        <Text style={styles.buttonText}>{names[3]}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {/* Buttons ends here */}
              {/* Header Text  */}
              {!editStoryId && (
                <View>
                  <Text variant="bold" style={styles.headerText}>
                    {headerTitle[currentTabValue]}
                  </Text>
                </View>
              )}
              {/* Header text ends */}

              {/* Form Components */}
              <View
                style={{
                  marginBottom:
                    currentTabValue === 0 || currentTabValue === 1 ? 150 : 50,
                }}>
                {currentTabValue === 0 && (
                  <Animated.View
                    entering={
                      slideRight === true
                        ? SlideInRight.duration(250).damping(20)
                        : SlideInLeft.duration(250).damping(20)
                    }>
                    <StoriesForm
                      setOpenOptions={arr => {
                        arr.forEach((fn, index) => {
                          openOptions.current[index + 1] = fn;
                        });
                      }}
                      status={singleStory?.status}
                      isAuthor={isAuthor}
                      formDataRef={formDataRef}
                      deletedMediaIds={deletedMediaIds}
                      isEditing={editStoryId ? true : false}
                      postingInProgress={postingInProgress}
                      onValidationChange={event => {
                        const values = [...validations];
                        values[0] = event;
                        setValidations(values);
                      }}
                      originalAspectRatio={aspectRatio}
                      setRatio={handleAspectRatioChange}
                    />
                  </Animated.View>
                )}
                {currentTabValue === 1 && (
                  <Animated.View
                    entering={
                      slideRight === true
                        ? SlideInRight.duration(250).damping(20)
                        : SlideInLeft.duration(250).damping(20)
                    }>
                    <MomentsForm
                      setOpenOptions={arr => {
                        arr.forEach((fn, index) => {
                          openOptions.current[index + 1] = fn;
                        });
                      }}
                      deletedMediaIds={deletedMediaIds}
                      formDataRef={formDataRef}
                      postingInProgress={postingInProgress}
                      onValidationChange={event => {
                        const values = [...validations];
                        values[1] = event;
                        setValidations(values);
                      }}
                      isEditing={editStoryId ? true : false}
                      originalAspectRatio={aspectRatio}
                      setRatio={handleAspectRatioChange}
                    />
                  </Animated.View>
                )}
                {currentTabValue === 2 && (
                  <Animated.View
                    entering={
                      slideRight === true
                        ? SlideInRight.duration(250).damping(20)
                        : SlideInLeft.duration(250).damping(20)
                    }>
                    <AudiosForm
                      deletedMediaIds={deletedMediaIds}
                      formDataRef={formDataRef}
                      onRecording={setRecordingInProgress}
                      postingInProgress={postingInProgress}
                      onValidationChange={event => {
                        const values = [...validations];
                        values[2] = event;
                        setValidations(values);
                      }}
                    />
                  </Animated.View>
                )}
                {currentTabValue === 3 && (
                  <Animated.View
                    entering={
                      slideRight === true
                        ? SlideInRight.duration(250).damping(20)
                        : SlideInLeft.duration(250).damping(20)
                    }>
                    <QuotesForm
                      postingInProgress={postingInProgress}
                      formDataRef={formDataRef}
                      onValidationChange={event => {
                        const values = [...validations];
                        values[3] = event;
                        setValidations(values);
                      }}
                    />
                  </Animated.View>
                )}
              </View>
            </Wrapper>
            {/* )} */}

            {/* Bottom Card */}
          </View>
          <>
            {(currentTabValue === 0 || currentTabValue === 1) &&
              (keyboardHeight < 1 || openingLocation) && (
                <View
                  style={[
                    {
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.primary,
                      height: bottomDrawerHeight + 45,
                    },
                    styles.mediaOptionsContainer,
                  ]}>
                  <TouchableOpacity
                    style={{padding: 5}}
                    onPress={() => mediaPress(1)}>
                    <CameraIcon width={'22'} height={'22'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{padding: 5}}
                    onPress={() => mediaPress(2)}>
                    <GalleryIcon width={'22'} height={'22'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{padding: 5}}
                    onPress={() => mediaPress(3)}>
                    <VideoIcon width={'22'} height={'22'} />
                  </TouchableOpacity>
                </View>
              )}
            {(keyboardHeight < 1 || openingLocation) && (
              <BottomBar
                bottomBarPosition={data => setBottomDrawerheight(data?.height)}
                postingInProgress={postingInProgress}
                currentTabValue={currentTabValue}
                singleStory={singleStory}
                isAuthor={isAuthor}
                formIsValid={validations?.[currentTabValue] || false}
                formDataRef={formDataRef}
                isSubmittingDraft={isSubmittingDraft}
                isSubmittingPublish={isSubmittingPublish}
                onPublishButtonChange={setShouldDisablePublishButton}
                onDraftButtonChange={setShouldDisableDraftButton}
                onNextScreen={() => setShowDrawer(true)}
              />
            )}
            <DrawerComponent
              pageIsFocused={pageIsFocused}
              showDrawer={showDrawer}
              isIos={isIos}
              bottom={bottom}
              currentTabValue={currentTabValue}
              isAuthor={isAuthor}
              storyData={storyData}
              styles={styles}
              customTheme={customTheme}
              disableDraftButton={disableDraftButton}
              sharedWithLength={sharedWithLength}
              isSubmittingPublish={isSubmittingPublish}
              isSubmittingDraft={isSubmittingDraft}
              publishPost={publishPost}
              singleStory={singleStory}
              formDataRef={formDataRef}
              handleSheetClose={handleSheetClose}
              toggleLifestory={toggleLifestory}
              isLifestoryChecked={isLifestoryChecked}
              disablePublishButton={disablePublishButton}
              handleViewSubGroups={handleViewSubGroups}
            />
          </>

          <View
            style={{
              position: 'absolute',
              height: fullHeight,
              top: Math.round(fullHeight * (41 / 100)),
              right: -10,
              zIndex: -1,
            }}>
            <StoryFlowerIcon fill={flowerColors[currentTabValue]} />
          </View>
        </SafeAreaView>
      )}
    </>
  );
}

function createStyles() {
  const theme = useTheme();
  return StyleSheet.create({
    input: {
      backgroundColor: 'white',
      margin: 12,
      borderWidth: 1,
      borderColor: 'lightgrey',
      borderRadius: 10,
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
      height: 180,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    },
    activeTab: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
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
      fontSize: 14,
      marginHorizontal: 20,
      marginVertical: 10,
    },
    inputContainer: {
      flex: 1,
      marginHorizontal: 10,
      marginVertical: 10,
    },
    textInputStyle: {
      backgroundColor: '#FFF',
    },
    topSection: {
      height: 160,
      display: 'flex',
      justifyContent: 'space-between',
      overflow: 'hidden',
      paddingHorizontal: 25,
    },
    button: {
      borderRadius: 10,
    },
    dateContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    dateContainerBackground: {
      height: '100%',
      width: '100%',
    },
    tagSection: {
      height: 40,
      borderWidth: 1,
      borderColor: 'rgba(51, 48, 60, 0.3)',
      borderRadius: theme.roundness,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tagLeftSection: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomSection: {
      gap: 10,
      // height: 350,
      marginTop: 30,
      paddingHorizontal: 25,
    },
    closeButton: {
      position: 'absolute',
      top: -35,
      right: -6,
      backgroundColor: 'lightgray',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
      elevation: 9,
    },
    message: {
      fontSize: 16,
      fontWeight: '500',
      color: 'black',
      textAlign: 'center',
      paddingHorizontal: 15,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      paddingHorizontal: 15,
      fontWeight: 'bold',
      color: 'black',
    },
    lifestorySection: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingBottom: 5,
    },
    lifestoryTitle: {color: 'black', fontWeight: 'bold', fontSize: 20},
    lifestorySubtitle: {color: 'black', fontWeight: '500', fontSize: 13},
    mediaOptionsContainer: {
      backgroundColor: 'rgb(252,240,219)',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 30,
      paddingTop: 5,
    },
  });
}
