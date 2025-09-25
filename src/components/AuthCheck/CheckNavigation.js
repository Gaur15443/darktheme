import React, {useState, useEffect} from 'react';
import {AppStack, AuthStack} from '../../navigation';
import * as KeyChain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NavigationContainer} from '@react-navigation/native';

const CheckNavigation = async () => {
  const [getAccessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = await KeyChain.getGenericPassword();
        const value = await AsyncStorage.getItem('tempToken');
        value ? setAccessToken(accessToken?.password) : setAccessToken(null);
      } catch (error) {
        console.error('Error fetching access token:', error);
        if (getAccessToken === null) {
          await KeyChain.resetGenericPassword();
        }
      }
    };

    fetchData();
  }, []);

  return (
    <NavigationContainer>
      {getAccessToken !== null ? <AppStack /> : <AuthStack />};
    </NavigationContainer>
  );
};

export default CheckNavigation;
