import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import VersionCheck from 'react-native-version-check';
import {AuthContextFunc} from '../../context/AuthContext';
import remoteConfig from '@react-native-firebase/remote-config';
import config from 'react-native-config';

const GlobalLogout = ({children}) => {
  const remoteKey = 'LOGOUT_ALL_USERS';
  const {logout} = AuthContextFunc?.();
  let environment = config?.AUTH_BASE_URL;
  environment = environment?.includes('uat')
    ? 'uat'
    : environment?.includes('dev')
      ? 'dev'
      : 'prod';
  const appVersion = VersionCheck?.getCurrentVersion?.();

  async function validateAndCheckAsyncStorage(remoteData) {
    const remoteJson = JSON?.parse(remoteData || {});

    //if current env is not mentioned in the env dont logout
    if (!remoteJson?.env?.includes?.(environment)) {
      return false;
    }

    //if logout flage is false dont logout
    if (!remoteJson?.logout) {
      return false;
    }

    const value = await AsyncStorage?.getItem?.(remoteKey);
    if (value) {
      const asyncJson = JSON?.parse?.(value || {});
      const appVersionIsIncluded =
        remoteJson?.app_version?.includes(appVersion);
      // if my curret app version is not in the app version list dont logout
      if (
        !appVersionIsIncluded &&
        !remoteJson?.app_version?.includes?.('ALL')
      ) {
        return false;
      }
      //if unique id is same then dont logout
      if (
        remoteJson?.uniqueId[environment] === asyncJson?.uniqueId[environment]
      ) {
        return false;
      }

      return true;
    }
    return true;
  }

  async function logoutUser(remoteData) {
    const remoteJson = JSON?.parse?.(remoteData || {});
    //if logout is mentioned for all versions
    if (remoteJson?.app_version?.includes?.('ALL')) {
      //do logout
      logout();
      await AsyncStorage?.setItem?.(
        remoteKey,
        JSON?.stringify?.(remoteJson || {}),
      );
    } else {
      //logout if current app version in mentioned to be logged out
      if (remoteJson?.app_version?.includes?.(appVersion)) {
        //do logout
        logout?.();
        await AsyncStorage?.setItem?.(
          remoteKey,
          JSON?.stringify?.(remoteJson || {}),
        );
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await remoteConfig?.()?.setConfigSettings?.({
          minimumFetchIntervalMillis: 3600000, // 1 hour
        });
        await remoteConfig?.()?.fetchAndActivate?.();
        const getRemoteConfigData = remoteConfig?.()
          ?.getValue?.(remoteKey)
          ?.asString?.();
        if (
          typeof getRemoteConfigData === 'string' &&
          getRemoteConfigData?.length &&
          (await validateAndCheckAsyncStorage?.(getRemoteConfigData))
        ) {
          await logoutUser?.(getRemoteConfigData);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error?.message,
        });
      }
    })();
  }, []);
  return <>{children}</>;
};

export default GlobalLogout;
