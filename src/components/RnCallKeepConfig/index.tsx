import React, { ReactNode, useEffect } from 'react';
import RNCallKeep from 'react-native-callkeep';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Platform } from 'react-native';
import { Track } from '../../../App';
interface RnCallKeepConfigProps {
  children: ReactNode;
}

interface Options {
  ios: {
    appName: string;
  };
}

const _options: Options = {
  ios: {
    appName: 'RN VoIP Demo',
  },
};

export default function RnCallKeepConfig({ children }: RnCallKeepConfigProps) {
  const isSignedIn = useSelector(
    (state: RootState) => state?.CheckAuth?.isSignedIn,
  );

  const userData = useSelector(
    (state: RootState) => state.userInfo,
  );

  function handleIncomingCall(data: { callUUID: string }): void {
    console.log('answer incomming call', data);
    RNCallKeep.displayIncomingCall(
      '20d6e9e8-1160-4452-8e9a-1c1fce4ca3e3',
      '1234567890',
      'imeuswe',
      'generic',
      true,
    );
  }

  function handleDecline(): void {
    console.log('Call declined');
  }

  function setup(): void {
    // @ts-ignore
    RNCallKeep.setup(_options).then(accepted => {
      console.log('CallKeep setup completed:', accepted);
    });
  }

  function registerEventListeners(): void {
    RNCallKeep.addEventListener('answerCall', async _ => handleIncomingCall(_));
    RNCallKeep.addEventListener('endCall', async () => handleDecline());
  }

  function cleanUp(): void {
    if (Platform.OS == 'ios') {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
    }
  }

  useEffect(() => {
    if (Platform.OS === 'ios' && isSignedIn) {
      setup();
      registerEventListeners();
    }
    return () => {
      cleanUp();
    };
  }, [isSignedIn]);

  return <>{children}</>;
}
