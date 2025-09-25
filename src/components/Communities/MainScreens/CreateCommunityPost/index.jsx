import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';  
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import {
  CreateNewPollIcon,
  CrossIcon,
  StartDiscussionIcon,
} from '../../../../images';
import {useNavigation} from '@react-navigation/native';
import CreateNewDIscussions from '../CreateNewDIscussions';
import CreateNewPoll from '../CreateNewPoll';
import Confirm from '../../CommunityComponents/ConfirmCommunityPopup';
import {setAdjustPan, setAdjustResize} from 'rn-android-keyboard-adjust';

const CreateCommunityPostHeader = ({
  currentScreen = 'discussion',
  onClose = () => {},
}) => {
  return (
    <SafeAreaView>
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}>
          {currentScreen === 'discussion' ? (
            <StartDiscussionIcon />
          ) : (
            <CreateNewPollIcon color="black" />
          )}
          <Text
            variant="bold"
            accessibilityLabel={currentScreen === 'discussion'
              ? 'Start A Discussion'
              : 'Create poll'}
            style={{
              fontSize: 18,
              lineHeight: 18,
              color: 'black',

              textAlign: 'center',
            }}>
            {currentScreen === 'discussion'
              ? 'Start A Discussion'
              : 'Create poll'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <CrossIcon fill={'black'} width={18} height={18} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const CreateCommunityPosts = ({route}) => {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('discussion');
  const [discussionFormChanged, setDiscussionFormChanged] = useState(false);
  const [pollFormChanged, setPollFormChanged] = useState(false);
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const [openScreenChangeConfirmPopup, setScreenChangeConfirmPopup] =
    useState(false);

  const onClose = () => {
    if (discussionFormChanged || pollFormChanged) {
      setOpenConfirmPopup(true);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      setAdjustResize();
      return () => {
        setAdjustPan();
      };
    }
  }, []);

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <CreateCommunityPostHeader
          currentScreen={currentScreen}
          onClose={onClose}
        />

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {currentScreen === 'discussion' ? (
            <CreateNewDIscussions
              route={route}
              setDiscussionFormChanged={setDiscussionFormChanged}
              setCurrentScreen={setCurrentScreen}
              setScreenChangeConfirmPopup={setScreenChangeConfirmPopup}
              fromScreen={route?.params?.fromScreen}
              communityDetails={route?.params?.communityDetails || null}
            />
          ) : (
            <CreateNewPoll
              route={route}
              setPollFormChanged={setPollFormChanged}
              setCurrentScreen={setCurrentScreen}
              setScreenChangeConfirmPopup={setScreenChangeConfirmPopup}
              fromScreen={route?.params?.fromScreen}
              communityDetails={route?.params?.communityDetails || null}
            />
          )}
        </View>
      </View>

      {openConfirmPopup && (
        <Confirm
          title={'Discard changes?'}
          subTitle={'If you discard, you will lose the current changes.'}
          discardCtaText={'Cancel'}
          continueCtaText={'Confirm'}
          onContinue={() => {
            navigation.goBack();
            setOpenConfirmPopup(false);
            setDiscussionFormChanged(false);
            setPollFormChanged(false);
          }}
          onBackgroundClick={() => setOpenConfirmPopup(false)}
          onDiscard={() => {
            setOpenConfirmPopup(false);
          }}
          subTitleStyle={{fontSize: 12, marginBottom: -10}}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={() => {
            setOpenConfirmPopup(false);
          }}
        />
      )}
      {openScreenChangeConfirmPopup && (
        <Confirm
          title={'Discard changes?'}
          subTitle={'If you discard, you will lose the current changes.'}
          discardCtaText={'Cancel'}
          continueCtaText={'Confirm'}
          onContinue={() => {
            if (currentScreen === 'poll') {
              setCurrentScreen('discussion');
            } else {
              setCurrentScreen('poll');
            }
            setScreenChangeConfirmPopup(false);
            setDiscussionFormChanged(false);
            setPollFormChanged(false);
          }}
          onBackgroundClick={() => setScreenChangeConfirmPopup(false)}
          onDiscard={() => {
            setScreenChangeConfirmPopup(false);
          }}
          subTitleStyle={{fontSize: 12, marginBottom: -10}}
          accessibilityLabel="confirm-popup-basic-fact"
          onCrossClick={() => {
            setScreenChangeConfirmPopup(false);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {marginTop: 65, flex: 1},
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
});
export default CreateCommunityPosts;
