import React, {useState, useEffect, memo, useMemo, useRef} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';

function BottomBar({
  isAuthor = true,
  singleStory = null,
  currentTabValue = 0,
  formIsValid = false,
  postingInProgress,
  onNextScreen = () => undefined,
  onPublishButtonChange = () => undefined,
  onDraftButtonChange = () => undefined,
  bottomBarPosition = () => undefined,
}) {
  const containerRef = useRef(null);
  const {bottom: bottomInset} = useSafeAreaInsets();
  const theme = useTheme();
  const getSelectedFamilyGroups = useSelector(
    state => state.story.currentlyWritten?.familyGroupId,
  );
  const getSelectedFamilySubGroups = useSelector(
    state => state.story.currentlyWritten?.familySubGroupId,
  );
  const [publishButtonDisabled, setPublishButtonDisabled] = useState(true);
  const [draftButtonDisabled, setDraftButtonDisabled] = useState(true);
  const [eventDate] = useState(null);

  const storyData = useSelector(state => state.story.newWrittenStory);
  const hasNewCollabs = useMemo(() => {
    if (
      !singleStory?.collaboratingMembers?.length ||
      !storyData?.collabIds?.length
    ) {
      return false;
    }
    return (
      storyData?.collabIds?.length > singleStory?.collaboratingMembers?.length
    );
    //! TODO: filter properly
    // if (storyData?.collabIds?.length > 0) {
    //   return singleStory.collaboratingMembers
    //     .filter(
    //       member => !storyData.collabIds.includes(member.collaboratorId._id),
    //     )
    //     .map(member => member.collaboratorId._id);
    // }
    // return [];
  }, [storyData, singleStory]);

  const disabledState = useMemo(() => {
    return (
      postingInProgress ||
      (currentTabValue === 0
        ? draftButtonDisabled ||
          !formIsValid ||
          !storyData.description ||
          !storyData.storiesTitle
        : publishButtonDisabled)
    );
  }, [currentTabValue, draftButtonDisabled, publishButtonDisabled, storyData]);

  useEffect(() => {
    onPublishButtonChange(publishButtonDisabled);
    onDraftButtonChange(draftButtonDisabled);
  }, [publishButtonDisabled, draftButtonDisabled]);

  useEffect(() => {
    if (currentTabValue === 0) {
      setPublishButtonDisabled(
        !formIsValid ||
          !isAuthor ||
          !storyData.description ||
          !storyData.storiesTitle ||
          hasNewCollabs ||
          (storyData.collabsLength > 0 &&
            !Object.keys(singleStory || {})?.length),
      );
      setDraftButtonDisabled(
        !formIsValid || !storyData.description || !storyData.storiesTitle,
      );
    }

    if (currentTabValue === 1) {
      setPublishButtonDisabled(
        !formIsValid ||
          !isAuthor ||
          !storyData.storiesTitle ||
          !storyData.mediaLength,
      );
      setDraftButtonDisabled(
        !formIsValid || !storyData.storiesTitle || !storyData.mediaLength,
      );
    }
    if (currentTabValue === 2) {
      setPublishButtonDisabled(
        !formIsValid || !storyData.storiesTitle || !storyData.mediaLength,
      );
    }
    if (currentTabValue === 3) {
      setPublishButtonDisabled(!formIsValid || !storyData.storiesTitle);
    }
  }, [
    hasNewCollabs,
    formIsValid,
    storyData,
    eventDate,
    isAuthor,
    getSelectedFamilySubGroups,
    getSelectedFamilyGroups,
    singleStory,
  ]);

  function measureContainer() {
    containerRef.current.measure((x, y, width, height, pageX, pageY) => {
      bottomBarPosition({x, y, width, height, pageX, pageY});
    });
  }

  return (
    <View
      onLayout={measureContainer}
      ref={containerRef}
      style={[
        styles.bottomCard,
        {
          paddingBottom: bottomInset + 10,
        },
      ]}>
      <View
        style={{
          padding: 5,
          marginTop: 15,
          gap: 10,
        }}>
        <Button
          mode="contained"
          theme={{
            colors: {
              surface: theme.colors.orange,
            },
          }}
          loading={postingInProgress}
          buttonColor={theme.colors.orange}
          textColor={theme.colors.background}
          style={{
            borderRadius: theme.roundness,
            fontSize: 15,
            marginHorizontal: 12,
            ...(disabledState && {
              backgroundColor: theme.colors.orange,
              opacity: 0.6,
            }),
          }}
          disabled={disabledState}
          onPress={onNextScreen}
          labelStyle={{
            color: theme.colors.background,
            fontSize: 15,
          }}>
          <Text
            variant="bold"
            style={{
              fontSize: 15,
              color: '#fff',
            }}>
            Next
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = {
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collabButton: {
    borderRadius: 10,
    marginHorizontal: 20,
  },
  collabText: {color: 'white', fontWeight: 'bold', fontSize: 15},
  publishButtonLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16.25,
  },
  draftsButtonLabel: {
    color: '#3473DC',
    fontWeight: '600',
    fontSize: 16.25,
  },
  threeButtons: {
    borderRadius: 8,
    paddingHorizontal: '12%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  threeButtonsDate: {
    borderRadius: 8,
    paddingHorizontal: '5%',
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  threeButtonsContainer: {
    gap: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

BottomBar.propTypes = {
  onClick: PropTypes.func,
  isAuthor: PropTypes.bool,
  postingInProgress: PropTypes.bool,
  singleStory: PropTypes.object,
  currentTabValue: PropTypes.number,
  formIsValid: PropTypes.bool.isRequired,
  onNextScreen: PropTypes.func,
  onPublishButtonChange: PropTypes.func,
  onDraftButtonChange: PropTypes.func,
};

BottomBar.displayName = 'BottomBar-story';

export default memo(BottomBar);
