import {useEffect, useRef, useState} from 'react';
import {
  View,
  Pressable,
  // Modal,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {Portal, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Shadow} from 'react-native-shadow-2';
import {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  AudiosTabIcon,
  MomentsTabIcon,
  PlusButtonStory,
  StoriesTabIcon,
  StoryFilterIcon,
} from '../../../images';
import {SCREEN_WIDTH} from '../../../constants/Screens';
import {resetEditGroup, setStoryFilters} from '../../../store/apps/story';
import {useDispatch, useSelector} from 'react-redux';
import {BackArrowIcon} from '../../../images';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';
import PropTypes from 'prop-types';
import QuoteIcon from '../../../images/Icons/QuoteIcon';
import {colors} from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';
import HeaderSeparator from '../../../common/HeaderSeparator';
import CustomHamburger from '../../Communities/CommunityComponents/DrawerCustomHeader/CustomHamburger';
import CloseIcon from '../../../images/Icons/CloseIcon';
import {fetchAllStories} from '../../../store/apps/story';
import {
  getGroupData,
  getMySubgroups,
} from '../../../store/apps/memberDirectorySlice';
import DrawerFilters from '../DrawerFilters';
import { setGroupId } from '../../../store/apps/tree';
import useNativeBackHandler from '../../../hooks/useBackHandler';

export default function StoriesHeader({
  backgroundColor,
  onClickTab = () => undefined,
  from,
  showLogo,
  onClickFilter = () => undefined,
  setToggleDrawer,
  toggleDrawer,
  // familyName,
  onClose,
}) {
  /**
   * Maximum width of the animated view.
   */
  const ANIMATED_WIDTH = 240;
  /**
   * Maximum height and starting width of the animated view.
   */
  const ANIMATED_HEIGHT = 60;
  const {top} = useSafeAreaInsets();
  const isIos = Platform.OS === 'ios';
  const AnimatedContainer = function ({
    children,
    onStartShouldSetResponder,
    ...props
  }) {
    return (
      // Samsung and Real Me - Android 11 /13 and iPhone Xs - 17. 5.1 bubbles the event when you use Pressable/Touchable components even if you use `event.stopPropagation`, stick to View.
      <View {...props} onStartShouldSetResponder={onStartShouldSetResponder}>
        {children}
      </View>
    );
  };

  // animation values
  const firstValue = useSharedValue(30);
  const secondValue = useSharedValue(110);
  const thirdValue = useSharedValue(190);
  const fourthValue = useSharedValue(270);

  // Animation width
  const firstWidth = useSharedValue(ANIMATED_HEIGHT);
  const secondWidth = useSharedValue(ANIMATED_HEIGHT);
  const thirdWidth = useSharedValue(ANIMATED_HEIGHT);
  const fourthWidth = useSharedValue(ANIMATED_HEIGHT);

  // Animation height
  const firstHeight = useSharedValue(ANIMATED_HEIGHT);
  const secondHeight = useSharedValue(ANIMATED_HEIGHT);
  const thirdHeight = useSharedValue(ANIMATED_HEIGHT);
  const fourthHeight = useSharedValue(ANIMATED_HEIGHT);

  const isOpen = useSharedValue(false);
  const opacity = useSharedValue(0);
  const progress = useDerivedValue(() =>
    isOpen.value ? withTiming(1) : withTiming(0),
  );

  const styles = useCreateStyles();
  const plusIconRef = useRef(null);

  const dispatch = useDispatch();
  const [plusIconTop, setPlusIconTop] = useState(0);
  const [plusIconLeft, setPlusIconLeft] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  // let groupId = useSelector(state => state.userInfo.linkedGroup);
  let userId = useSelector(state => state?.userInfo?._id);
  const groupId = useSelector(state => state.Tree.groupId);

  const familyName = useSelector(state => state?.Tree?.familyName);

  const theme = useTheme();
  const config = {
    easing: Easing.bezier(0.68, -0.6, 0.32, 1.6),
    duration: 500,
  };

  useEffect(() => {
    return () => {
      isOpen.value = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      await dispatch(getGroupData()).unwrap();
      await dispatch(getMySubgroups()).unwrap();
    })();
  }, []);

  const openOptions = () => {
    if (isOpen.value === false) {
      setShowOptions(true);
      firstValue.value = withDelay(200, withSpring(130));
      secondValue.value = withDelay(100, withSpring(210));
      thirdValue.value = withSpring(290);
      fourthValue.value = withSpring(370);

      firstWidth.value = withDelay(1200, withSpring(ANIMATED_WIDTH));
      secondWidth.value = withDelay(1100, withSpring(ANIMATED_WIDTH));
      thirdWidth.value = withDelay(1000, withSpring(ANIMATED_WIDTH));
      fourthWidth.value = withDelay(900, withSpring(ANIMATED_WIDTH));

      opacity.value = withDelay(1200, withSpring(1));
      isOpen.value = true;
    }
  };

  const closeOptions = () => {
    isOpen.value === true;
    if (isOpen.value === true) {
      firstWidth.value = withTiming(
        ANIMATED_HEIGHT,
        {duration: 100},
        finish => {
          if (finish) {
            firstValue.value = withTiming(30, config);
            firstHeight.value = withTiming(ANIMATED_HEIGHT, config);
          }
        },
      );
      secondWidth.value = withTiming(
        ANIMATED_HEIGHT,
        {duration: 100},
        finish => {
          if (finish) {
            secondValue.value = withDelay(50, withTiming(110, config));
            secondHeight.value = withDelay(
              50,
              withTiming(ANIMATED_HEIGHT, config),
            );
          }
        },
      );
      thirdWidth.value = withTiming(
        ANIMATED_HEIGHT,
        {duration: 100},
        finish => {
          if (finish) {
            thirdValue.value = withDelay(100, withTiming(190, config));
            thirdHeight.value = withDelay(
              100,
              withTiming(ANIMATED_HEIGHT, config),
            );
          }
        },
      );

      fourthWidth.value = withTiming(
        ANIMATED_HEIGHT,
        {duration: 100},
        finish => {
          if (finish) {
            fourthValue.value = withDelay(150, withTiming(270, config));
            fourthHeight.value = withDelay(
              150,
              withTiming(ANIMATED_HEIGHT, config),
            );
          }
        },
      );
      opacity.value = withTiming(0, {duration: 100});
      isOpen.value = false;

      // wait for for animation before closing.
      const timerId = setTimeout(() => {
        setShowOptions(false);
        clearTimeout(timerId);
      }, 1000);
    }
  };

  const tabClickEvent = value => {
    // wait for for animation before closing.
    const timerId = setTimeout(() => {
      setShowOptions(false);
      clearTimeout(timerId);
      isOpen.value = false;
      onClickTab(value); // Call onClickTab after closeOptions animation completes
    }, 1000);
  };

  const opacityText = useAnimatedStyle(() => {
    return {
      opacity: 1,
    };
  });

  const firstWidthStyle = useAnimatedStyle(() => {
    return {
      width: firstWidth.value,
      height: firstHeight.value,
    };
  });

  const secondWidthStyle = useAnimatedStyle(() => {
    return {
      width: secondWidth.value,
      height: secondHeight.value,
    };
  });

  const thirdWidthStyle = useAnimatedStyle(() => {
    return {
      width: thirdWidth.value,
      height: thirdHeight.value,
    };
  });

  const fourthWidthStyle = useAnimatedStyle(() => {
    return {
      width: fourthWidth.value,
      height: fourthHeight.value,
    };
  });

  const firstIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      firstValue.value,
      [30, 130],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      top: firstValue.value,
      transform: [{scale: scale}],
    };
  });

  const secondIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      secondValue.value,
      [110, 210],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      top: secondValue.value,
      transform: [{scale: scale}],
    };
  });

  const thirdIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      thirdValue.value,
      [190, 290],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      top: thirdValue.value,
      transform: [{scale: scale}],
    };
  });

  const fourthIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      fourthValue.value,
      [270, 370],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      top: fourthValue.value,
      transform: [{scale: scale}],
    };
  });

  const plusIcon = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${progress.value * 45}deg`}],
    };
  });

  function plusAction() {
    if (!from) {
      openOptions();
    } else if (from === 'manageGroup') {
      dispatch(resetEditGroup());
      navigation.navigate('EditGroup');
    }
  }
  /**
   * Retrieves the position of the plus icon element and updates the state variables
   * for its top and left positions.
   */
  function getElementPosition() {
    plusIconRef.current.measure((_x, _y, _width, _height, pageX, pageY) => {
      setPlusIconTop(pageY);
      setPlusIconLeft(pageX);
    });
  }

  const navigation = useNavigation();

  const GoToCreatePost = () => {
    navigation.navigate('SelectedCategory');
    toggleDrawers();
  };

  const goBack = () => {
    setToggleDrawer(false);
    navigation.navigate('BottomTabs', {screen: 'Trees'});
  };

  useNativeBackHandler(goBack)


  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width),
  ).current; // Start off-screen

  useEffect(() => {
    if (toggleDrawer) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide in to the visible screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width, // Slide out to the right
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [toggleDrawer, slideAnim]);

  const handleMyPosts = async () => {
    try {
      const data = {pageNo: 1,
        groupId: [groupId],
        filters: [groupId,"My_posts"],
        isEveryoneSelected: false,
      };
      dispatch(setStoryFilters("myPosts"));
      await dispatch(fetchAllStories(data)).unwrap();
      setToggleDrawer(false);
    } catch (error) {
      console.error("Error fetching posts:", {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response data'
      });
    }
  };
  const handleAllPosts = async () => {
    try {
      const data = {pageNo: 1,
        groupId: [groupId],
        filters: [groupId],
        isEveryoneSelected: false,
      };
      dispatch(setStoryFilters("allPosts"));
      await dispatch(fetchAllStories(data)).unwrap();
      setToggleDrawer(false);
    } catch (error) {
      console.error("Error fetching posts:", {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response data'
      });
    }
  };
  const handleDraftPosts = async () => {
    try {
      const data = {pageNo: 1,
        groupId: [groupId],
        filters: [groupId, "Drafts"],
        isEveryoneSelected: false,
      };
      dispatch(setStoryFilters("drafts"));
      await dispatch(fetchAllStories(data)).unwrap();
      setToggleDrawer(false);
    } catch (error) {
      console.error("Error fetching posts:", {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response data'
      });
    }
  };

  const handleSavedPosts = async () => {
    try {
      const data = {pageNo: 1,
        groupId: [groupId],
        filters: [groupId, "Saved"],
        isEveryoneSelected: false,
      };
      dispatch(setStoryFilters("saved"));
      await dispatch(fetchAllStories(data)).unwrap();
      setToggleDrawer(false);
    } catch (error) {
      console.error("Error fetching posts:", {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response ? error.response.data : 'No response data'
      });
    }
  };

  const onSelect = {
    allPosts: handleAllPosts,
    myPosts: handleMyPosts,
    createPost: GoToCreatePost,
    drafts: handleDraftPosts,
    saved: handleSavedPosts,
  }
  const toggleDrawers = () => {
    setToggleDrawer(!toggleDrawer);
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safeArea}>
       <View style={{position: 'relative'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,248,240,1)',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 10 : 20,
            paddingBottom: Platform.OS === 'ios' ? 5 : 15,
            height: Platform.OS === 'ios' ? 49 : 60,
            zIndex: 1000,
          }}>
            {/* <HeaderSeparator /> */}
          <TouchableOpacity
            style={{left: 20}}
            testID="close-invite"
            onPress={goBack}>
            {!toggleDrawer && <BackArrowIcon />}
          </TouchableOpacity>
          <View>
            <Text style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: 'black',
                    marginTop: -5,
            }}>
              {familyName?.includes('Family')
                ? `${familyName} Wall`
                : `${familyName} Family Wall`}
            </Text>
          </View>
          <View
              style={{right: 20, paddingBottom: Platform.OS === 'ios' ? 4 : 0}}>
            {toggleDrawer ? (
              <TouchableOpacity onPress={() => 
              {
                onClose();
                toggleDrawers();
                setGroupId([]);
              }}>
                <CloseIcon />
              </TouchableOpacity>
            ) : (
              <CustomHamburger onPress={toggleDrawers} />
             )}
          </View>
          </View>
        </View>
      </SafeAreaView>
      <HeaderSeparator style={{zIndex: 10000}} />

      {toggleDrawer && (
        <>
          <View
            style={{
              position: 'relative',
              // top: -13,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              // height: Platform.OS === 'ios' ? 0 : 100,
              width: '100%',
            }}></View>
          <View style={styles.drawerContainer}>
            <TouchableOpacity
              style={styles.overlay}
              onPress={toggleDrawers}
            />
            <Animated.View
              style={[
                styles.drawerOverlay,
                {transform: [{translateX: slideAnim}]},
              ]}>
        <DrawerFilters onSelect={(id) => onSelect?.[id]?.()}/>
        </Animated.View>
        </View>
        </>
      )}

      {showOptions && (
        <>
          <Portal onDismiss={closeOptions}>
            <View onTouchEnd={closeOptions} style={[styles.modalStyles]}>
              <Pressable
                accessibilityLabel="plusButtonStoriesTop"
                style={{
                  marginRight: 0,
                  height: 24,
                  position: 'absolute',
                  top: isIos ? plusIconTop + top : plusIconTop,
                  left: plusIconLeft,
                  zIndex: 9999,
                }}
                onPress={() => closeOptions}>
                <Animated.View
                  style={[
                    styles.plusButton,
                    plusIcon,
                    {
                      opacity: 1,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}>
                  <PlusButtonStory />
                </Animated.View>
              </Pressable>
              <View
                style={{
                  marginTop: (isIos ? plusIconTop + top : plusIconTop) - 60,
                }}>
                <View style={styles.container}>
                  {/* Stories */}
                  <AnimatedContainer
                    style={{
                      height: firstWidthStyle.height,
                    }}
                    accessibilityLabel="storiesCta"
                    onStartShouldSetResponder={() => tabClickEvent(0)}>
                    <Animated.View
                      style={[
                        styles.contentContainer,
                        firstIcon,
                        firstWidthStyle,
                        styles.containerStyles,
                      ]}>
                      <View style={styles.iconContainer}>
                        <StoriesTabIcon strokeWidth={2} />
                      </View>
                      <Animated.View style={opacityText}>
                        <Animated.Text
                          style={[styles.text, styles.animatedHeading]}>
                          Stories
                        </Animated.Text>
                        <Animated.Text style={[styles.text]}>
                          Family narratives in text
                        </Animated.Text>
                      </Animated.View>
                    </Animated.View>
                  </AnimatedContainer>

                  {/* Moments */}
                  <AnimatedContainer
                    style={{
                      height: secondWidthStyle.height,
                    }}
                    accessibilityLabel="momentsCta"
                    onStartShouldSetResponder={() => tabClickEvent(1)}>
                    <Animated.View
                      style={[
                        styles.contentContainer,
                        secondIcon,
                        secondWidthStyle,
                        styles.containerStyles,
                      ]}>
                      <View style={styles.iconContainer}>
                        <MomentsTabIcon strokeWidth={2} />
                      </View>
                      <Animated.View style={opacityText}>
                        <Animated.Text
                          style={[styles.text, styles.animatedHeading]}>
                          Moments
                        </Animated.Text>
                        <Animated.Text style={[styles.text]}>
                          Visual family history
                        </Animated.Text>
                      </Animated.View>
                    </Animated.View>
                  </AnimatedContainer>

                  {/* Audios */}
                  <AnimatedContainer
                    style={{
                      height: thirdWidthStyle.height,
                    }}
                    accessibilityLabel="audiosCta"
                    onStartShouldSetResponder={() => tabClickEvent(2)}>
                    <Animated.View
                      style={[
                        styles.contentContainer,
                        thirdIcon,
                        thirdWidthStyle,
                        styles.containerStyles,
                      ]}>
                      <View style={styles.iconContainer}>
                        <AudiosTabIcon strokeWidth={2} />
                      </View>
                      <Animated.View style={opacityText}>
                        <Animated.Text
                          style={[styles.text, styles.animatedHeading]}>
                          Audios
                        </Animated.Text>
                        <Animated.Text style={[styles.text]}>
                          Family tales in sound
                        </Animated.Text>
                      </Animated.View>
                    </Animated.View>
                  </AnimatedContainer>

                  {/* Quotes */}
                  <AnimatedContainer
                    style={{
                      height: fourthWidthStyle.height,
                    }}
                    accessibilityLabel="quotesCta"
                    onStartShouldSetResponder={() => tabClickEvent(3)}>
                    <Animated.View
                      style={[
                        styles.contentContainer,
                        fourthIcon,
                        fourthWidthStyle,
                        styles.containerStyles,
                      ]}>
                      <View style={styles.iconContainer}>
                        <QuoteIcon stroke="#FF4F4F" />
                      </View>
                      <Animated.View style={opacityText}>
                        <Animated.Text
                          style={[styles.text, styles.animatedHeading]}>
                          Quotes
                        </Animated.Text>
                        <Animated.Text style={[styles.text]}>
                          Brief family memories
                        </Animated.Text>
                      </Animated.View>
                    </Animated.View>
                  </AnimatedContainer>
                </View>
              </View>
            </View>
          </Portal>
        </>
      )}
    </ErrorBoundary>
  );
}

function useCreateStyles() {
  const theme = useTheme();
  const {top} = useSafeAreaInsets();
  return StyleSheet.create({
    safeArea: {
      // Padding to account for status bar on Android and iOS
      paddingTop:
        Platform.OS === 'ios'
          ? 44
          :  top,
      paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    },
    header: {
      marginLeft: 12,
      paddingBottom: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    logo: {
      height: 40,
      width: 90,
    },
    plusFilterStyle: {
      flexDirection: 'row',
      paddingRight: 5,
      alignItems: 'center',
    },
    filterButton: {
      backgroundColor: '#FFDBC9',
      padding: 5,
      borderRadius: 5,
      marginRight: 15,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    plusButton: {
      backgroundColor: theme.colors.primary,
      padding: 8,
      marginRight: 5,
      borderRadius: 50,
    },
    buttonsContainer: {
      paddingHorizontal: 0,
      height: 70,
      alignItems: 'center',
      width: SCREEN_WIDTH,
      flexDirection: 'row',
      gap: 5,
    },
    imageContainer: {
      width: 150,
      justifyContent: 'center',
      height: '100%',
      padding: 10,
      marginRight: 'auto',
      marginLeft: 0,
    },
    subTitleText: {
      fontWeight: '500',
      fontSize: 15,
    },
    modalStyles: {
      flex: 1,
      alignItems: 'flex-end',
      paddingRight: 8,
      justifyContent: 'flex-start',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9000,
      position: 'relative',
    },
    container: {
      flex: 1,
      zIndex: 1,
    },
    contentContainer: {
      position: 'absolute',
      top: 30,
      right: 4 + -10,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: 50,
    },
    iconContainer: {
      // ANIMATED_WIDTH - (border width)
      width: 58,
      height: 58,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 29,
    },
    icon: {
      width: 26,
      height: 26,
    },
    text: {
      color: '#000',
      fontWeight: '600',
    },
    animatedHeading: {
      fontSize: 20,
      fontWeight: '700',
    },
    containerStyles: {
      borderWidth: 2,
      borderColor: colors.primaryOrange,
      backgroundColor: '#fff',
    },
    text: {
      fontSize: 22,
      fontWeight: '700',
      color: 'black',
      marginTop: -10,
    },
    drawerContainer: {
      borderTopWidth: 0.2,
      borderColor: 'lightgray',
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
      zIndex: 1,
    },
    drawerOverlay: {
      position: 'absolute',
      right: 0,
      top: 0.2,
      width: '80%',
      height: '100%',
      backgroundColor: '#FFF8F0',
      zIndex: 2,
    },
  });
}

StoriesHeader.propTypes = {
  backgroundColor: PropTypes.string,
  onClickTab: PropTypes.func,
  from: PropTypes.string,
  showLogo: PropTypes.bool,
  onClickFilter: PropTypes.func,
};
