import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Button,
  Card,
  Searchbar,
  Text,
  useTheme,
  Portal,
  Modal,
} from 'react-native-paper';
import React, { useContext, useEffect, useState } from 'react';
import CryptoJS from 'react-native-crypto-js';
import * as KeyChain from 'react-native-keychain';
import { getUserInfo } from '../../store/apps/userInfo';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { decrypt } from '../../utils/encryption';
import {
  PopupMessageValidation,
  checkInviteUser,
} from '../../store/apps/inviteSlice';
import {
  setHomeTooltipSeen,
  fetchInviteCount,
  setTreeinviteValue,
} from '../../store/apps/tree';
import Theme from '../../common/Theme';
import { fetchUserNotification } from '../../store/apps/notifications';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewTheme from '../../common/NewTheme';
import {
  setAstroLinking,
  setAstroLinkingParams,
} from '../../store/apps/astroLinking';

const ASTRO_URLS = {
  astrohome: 'AstroHome',
  horoscope: 'Horoscope',
  reports: 'Reports',
  matchmaking: 'MatchMaking',
  panchang: 'Panchang',
};

const InviteReceive = ({ currentRoutes }) => {
  let inviteCodeArr = [];
  let routeNameArr = [];
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigation = useNavigation();

  const [isExpire, setExpire] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [btnStatus, setBtnStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [inviteCodeDecoded, setInviteCodeDecoded] = useState(false);
  const [routeCheck, setRouteCheck] = useState('');
  const [routeNames, setRouteNames] = useState([]);
  const [communityId, setCommunityId] = useState(null);
  const [isNavigationEnabled, setNavigationEnabled] = useState(false);
  const [seperatedUrl, setSeperatedUrl] = useState(null);
  let isSignedIn,
    count = 0;
  const userInfo = useSelector(state => state.userInfo);
  const homePageToolTipSeen = useSelector(state => state.Tree.homeTooltipSeen);
  let isVisible = false;

  const handleInviteEvent = async url => {
    decodeInvitecode(url);
  };

  useEffect(() => {
    if (
      currentRoutes?.filter(route => route?.name === 'BottomTabs').length &&
      seperatedUrl &&
      userInfo?._id
    ) {
      if (seperatedUrl?.startsWith('?path=')) {
        const path = seperatedUrl?.split('?path=')[1];

        if (ASTRO_URLS[path]) {
          dispatch(setAstroLinking(ASTRO_URLS[path]));
          setSeperatedUrl(null);
          return;
        }
      }
      if (Array.isArray(seperatedUrl)) {
        navigation.navigate(seperatedUrl[3], {
          isClevertapPushNotification: true,
        });
      } else {
        navigation.navigate(seperatedUrl);
      }

      setSeperatedUrl(null);
    }

    if (
      currentRoutes?.filter(route => route?.name === 'BottomTabs').length &&
      communityId &&
      userInfo?._id
    ) {
      if (communityId) {
        navigation.reset({
          index: 0,
          routes: [
            { name: 'CommunityDetails', params: { item: { _id: communityId } } },
          ],
        });
      }

      setCommunityId(null);
    }
  }, [currentRoutes, seperatedUrl, userInfo?._id, communityId]);

  const decodeInvitecode = async url => {
    console.log('url', url);
    if (
      url &&
      typeof url === 'object' &&
      url.url &&
      url?.url.search('ref') > -1
    ) {
      const refVal = url?.url?.split?.('=') || [];
      // const refVal = url?.split?.('=') || [];
      const refEncrypt = refVal[1];

      if (refVal?.[2] === 'IN') {
        try {
          const bytes = CryptoJS?.AES?.decrypt(refEncrypt, 'ImeusWe104$#%98^');
          const inviteCode = bytes?.toString(CryptoJS?.enc?.Utf8);

          const accessToken = await KeyChain.getGenericPassword();
          //if user not loggedin(non-register user)
          // (added this condtion because, catch block 401 condition was not working always, as in ios api sometimes was giving 520)
          if (
            !accessToken?.password ||
            accessToken?.password?.toString?.() === '1'
          ) {
            setInviteCodeDecoded(false);
            await AsyncStorage.setItem('beforeLoggedin', JSON.stringify(url));
            return;
          }

          const userInfoId = await dispatch(getUserInfo()).unwrap();
          const isPresent = inviteCodeArr.includes(inviteCode);
          routeNameArr = [];
          setTimeout(() => {
            if (inviteCode && userInfoId) {
              if (!isPresent) {
                inviteCodeArr.push(inviteCode);
                validateInviteRequest(inviteCode, userInfoId?.data?._id);
              }
            }
          }, 1000);
        } catch (error) {
          if (error?.message?.includes('401')) {
            setInviteCodeDecoded(false);
            await AsyncStorage.setItem('beforeLoggedin', JSON.stringify(url));
          }
        }
      }
      if (refVal?.[2] === 'CO') {
        const bytes = CryptoJS?.AES?.decrypt(refEncrypt, 'ImeusWe104$#%98^');
        const decryptedId = bytes?.toString(CryptoJS?.enc?.Utf8);
        if (decryptedId) {
          setCommunityId(decryptedId);
        }
      }

      if (refVal?.[2] === 'AP') {
        const bytes = CryptoJS?.AES?.decrypt(refEncrypt, 'ImeusWe104$#%98^');
        const decryptedId = bytes?.toString(CryptoJS?.enc?.Utf8);
        if (decryptedId) {
          setAstroLinkingParams({
            path: 'AstroProfile',
            params: {
              astroId: astrologerId,
            },
          });
        }
      }
    } else if (url?.url?.includes('CommunityDetails')) {
      console.log('urlelse if', url);
      const encryptedId = url?.url?.split('CommunityDetails/')[1];
      console.log('encryptedId', encryptedId);

      try {
        // Client-side decryption
        const originalId = decrypt(encryptedId);
        console.log('Decrypted ID:', originalId);
        if (originalId) {
          // Use reset to force navigation even if already on the screen
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'CommunityDetails',
                params: {
                  item: { _id: originalId },
                  timestamp: new Date().getTime(), // Add timestamp to force refresh
                },
              },
            ],
          });
        } else {
          // Show error message if decryption fails
          console.log('Decryption failed');
          Toast.show({
            type: 'error',
            text1: 'Invalid link',
            text2: 'The link appears to be invalid or expired',
          });
        }
      } catch (error) {
        console.error('Error decrypting ID:', error);
        // Show error message if decryption fails
        Toast.show({
          type: 'error',
          text1: 'Failed to process the link',
          text2: 'Please try again later',
        });
      }
    } else {
      if (url?.url?.includes('publicStory')) {
        const seperatedUrlTemp = url?.url?.split('/');
        setSeperatedUrl(seperatedUrlTemp);
      } else {
        const seperatedUrlTemp = url?.url?.split('/')?.pop();
        setSeperatedUrl(seperatedUrlTemp);
      }
    }
  };

  const validateInviteRequest = async (inviteCode, userinfoId) => {
    const data = {
      inviteCode: Number(inviteCode),
      recieverId: userinfoId,
    };

    setTimeout(() => {
      inviteCodeArr = [];
    }, 5000);
    try {
      setRouteNames([]);
      const response = await dispatch(PopupMessageValidation(data));

      if (response && response.payload && response.payload.btnStatus) {
        const res = await dispatch(checkInviteUser(data));
        // dispatch(setRedDot(true));
        if (!res.error) {
          isVisible = true;
          setOpen(true);
          setDialogContent(response.payload.message);
          setBtnStatus(response.payload.btnStatus);
          setExpire(false);
        }

        if (response && res && res.error && res.error.message) {
          isVisible = true;
          setDialogContent(res.error.message);
          setOpen(true);
          setExpire(true);
          setBtnStatus(false);
        }
      } else if (response && response.error && response.error.message) {
        isVisible = true;
        setOpen(true);
        setExpire(false);
        setDialogContent(response.error.message);
        setBtnStatus(false);
      }
      await AsyncStorage.removeItem('beforeLoggedin');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  const sendNotification = async () => {
    try {
      setOpen(false);
      setBtnStatus(false);
      const res = await dispatch(fetchInviteCount()).unwrap();
      dispatch(setTreeinviteValue(true));
      navigation.navigate('InviteSheetModal', {
        inviteNotifications: res?.notifications,
      });
    } catch (__error) { }
  };

  const handleClose = () => {
    try {
      setRouteNames([]);
      setIsOpenDialog(false);
      setBtnStatus(false);
      setOpen(false);
      dispatch(fetchUserNotification(1)).unwrap();
    } catch (__error) { }
  };

  useEffect(() => {
    const linkaddListeners = () => {
      try {
        // when the app is opened in background

        Linking.addEventListener('url', event => handleInviteEvent(event));

        // when the app is closed

        Linking.getInitialURL()
          .then(url => decodeInvitecode({ url: url }))
          .catch(console.warn);

        return () => {
          // clears listener when component unmounts
          Linking.removeAllListeners('url');
        };
      } catch (error) {
        Alert.alert(JSON.stringify(error));
      }
    };
    linkaddListeners();
  }, []);

  useEffect(() => {
    const listenerUnsubscribe = navigation.addListener('state', val => {
      setRouteCheck('');

      const count = routeNames.reduce((acc, current) => {
        // If the current element matches the search element, increment the accumulator
        if (current === 'BottomTabs') {
          return acc + 1;
        }
        // Otherwise, return the accumulator unchanged
        return acc;
      }, 0);
      if (count < 2) {
        routeNames.push(
          val?.data?.state?.routes?.[val?.data?.state?.index]?.name,
        );
      } else {
        routeNames.splice(0, routeNames.length);
      }
      if (
        val?.data?.state?.routes?.[val?.data?.state?.index]?.name ==
        'ProfileDetails' ||
        val?.data?.state?.routes?.[val?.data?.state?.index]?.name ==
        'EmailVerification'
      ) {
        setRouteCheck('signUp');
      } else {
        setRouteCheck('loggedIn');
      }
    });
    return () => listenerUnsubscribe();
  }, [navigation]);

  useEffect(() => {
    const getItem = async () => {
      try {
        if (
          userInfo?.personalDetails?.name &&
          userInfo?.personalDetails?.gender &&
          userInfo?.personalDetails?.lastname &&
          !inviteCodeDecoded &&
          routeCheck === 'loggedIn'
        ) {
          const getStorage = await AsyncStorage.getItem('beforeLoggedin');
          if (getStorage) {
            setInviteCodeDecoded(true);
            setTimeout(async () => {
              await decodeInvitecode(JSON.parse(getStorage));
              setRouteCheck('');
              routeNameArr = [];
              // clearTimeout(timeout);
            }, 2000);
          }
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    };

    getItem();
  }, [
    userInfo?.personalDetails?.name,
    userInfo?.personalDetails?.gender,
    routeCheck,
  ]);

  return (
    <Portal>
      <Modal
        visible={open}
        animationType="fade"
        onRequestClose={handleClose}
        onDismiss={handleClose}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 190,
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                width: '90%',
                padding: 20,
                borderRadius: 5,
              }}>
              <Text style={styles.title}>{dialogContent}</Text>
              {isExpire && (
                <Text style={styles.subtitle}>
                  Please ask the tree owner to generate and share a new invite
                  link.
                </Text>
              )}
              {btnStatus && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    accessibilityLabel="view"
                    style={styles.button}
                    onPress={sendNotification}>
                    <Text style={styles.buttonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel="ignore"
                    style={[styles.button, styles.outlinedButton]}
                    onPress={handleClose}>
                    <Text
                      style={[styles.buttonText, styles.outlinedButtonText]}>
                      Ignore
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {open && !btnStatus && (
                <TouchableOpacity
                  id="close"
                  style={[styles.button, styles.closeButton]}
                  onPress={handleClose}>
                  <Text style={[styles.buttonText, styles.closeButtonText]}>
                    Close
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};
const styles = StyleSheet.create({
  content: {
    backgroundColor: Theme.light.onWhite100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    color: Theme.dark.scrim,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: 'black',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NewTheme.colors.primaryOrange,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: NewTheme.colors.primaryOrange,
  },
  closeButton: {
    backgroundColor: NewTheme.colors.primaryOrange,
  },
  buttonText: {
    color: Theme.light.onWhite100,
    fontSize: 18,
    fontWeight: 'bold',
  },
  outlinedButtonText: {
    color: NewTheme.colors.primaryOrange,
  },
  closeButtonText: {
    color: Theme.light.onWhite100,
  },
});

export default InviteReceive;