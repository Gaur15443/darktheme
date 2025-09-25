// ** React Imports
import {createContext, useContext, useEffect, useState} from 'react';
import * as Keychain from 'react-native-keychain';
import {useDispatch, useSelector} from 'react-redux';
import {setSignedIn} from '../store/apps/CheckAuth';
import {accountDelete} from '../store/apps/fetchUserProfile';
// ** Axios
import axios from 'axios';
import {getUserInfo} from '../store/apps/userInfo';
import authConfig from '../configs';
import Axios, {TelephonyAxios} from '../plugin/Axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {Alert, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager} from 'react-native-fbsdk-next';
import {mixpanel} from '../../App';

import Toast from 'react-native-toast-message';
import {getDeviceInfo} from '../utils/format';
import {getTimezone} from './../utils/index';
import CleverTap from 'clevertap-react-native';
import RegisterVoipService from '../configs/Voip/RegisterVoip';
import {registerVoipToken} from '../store/apps/agora';

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  selectedRadio: '',
  setSelectedRadio: () => null,
  setMsg: () => null,
  msg: '',
  // login: () => Promise.resolve(),
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  userdelete: () => Promise.resolve(),
};

const timezone = getTimezone();

const AuthContext = createContext(defaultProvider);

async function removeVoipTokenFromServer() {
  try {
    await TelephonyAxios.put(`/resetVoidToken`);
  } catch (error) {
    return;
  }
}

