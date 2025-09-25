import React, {useEffect} from 'react';
import {TelephonyAxios} from '../plugin/Axios';
import {decryptFirebaseToken} from '../utils/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FirebaseKeyConfig({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    (async () => {
      try {
        const data = await TelephonyAxios.get('/getFirebaseToken');
        const token = decryptFirebaseToken(data?.data?.token);
        await AsyncStorage.setItem('firebaseSecureToken', token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  return <>{children}</>;
}
