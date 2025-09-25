import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import AstroMuteIcon from '../../../../images/Icons/AstroMicMuteIcon';
import AstroSpeakerIcon from '../../../../images/Icons/AstroSpeakerIcon';
import CallDecline from '../../../../images/Icons/CallDecline';
import {AgoraInitExposedFunctions} from '../AgoraInit';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';
import ErrorBoundary from '../../../../common/ErrorBoundary';
import {useWallet} from '../../../../../src/context/WalletContext';

interface CallButtons {
  onEndCall: () => undefined | void;
  agoraRef: React.RefObject<AgoraInitExposedFunctions>;
  disableAllButtons: boolean;
}

export default function CallButtons({
  onEndCall,
  agoraRef,
  disableAllButtons = false,
}: CallButtons) {
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const {fetchWalletData} = useWallet();
  const userId = useSelector((state: RootState) => state?.userInfo?._id);

  function toggleMute() {
    if (agoraRef.current) {
      if (mute) {
        agoraRef.current.unMute();
      } else {
        agoraRef.current.mute();
      }
    }
    setMute(!mute);
  }

  function toggleSpeaker() {
    if (agoraRef.current) {
      if (speaker) {
        agoraRef.current.disableSpeaker();
      } else {
        agoraRef.current.enableSpeaker();
      }
    }
    setSpeaker(!speaker);
  }

  const handleEndCall = () => {
    onEndCall();
    setTimeout(async () => {
      //@ts-ignore
      await fetchWalletData(userId);
      console.log('refreshing wallet balance');
    }, 5000);
  };

  return (
    <ErrorBoundary>
      <View style={{width: '100%'}}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={toggleMute}
            disabled={disableAllButtons}
            style={[
              styles.funcButtons,
              {backgroundColor: mute ? 'white' : 'rgba(255, 255, 255, 0.10)'},
              !disableAllButtons ? {} : {...styles.disabled},
            ]}>
            <AstroMuteIcon stroke={mute ? 'black' : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disableAllButtons}
            onPress={toggleSpeaker}
            style={[
              styles.funcButtons,
              {
                backgroundColor: speaker
                  ? 'white'
                  : 'rgba(255, 255, 255, 0.10)',
              },
              disableAllButtons ? {...styles.disabled} : {},
            ]}>
            <AstroSpeakerIcon stroke={speaker ? 'black' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{width: '100%', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={handleEndCall}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CallDecline />
        </TouchableOpacity>
      </View>
    </ErrorBoundary>
  );
}
const styles = StyleSheet.create({
  funcButtons: {
    padding: 20,
    borderRadius: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  disabled: {
    opacity: 0.6,
  },
});
