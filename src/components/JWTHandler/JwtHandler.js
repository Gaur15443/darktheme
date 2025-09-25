import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as KeyChain from 'react-native-keychain';
import { setSignedIn } from '../../store/apps/CheckAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from '../../common/Spinner';
import SplashScreen from 'react-native-splash-screen';
import FakeSplashScreen from '../../screens/SplashScreen/splashScreen';
import { Platform, View } from 'react-native';
import { Portal } from 'react-native-paper';

function JwtHandler() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = await KeyChain?.getGenericPassword?.({
          username: 'imuwAccessToken',
        });
        const value = await AsyncStorage?.getItem?.('tempToken');
        let JWT = null;
        JWT = accessToken?.password;
        value && JWT
          ? dispatch(setSignedIn(true))
          : (dispatch(setSigniedIn(false)),
            await KeyChain?.resetGenericPassword?.());
        setTimeout(() => {
          SplashScreen?.hide?.();
        }, 1000);
      } catch (error) {
        SplashScreen?.hide?.();
        console.log(error);
        setIsLoading(false);
        await KeyChain?.resetGenericPassword?.();
      } finally {
        setIsLoading?.(false);
      }
    };

    fetchData?.();
  }, [dispatch]);

  if (isLoading) {
    return (
      <Portal>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Spinner />
        </View>
      </Portal>
    );
  }

  return null;
}

export default JwtHandler;
