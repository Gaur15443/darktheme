import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Animated as RnAnimated,
  Pressable,
} from 'react-native';
import { Modal, Portal, useTheme, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StoryEditIcon,
  StoryDeleteIcon,
  BackArrowIcon,
  StoryElipsisIcon,
} from '../../../images';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../constants/Screens';
import { CommonActions, useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { colors } from '../../../common/NewTheme';

const ViewStoriesHeader = ({
  storyId = null,
  tabNumber,
  loading = true,
  isAuthor = false,
  onDelete = () => undefined,
  shouldShowEdit = true,
  animationValue = 0,
  iconsHeight = 40,
  ellipsisWidth = null,
  ellipsisHeight = null,
}) => {
  const theme = useTheme();
  const ios = Platform.OS == 'ios';
  const { top } = useSafeAreaInsets();
  const navigator = useNavigation();
  const userId = useSelector(state => state?.userInfo?._id);
  const [showOptions, setShowOptions] = useState(false);
  const [ellipseYPosition, setEllipseYPosition] = useState(0);
  const headerColor = useRef(new RnAnimated.Value(0)).current;
  const openOptions = () => {
    setShowOptions(true);
  };
  const closeOptions = () => {
    setShowOptions(false);
  };
  const goToEditStory = () => {
    setShowOptions(false);
    navigator.navigate('CreateStory', {
      _id: storyId?._id,
      currentTabValue: tabNumber,
    });
  };

  useEffect(() => {
    // use opacity instead of scale
    RnAnimated.timing(headerColor, {
      toValue: animationValue,
      duration: 0,
      useNativeDriver: true,
    }).start();
  }, [animationValue]);

  const animatedStyle = {
    backgroundColor: headerColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
    }),
  };
  const handleGoBack = () => {
    if (navigator.canGoBack()) {
      navigator.goBack();
    } else {
      navigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'BottomTabs',
              state: {
                focusedTab: 2,
                routes: [{ name: 'Stories' }],
              },
            },
          ],
        }),
      );
    }
  };

  const loggedInUserIsCollaborator = useMemo(() => {
    if (!storyId?.collaboratingMembers?.length) {
      return false;
    }
    return !!storyId?.collaboratingMembers?.find(
      collab => collab?.collaboratorId?._id === userId,
    );
  }, [storyId, loading]);

  const enableEllipsis = useMemo(() => {
    if (isAuthor) {
      return true;
    }

    return (
      loggedInUserIsCollaborator && storyId?.status?.toString?.() === 'Draft'
    );
  }, [isAuthor, loggedInUserIsCollaborator, storyId]);

  function getEllipsePosition(event) {
    setEllipseYPosition(event.nativeEvent.layout.y);
  }

  return (
    <RnAnimated.View
      style={[
        {
          paddingTop: ios ? top : top + 10,
          // backgroundColor: theme.colors.background,
          position: 'absolute',
        },
        animatedStyle,
      ]}>
      <View
        style={{
          width: SCREEN_WIDTH,
          height: 70,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          // backgroundColor: theme.colors.background,
        }}>
        <TouchableOpacity
          accessibilityLabel="goBackFromView"
          onPress={handleGoBack}>
          <View
            style={{
              marginLeft: 10,
              backgroundColor: '#fff',
              height: iconsHeight,
              aspectRatio: 1,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <BackArrowIcon />
          </View>
        </TouchableOpacity>

        {/* below is conditional rendering of edit and delete button
       so that no one can access it untl story is loaded */}

        {enableEllipsis && Object.keys(storyId || {})?.length > 0 && (
          <TouchableOpacity
            accessibilityLabel="editStoryOptions"
            onPress={() => openOptions()}>
            <View
              onLayout={getEllipsePosition}
              style={{
                marginRight: 10,
                backgroundColor: '#fff',
                height: iconsHeight,
                aspectRatio: 1,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <StoryElipsisIcon height={ellipsisHeight} width={ellipsisWidth} />
            </View>
            {/* I added key to make it rerender above comment */}
            <Portal key={showOptions}>
              <Modal
                visible={showOptions}
                onDismiss={closeOptions}
                contentContainerStyle={{
                  paddingRight: 10,
                  borderRadius: 6,
                  overflow: 'hidden',
                  height: '110%',
                  width: '100%',
                  marginTop: 0,
                  paddingTop: 70,
                  marginBottom: 0,
                  paddingBottom: 0,
                  marginRight: 0,
                }}
                style={styles.modalStyles}>
                <Pressable onPress={closeOptions} style={{ flexGrow: 1, alignItems: 'flex-end', backgroundColor: 'transparent' }}>
                  {shouldShowEdit && (
                    <TouchableOpacity
                      accessibilityLabel="editStory"
                      onPress={goToEditStory}
                      style={{
                        width: 120
                      }}
                    >
                      <Animated.View
                        entering={FadeInRight.duration(300).damping(20)}
                        style={[
                          styles.buttonOne,
                          { borderRadius: !isAuthor ? 5 : null, borderTopRightRadius: 5, borderTopLeftRadius: 5 },
                        ]}>
                        <StoryEditIcon stroke={colors.primaryOrange} />
                        <Text style={styles.buttonText}>Edit</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  )}
                  {/* only owner can delete the story not the collabs*/}
                  {isAuthor && (
                    <TouchableOpacity
                      accessibilityLabel="deleteStory"
                      onPress={() => {
                        onDelete();
                        setShowOptions(false);
                      }}
                      style={{
                        width: 120
                      }}
                    >
                      <Animated.View
                        entering={FadeInRight.duration(300).damping(20)}
                        style={styles.buttonTwo}>
                        <StoryDeleteIcon stroke={colors.primaryOrange} />
                        <Text style={styles.buttonText}>Delete</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  )}
                </Pressable>
              </Modal>
            </Portal>
          </TouchableOpacity>
        )}
      </View>
    </RnAnimated.View>
  );
};

const styles = {
  buttonOne: {
    paddingRight: 50,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  buttonTwo: {
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingStart: 10,
  },
  buttonText: { fontSize: 18, color: 'black', fontWeight: '600' },
  modalStyles: {
    gap: 5,
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingTop: 42,
    justifyContent: 'flex-start',
    marginTop: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
};

export default memo(ViewStoriesHeader);
ViewStoriesHeader.propTypes = {
  storyId: PropTypes.object,
  loading: PropTypes.bool,
  isAuthor: PropTypes.bool,
  onDelete: PropTypes.func,
  shouldShowEdit: PropTypes.bool,
};

ViewStoriesHeader.displayName = 'ViewStoriesHeader';
