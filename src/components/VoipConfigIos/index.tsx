import React, {ReactNode, useEffect} from 'react';
import {Alert, Platform} from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../store';
import authConfig from '../../configs';
import axios from 'axios';
import RegisterVoipService from '../../configs/Voip/RegisterVoip';
import {registerVoipToken} from '../../store/apps/agora';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoipConfigProps {
  children: ReactNode;
}

export default function VoipConfigIos({children}: VoipConfigProps) {
  const isSignedIn = useSelector(
    (state: RootState) => state?.CheckAuth?.isSignedIn,
  );
  const userInfo = useSelector((state: RootState) => state?.userInfo);
  const dispatch = useDispatch<AppDispatch>();

  async function sendTokenToBackend(_token: string) {
    try {
      const payload = {
        token: _token,
      };
      const existingToken = await AsyncStorage.getItem('voipToken');
      if (existingToken === userInfo?.deviceInfo?.voipDeviceToken) {
        return;
      }

      await AsyncStorage.setItem('voipToken', _token);
      await dispatch(registerVoipToken(payload)).unwrap();
    } catch (error) {
      console.error(error);
    }
  }

  function registerVoipService() {
    const VoipService = RegisterVoipService.getInstance();
    VoipService.registerAndRetriveToken((data: {_token: string}) => {
      if (data?._token?.length > 0) {
        sendTokenToBackend(data._token);
      }
    });
  }

  useEffect(() => {
    if (isSignedIn && Platform.OS === 'ios' && userInfo?._id) {
      registerVoipService();
    }
  }, [isSignedIn, userInfo]);

  return <>{children}</>;
}