const AuthProvider = ({children}) => {
  // ** States
  const [user, setUser] = useState(defaultProvider?.user);
  const [loading, setLoading] = useState(defaultProvider?.loading);
  const dispatch = useDispatch();
  const [selectedRadio, setSelectedRadio] = useState('');
  const [msg, setMsg] = useState('');
  const resData = useSelector(state => state?.userInfo?._id);
  const emailData = useSelector(state => state?.userInfo?.email);
  const personalDetails = useSelector(
    state => state?.userInfo?.personalDetails,
  );
  const userManagementToastsConfig = useSelector(
    state => state.userManagementToasts.userManagementToastsConfig,
  );
  // ** Hooks useEffect

  const deviceModel = DeviceInfo?.getModel();
  const osVersion = DeviceInfo?.getSystemVersion();
  const appVersion = DeviceInfo?.getVersion();
  const userId = useSelector(state => state?.userInfo?._id);
  const _userInfo = useSelector(state => state.userInfo);

  // Notifications
  const setupPushNotifications = async () => {
    const checkPermissionAndRetriveToken = async () => {
      if (Platform.OS === 'ios') {
        CleverTap.registerForPush();
      }
      if (Platform?.OS === 'android') {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
      const authStatus = await messaging?.()?.requestPermission?.();
      const enabled =
        authStatus === messaging?.AuthorizationStatus?.AUTHORIZED ||
        authStatus === messaging?.AuthorizationStatus?.PROVISIONAL;
      if (enabled) {
        retrieveFCMToken(); // Check for existing token after permission is granted
      }
    };

    // Get Device Token From LocalStorage
    async function retrieveFCMToken() {
      // Retrieve FCM token from AsyncStorage
      const fcmToken = await AsyncStorage?.getItem?.('fcmToken');
      const generateFcmToken = await messaging?.()?.getToken?.();
      console.log('generateFcmToken', fcmToken);
      if (fcmToken !== generateFcmToken) {
        registerAppWithFCM();
      }
      if (
        _userInfo?.deviceInfo?.deviceToken &&
        _userInfo?.deviceInfo?.deviceToken !== fcmToken
      ) {
        registerAppWithFCM();
      }
    }

    async function registerAppWithFCM() {
      await messaging?.()?.registerDeviceForRemoteMessages?.();
      const fcmToken = await messaging?.()?.getToken?.();
      // Store FCM token in AsyncStorage
      await AsyncStorage?.setItem?.('fcmToken', fcmToken);

      const data = {
        deviceInfo: {
          appVersion: appVersion,
          platForm: Platform?.OS,
          osVersion: osVersion,
          model: deviceModel,
          operatingSystem: Platform?.OS,
          deviceToken: fcmToken,
        },
      };

      try {
        if (userId) {
          const apiUrl = `${authConfig?.appBaseUrl}/login/updateDevice/${userId}`;
          await axios.post(apiUrl, data);
        }
      } catch (error) {}
    }
    checkPermissionAndRetriveToken?.();
  };

  //   const userId = userInfo.value?._id;

  //   const username = env.CUSTOMER_IO_SITEID;
  //   const password = env.CUSTOMER_IO_APIKEY;
  //   const headers = new Headers();
  //   headers.append(
  //     'Authorization',
  //     'Basic ' + base64.encode(username + ':' + password),
  //   );
  //   const apiUrl = `https://track.customer.io/api/v1/customers/${userId}/devices`;
  //   const payload = {
  //     device: {
  //       id: pushDeviceToken.value ? pushDeviceToken.value : ' ',
  //       platform: Capacitor?.getPlatform(),
  //       last_used: Math.floor(Date.now() / 1000),
  //       attributes: {
  //         device_os: Capacitor?.getPlatform(),
  //         device_model: deviceInfo?.model,
  //         device_os_version: deviceInfo?.osVersion,
  //         app_version: versionNo.value,
  //         cio_sdk_version: '3.6.0',
  //         push_enabled: isPushNotificationEnbale.value,
  //       },
  //     },
  //   };
  //   if (Capacitor.isNativePlatform()) {
  //     try {
  //       const response = await fetch(apiUrl, {
  //         method: 'PUT',
  //         headers: headers,
  //         body: JSON.stringify(payload),
  //       });
  //       store.dispatch('common/setCustomerIoPushNotify', true);
  //       if (response) {
  //         await Preferences.set({
  //           key: 'deviceTokenCustIO',
  //           value: 'true',
  //         });
  //       }
  //       console.log(response.json());
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // };

  async function sendTokenToBackend(_token) {
    try {
      const payload = {
        token: _token,
      };
      await AsyncStorage.setItem('voipToken', _token);
      await dispatch(registerVoipToken(payload)).unwrap();
    } catch (error) {
      console.error(error);
    }
  }

  function registerVoipService() {
    const VoipService = RegisterVoipService.getInstance();
    VoipService.registerAndRetriveToken(data => {
      if (data?._token?.length > 0) {
        sendTokenToBackend(data._token);
      }
    });
  }

  useEffect(() => {
    if (userId) {
      setupPushNotifications?.();
      registerVoipService();
    }
  }, [userId]);

  const handleLogin = async (params, errorCallback = () => null) => {
    const deviceInfo = getDeviceInfo?.();

    if (params?.login === 'normalLogin') {
      const data = {
        email: params?.email,
        password: params?.password,
        deviceInfo,
        timezone,
      };
      try {
        const response = await Axios.post(
          `${authConfig?.authBaseUrl}/user/login/v2`,
          data,
        );
        const mainResponce = handleResponse(response);

        const cleverTapProps = {
          Name: `${response?.data?.personalDetails?.name} ${response?.data?.personalDetails?.lastname}`,
          Email: response?.data?.email,
          Identity: response?.data?._id,
          Phone: response?.data?.mobileNo,
          Gender:
            response?.data?.personalDetails?.gender === 'male' ? 'M' : 'F',
          DOB: response?.data?.birthDetails?.dob
            ? new Date(response?.data?.birthDetails?.dob)
            : null,
        };

        CleverTap.onUserLogin(cleverTapProps);
        CleverTap.recordEvent('login', cleverTapProps);
        /* customer io event chagnes  start */
        // Call this method whenever you are ready to identify a user
        // if (data?.email && response.data?._id) {
        mixpanel?.identify?.(response?.data?._id);
        mixpanel?.getPeople?.()?.set?.({
          $user_id: response?.data?._id,
          $email: response?.data?.email,
          $name:
            response?.data?.personalDetails?.name +
            ' ' +
            response?.data?.personalDetails?.lastname,
        });

        mixpanel?.track?.('login', {
          user_id: response?.data?._id,
          email: data?.email,
          userFirstname: response?.data?.personalDetails?.name,
          userLastname: response?.data?.personalDetails?.lastname,
          gender: response?.data?.personalDetails?.gender,
        });

        return mainResponce;
      } catch (error) {
        errorCallback?.(error);
        return error;
      }
    }
    if (params?.login === 'Google') {
      const token = {token: params?.userInfo?.data?.idToken};
      try {
        const res = await axios.post(
          `${authConfig?.authBaseUrl}/user/signup/google`,
          token,
          deviceInfo,
          timezone,
        );
        const mainResponce = handleResponse?.(res);

        /* customer io event chagnes  start */
        if (res?.data?._id) {
          mixpanel?.identify?.(res?.data?._id);
          mixpanel?.getPeople?.()?.set?.({
            $user_id: res?.data?._id,
            $email: res?.data?.email,
            $name:
              res?.data?.personalDetails?.name +
              ' ' +
              res?.data?.personalDetails?.lastname,
          });
          const cleverTapProps = {
            Name: `${res?.data?.personalDetails?.name} ${res?.data?.personalDetails?.lastname}`, // String
            Identity: res?.data?._id, // String or number
            Email: res?.data?.email, // Phone (with the country code, starting with +)
            Gender: res?.data?.personalDetails?.gender,
          };

          CleverTap.onUserLogin(cleverTapProps);
          CleverTap.recordEvent('google_login', cleverTapProps);

          mixpanel.track('googleLogin', {
            user_id: res?.data?._id,
            email: res?.data?.email,
            userFirstname: res?.data?.personalDetails?.name,
            userLastname: res?.data?.personalDetails?.lastname,
            gender: res?.data?.personalDetails?.gender,
          });

          /* customer io event chagnes  end */
        }
        return mainResponce;
      } catch (error) {
        Toast?.show?.({
          type: 'error',
          text1: 'Google error is: ' + error,
        });
        return error;
      }
    }
    if (params?.login === 'Apple') {
      const info = {
        authorizationCode: params?.appleAuthRequestResponse?.authorizationCode,
        email: params?.appleAuthRequestResponse?.email,
        familyName: params?.appleAuthRequestResponse?.fullName?.familyName,
        givenName: params?.appleAuthRequestResponse?.fullName?.givenName,
        identityToken: params?.appleAuthRequestResponse?.identityToken,
        user: params?.appleAuthRequestResponse?.user,
        nonce: params?.appleAuthRequestResponse?.nonce,
        realUserStatus: params?.appleAuthRequestResponse?.realUserStatus,
        deviceInfo,
        timezone,
      };
      try {
        const res = await axios.post(
          `${authConfig?.authBaseUrl}/user/signup/apple`,
          {...info},
        );
        if (res) {
          const mainResponce = handleResponse?.(res);

          /* customer io event chagnes  start */
          if (res?.data?._id) {
            mixpanel?.identify?.(res?.data?._id);
            mixpanel?.getPeople?.().set?.({
              $user_id: res?.data?._id,
              $email: res?.data?.email,
              $name:
                res?.data?.personalDetails?.name +
                ' ' +
                res?.data?.personalDetails?.lastname,
            });
            mixpanel?.track?.('appleLogin', {
              user_id: res?.data?._id,
              email: res?.data?.email,
              userFirstname: res?.data?.personalDetails?.name,
              userLastname: res?.data?.personalDetails?.lastname,
              gender: res?.data?.personalDetails?.gender,
            });
            const cleverTapProps = {
              Name: `${res?.data?.personalDetails?.name} ${res?.data?.personalDetails?.lastname}`, // String
              Identity: res?.data?._id, // String or number
              Email: res?.data?.email, // Phone (with the country code, starting with +)
              Gender: res?.data?.personalDetails?.gender,
            };

            CleverTap.onUserLogin(cleverTapProps);
            CleverTap.recordEvent('apple_login', cleverTapProps);
          }
          /* customer io event chagnes  end */

          return mainResponce;
        }
      } catch (error) {
        if (
          userManagementToastsConfig?.social?.errors?.[
            error?.response?.data?.error
          ]
        ) {
          Toast?.show?.({
            type: 'error',
            text1:
              'Apple error is :' +
              userManagementToastsConfig?.social?.errors?.[
                error?.response?.data?.error
              ],
          });
        } else {
          Toast?.show?.({
            type: 'error',
            text1: 'Apple error is :' + error?.message,
          });
        }
        return error;
      }
    }
    if (params?.login === 'Facebook') {
      const data = {
        id: params?.allData?.result?.id,
        accessToken: params?.allData?.data?.accessToken,
        email: params?.allData?.result?.email,
        first_name: params?.allData?.result?.first_name,
        last_name: params?.allData?.result?.last_name,
        name: params?.allData?.result?.name,
        applicationID: params?.allData?.data?.applicationID,
        dataAccessExpirationTime:
          params?.allData?.data?.dataAccessExpirationTime,
        expirationTime: params?.allData?.data?.expirationTime,
        lastRefreshTime: params?.allData?.data?.lastRefreshTime,
        userID: params?.allData?.data?.userID,
        deviceInfo,
        timezone,
      };

      try {
        const res = await axios.post(
          `${authConfig?.authBaseUrl}/user/signup/facebook`,
          data,
        );
        if (res) {
          const mainResponce = handleResponse?.(res);
          /* customer io event chagnes  start */
          if (res?.data?._id) {
            mixpanel?.identify?.(res?.data?._id);
            mixpanel?.getPeople?.()?.set?.({
              $user_id: res?.data?._id,
              $email: res?.data?.email,
              $name:
                res?.data?.personalDetails?.name +
                ' ' +
                res?.data?.personalDetails?.lastname,
            });
            mixpanel.track('facebookLogin', {
              user_id: res?.data?._id,
              email: res?.data?.email,
              userFirstname: res?.data?.personalDetails?.name,
              userLastname: res?.data?.personalDetails?.lastname,
              gender: res?.data?.personalDetails?.gender,
            });
            const cleverTapProps = {
              Name: `${res?.data?.personalDetails?.name} ${res?.data?.personalDetails?.lastname}`, // String
              Identity: res?.data?._id, // String or number
              Email: res?.data?.email, // Phone (with the country code, starting with +)
              Gender: res?.data?.personalDetails?.gender,
            };

            CleverTap.onUserLogin(cleverTapProps);
            CleverTap.recordEvent('facebook_login', cleverTapProps);
          }
          /* customer io event chagnes  end */

          return mainResponce;
        }
      } catch (error) {
        if (
          userManagementToastsConfig?.social?.errors?.[
            error?.response?.data?.error
          ]
        ) {
          Toast?.show?.({
            type: 'error',
            text1:
              'Facebook error is :' +
              userManagementToastsConfig?.social?.errors?.[
                error?.response?.data?.error
              ],
          });
        } else {
          Toast?.show?.({
            type: 'error',
            text1: 'Facebook error is :' + error?.message,
          });
        }
        return;
      }
    }
  };

  async function generateRandomNumber(length) {
    const randomNumber = Array?.from({length}, () =>
      Math?.floor(Math?.random?.() * 10),
    )?.join('');
    await AsyncStorage.setItem(
      'tempToken',
      JSON?.stringify?.(randomNumber || {}),
    );
  }

  async function handleResponse(response, from) {
    generateRandomNumber?.(8);

    /* response.config.data this is not required for API Call
       This is required for Tree Login
      _______________________________________________________

       response.data.accessToken is for api calls is required
    */
    // const configData = JSON.parse(response.config.data);

    // await AsyncStorage.setItem('treeAuth', JSON.stringify(configData));

    await Keychain?.setGenericPassword(
      'imuwAccessToken',
      response?.data?.accessToken,
    );

    if (Platform.OS === 'android') {
      CleverTap.createNotificationChannel(
        'CtRNS',
        'Promotional Notifications',
        'This channel is used for promotional notifications',
        5,
        true,
      ); // The notification channel importance can have any value from 1 to 5. A higher value means a more interruptive notification.
    }
    //await Keychain.setGenericPassword(configData.token, 'Tree');

    dispatch(setSignedIn(true));
    dispatch(getUserInfo());
    const loginSucess = true;
    return loginSucess;
  }

  const clearAsyncStorageExcept = async keysToKeep => {
    try {
      const allKeys = await AsyncStorage?.getAllKeys?.();
      const keysToRemove = allKeys?.filter(
        key => !keysToKeep?.some(prefix => key?.startsWith?.(prefix)),
      );
      await AsyncStorage?.multiRemove(keysToRemove);
    } catch (error) {}
  };

  const handleLogout = async () => {
    removeVoipTokenFromServer();
    await Keychain?.resetGenericPassword?.();
    const keysToKeep = ['consentStatus', 'LOGOUT_ALL_USERS'];
    clearAsyncStorageExcept(keysToKeep);
    //await AsyncStorage.clear();
    setUser(null);
    // the catch is to avoid errors for users not logged with google.
    await GoogleSignin?.signOut?.()?.catch?.(_err => undefined);
    LoginManager?.logOut?.();
    dispatch(setSignedIn(false));
    dispatch({type: 'LOGOUT'});
  };

  const handleEmailVerification = async (payload, cb = () => null) => {
    try {
      const response = await Axios.post(
        `${authConfig?.authBaseUrl}/user/verifyEmail`,
        payload,
      );

      await handleResponse(response, 'emailVerification');
    } catch (error) {
      cb(error);
    }
  };

  const handleMobileVerification = async (payload, cb = () => null) => {
    try {
      const response = await Axios.post(
        `${authConfig.authBaseUrl}/user/verifyMobile`,
        payload,
      );
      await handleResponse(response, 'MobilelVerification');
    } catch (error) {
      cb(error);
    }
  };
  const handelDelete = async () => {
    if (resData) {
      const data = {
        UserId: resData,
        Email: emailData,
        Firstname: personalDetails?.name,
        Lastname: personalDetails?.lastname,
        Subject: selectedRadio,
        Description: msg,
      };
      dispatch(accountDelete(data));

      await Keychain?.resetGenericPassword?.();
      const keysToKeep = ['consentStatus', 'LOGOUT_ALL_USERS'];
      clearAsyncStorageExcept(keysToKeep);
      setUser(null);
      await GoogleSignin?.signOut?.()?.catch?.(_err => undefined);
      LoginManager?.logOut?.();
      dispatch(setSignedIn(false));
      dispatch({type: 'LOGOUT'});
    }
  };

  const values = {
    user,
    loading,
    setUser,
    selectedRadio,
    setSelectedRadio,
    msg,
    setMsg,
    setLoading,
    verifyEmail: handleEmailVerification,
    verifyMobile: handleMobileVerification,
    login: handleLogin,
    logout: handleLogout,
    userdelete: handelDelete,
  };
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
export const AuthContextFunc = () => {
  const context = useContext(AuthContext);
  return context;
};
export {AuthContext, AuthProvider};
