import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import React, {memo, useEffect} from 'react';
import FastImage from '@d11/react-native-fast-image';
import AstroPhoneIcon from '../../../images/Icons/AstroPhoneIcon';
import BackgroundCounter from '../../../common/BackgroundCounter';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {
  logAstrologerUnavailableForChat,
  setShowCallDialogue,
  setShowUnavailableDialogue,
  setWaitingCounter,
} from '../../../store/apps/agora';
import {logMissedCallEventAstrologer} from '../../../configs/Calls/CallNotificationConfig';
import {
  CallReqDetails,
  ChatReqInitDetails,
} from '../AstroBirthDetailsTabs/AstroBirthDetailsTabs';
import BackgroundTimer from '../../../common/BackgroundCounter/BackgroundCounterConfig';
import {formatDuration} from '../../../utils/format';
import {ASTRO_DEFAULT_AVATAR} from '../../../configs/Calls/Constants';
import AstroChatIconForDialogue from '../../../images/Icons/AstroChatIconForDialogue/AstroChatIconForDialogue';
import ErrorBoundary from '../../../common/ErrorBoundary';

function DialogContents({
  selectedFeature = 'Call',
  chatReqInitDetails = {
    chatRoomId: '',
    astrologerId: '',
    userId: '',
    channelName: '',
  },
  callReqDetails,
}: {
  selectedFeature?: 'Call' | 'Chat';
  chatReqInitDetails?: ChatReqInitDetails;
  callReqDetails?: CallReqDetails;
  call?: CallReqDetails;
}) {
  const loggedInUserPersonalDetails = useSelector(
    (state: RootState) => state?.userInfo?.personalDetails,
  );
  const time = useSelector(
    (state: RootState) => state.agoraCallSlice.waitingCounter,
  );
  const showCallDialogue = useSelector(
    (state: RootState) => state.agoraCallSlice.showCallDialogue,
  );
  const totalAvailableTalkTime = useSelector(
    (state: RootState) => state.agoraCallSlice.totalAvaiableConsultationTime,
  );
  const astrologerDetails = useSelector(
    (state: RootState) => state.astrologerProfile,
  );
  const waitingCounter = useSelector(
    (state: RootState) => state.agoraCallSlice.waitingCounter,
  );

  const dispatch = useDispatch<AppDispatch>();

  async function logMissedChatEventAstrologer() {
    const payload = {
      astrologerId: chatReqInitDetails.astrologerId ?? '',
      chatRoomId: chatReqInitDetails.chatRoomId ?? '',
    };
    await dispatch(logAstrologerUnavailableForChat(payload));
  }

  // If not visible, don't render anything
  if (!showCallDialogue) {
    BackgroundTimer.clearInterval();
    return null;
  }

  return (
    <ErrorBoundary>
      <View style={{gap: 15}}>
        <View style={styles.imageContainer}>
          <View
            style={[styles.profileContainer, {transform: [{translateX: 15}]}]}>
            {/* @ts-ignore */}

            <FastImage
              resizeMode="cover"
              style={[styles.image]}
              source={{
                uri:
                  //@ts-ignore
                  loggedInUserPersonalDetails?.profilepic?.length > 0
                    ? //@ts-ignore
                      loggedInUserPersonalDetails?.profilepic
                    : ASTRO_DEFAULT_AVATAR,
              }}
            />

            <Text
              numberOfLines={1}
              style={
                styles.name
                //@ts-ignore
              }>{`${loggedInUserPersonalDetails?.name} ${loggedInUserPersonalDetails?.lastname}`}</Text>
          </View>

          <View style={{zIndex: 2, bottom: 8}}>
            {selectedFeature === 'Call' ? (
              <AstroPhoneIcon />
            ) : (
              <AstroChatIconForDialogue />
            )}
          </View>
          <View
            style={[styles.profileContainer, {transform: [{translateX: -15}]}]}>
            <FastImage
              resizeMode="cover"
              style={[styles.image]}
              source={{
                //@ts-ignore
                uri:
                  //@ts-ignore
                  astrologerDetails?.astrologerProfileDetails?.userProfile
                    ?.personalDetails?.profilepic?.length > 0
                    ? astrologerDetails?.astrologerProfileDetails?.userProfile
                        ?.personalDetails?.profilepic
                    : ASTRO_DEFAULT_AVATAR,
              }}
            />
            <Text numberOfLines={1} style={styles.name}>
              {
                astrologerDetails?.astrologerProfileDetails?.astroProfile
                  .displayName
              }
            </Text>
          </View>
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: -5,
          }}>
          <Text style={[styles.text]}>Ringing...</Text>
          <View style={{height: 0, width: 0}}>
            <BackgroundCounter
              start={true}
              startTime={waitingCounter}
              customTime={time}
              onStop={() => {
                dispatch(setShowCallDialogue(false));
                dispatch(setShowUnavailableDialogue(true));
                if (selectedFeature === 'Call' && callReqDetails) {
                  logMissedCallEventAstrologer(callReqDetails);
                } else {
                  logMissedChatEventAstrologer();
                }
              }}
              onChange={time => {
                dispatch(setWaitingCounter(time));
              }}
            />
            <Text style={[styles.text, {color: 'rgba(39, 195, 148, 1)'}]}>
              min{' '}
            </Text>
          </View>
        </View>
        <Text style={[{marginHorizontal: 20, fontSize: 12}, styles.text]}>
          You’ll receive a request when the astrologer is ready.
        </Text>
        <View style={styles.talktimeContainer}>
          <Text style={styles.talkTimeText}>
            Available {selectedFeature === 'Call' ? 'talk' : 'chat'} time
          </Text>
          <Text style={styles.talkTimeText}>
            {formatDuration(totalAvailableTalkTime)} min
          </Text>
        </View>
        <Text style={[{fontSize: 12, textAlign: 'center'}, styles.text]}>
          {`Please note, based on the amount in your wallet your call will be disconnected after ${formatDuration(totalAvailableTalkTime)} min.`}
        </Text>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent gray overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: 'rgba(18, 16, 41, 1)', // Match your app's background
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5, // For Android shadow
  },
  image: {
    width: 80,
    height: 80,
    aspectRatio: 1,
    borderRadius: 50,
    zIndex: 1,
  },
  imageContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  name: {
    color: 'white',
    width: 85,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    color: 'white',
  },
  talkTimeText: {
    color: 'rgba(39, 195, 148, 1)',
    fontWeight: '600',
    fontSize: 16,
  },
  talktimeContainer: {
    backgroundColor: 'rgba(39, 195, 148, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
  },
});

export default memo(DialogContents);
