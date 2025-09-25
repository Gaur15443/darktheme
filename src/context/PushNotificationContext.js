import React, {createContext, useContext, useState, useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {useNavigation, CommonActions} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {markNotificationAsViewedApi} from '../store/apps/notifications';
import {
  getprivateTreeList,
  getTree,
  getTreeDetailsByGroupId,
  resetTreeItem,
  setFamilyName,
  setGroupId,
  setTreeItemFromPrivateTree,
  setTreeId,
} from '../store/apps/tree';
import {updateFamilyType} from '../store/apps/familyType';
import {getCommunityDetails} from '../store/apps/getCommunityDetails';
import CleverTap from 'clevertap-react-native';
import {getGroupData} from '../store/apps/memberDirectorySlice';
import {getUserInfo} from '../store/apps/userInfo';
import incommingCallNotificationHandler from '../configs/Calls/IncommingCallNotificationHandler';
import {store} from '../store';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import {
  PUSH_CHANNEL_ID,
  PUSH_CHANNEL_NAME,
  PUSH_CHANNEL_DESCRIPTION,
} from '../configs/general/constant';
import {
  setAstroLinking,
  setAstroLinkingParams,
} from '../store/apps/astroLinking';
import {
  setAstroFeatureEnabled,
  setPersonalisedHoroscopeEnabled,
  setConsultationEnabled,
} from '../store/apps/astroFeatureSlice';
import {setStoredKundliObject} from '../store/apps/astroKundali';
import {fetchOneStory} from '../store/apps/story';
import {
  setChatReqDetails,
  setShowCallDialogue,
  setShowUnavailableDialogue,
} from '../store/apps/agora';
import {formatChatDetails} from '../configs/Chats/FormatChatDetails';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import authConfig from '../configs';
import CryptoJS from 'react-native-crypto-js';
import * as KeyChain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {decrypt} from '../utils/encryption';
import {
  PopupMessageValidation,
  checkInviteUser,
} from '../store/apps/inviteSlice';
import {setStoryFilters} from '../store/apps/story';
import {getChatToken} from '../configs/Chats/ChatRouter';
import {onDisplayChatNotification} from '../configs/Chats/ChatNotificationConfig';
import Axios, {TelephonyAxios} from '../plugin/Axios';

const defaultValues = {
  setIsHomeVisible: () => Boolean,
  isHomeVisible: false,
  checkNotificationPermission: () => Promise.resolve(true),
  requestNotificationPermission: () => Promise.resolve(),
};

const PushNotificationContext = createContext(defaultValues);

const PushNotificationProvider = ({children}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isHomeVisible, setIsHomeVisible] = useState(false);
  const [pendingNotification, setPendingNotification] = useState(null);
  const userInfo = useSelector(state => state.userInfo);
  const deepLinkingPath = useSelector(
    state => state.astroLinking.astroLinkingPath,
  );
  const astroReleaseController = useSelector(
    state => state?.userManagementToasts.userManagementToastsConfig,
  );
  const chatReqDetails = useSelector(
    state => state.agoraCallSlice.chatReqDetails,
  );
  const totalAvailableTalkTime = useSelector(
    state => state.agoraCallSlice.totalAvaiableConsultationTime,
  );

  async function updateTokenInServer(FCMToken) {
    try {
      const data = {
        token: FCMToken,
      };
      await TelephonyAxios.put(`/updateFCMToken`, data);
      await AsyncStorage.setItem('fcmToken', FCMToken);
    } catch (error) {
      return;
    }
  }

  // Handle Background Notification Interaction
  useEffect(() => {
    // REMOVED: Duplicate messaging().onMessage() listener that was causing auto-navigation
    // The proper listener is at line 1648 with getForegroundNotification

    // UNIFIED DEEP LINK HANDLING - Handle both CleverTap and regular deep links

    // 1. CleverTap push notification deep links
    CleverTap.getInitialUrl((_err, url) => {
      if (url) {
        console.log('CleverTap getInitialUrl:', url);
        // Add delay for iOS navigation readiness in killed state
        setTimeout(
          () => {
            handleDeepLink(url);
          },
          Platform.OS === 'ios' ? 2000 : 1000,
        );
      }
    });

    CleverTap.addListener(CleverTap.CleverTapPushNotificationClicked, event => {
      console.log('CleverTap notification clicked:', event?.wzrk_dl);
      if (event?.wzrk_dl) {
        // Reduced delay for foreground/background - navigation is already ready
        setTimeout(
          () => {
            handleDeepLink(event.wzrk_dl);
          },
          Platform.OS === 'ios' ? 300 : 100,
        );
      }
    });

    // 2. Regular app scheme deep links (centralized here to avoid conflicts)
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          console.log('Linking getInitialURL:', url);
          setTimeout(() => {
            handleDeepLink(url);
          }, 1000);
        }
      })
      .catch(console.warn);

    const linkingListener = Linking.addEventListener('url', event => {
      console.log('Linking addEventListener:', event.url);
      handleDeepLink(event.url);
    });

    // Handle Kill State Notification Interaction - moved inside useEffect
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Firebase getInitialNotification:', remoteMessage);
          setPendingNotification?.(remoteMessage);
        }
      });

    // Additional backup check for Firebase notifications in killed state
    setTimeout(() => {
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Firebase backup getInitialNotification check:',
              remoteMessage,
            );
            // Process immediately if still pending and home is visible
            if (isHomeVisible) {
              handleNotification?.(remoteMessage);
            } else {
              setPendingNotification?.(remoteMessage);
            }
          }
        });
    }, 2000);

    // Handle Background State Notification Interaction (when app is minimized)
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        console.log('Firebase onNotificationOpenedApp (background):', remoteMessage);
        // Process immediately for background notifications
        handleNotification?.(remoteMessage);
      }
    });

    return () => {
      linkingListener?.remove();
      unsubscribeBackground?.();
    };
  }, []);

  useEffect(() => {
    if (pendingNotification && isHomeVisible) {
      console.log(
        'Processing pending Firebase notification:',
        pendingNotification,
      );
      handleNotification?.(pendingNotification);
    }
  }, [isHomeVisible, pendingNotification]);

  const handleNotification = remoteMessage => {
    selectNotification(remoteMessage?._id);
    GotoDirectory(remoteMessage);
    setPendingNotification(null);
  };

  async function handleDeepLink(url) {
    console.log('handleDeepLink - original URL:', url);

    // Convert string URL to object format for unified processing
    const urlObj = typeof url === 'string' ? {url: url} : url;

    // INTEGRATED DECODE INVITE CODE LOGIC
    if (
      urlObj &&
      typeof urlObj === 'object' &&
      urlObj.url &&
      urlObj?.url.search('ref') > -1
    ) {
      const refVal = urlObj?.url?.split?.('=') || [];
      const refEncrypt = refVal[1];

      if (refVal?.[2] === 'IN') {
        try {
          const bytes = CryptoJS?.AES?.decrypt(refEncrypt, 'ImeusWe104$#%98^');
          const inviteCode = bytes?.toString(CryptoJS?.enc?.Utf8);

          const accessToken = await KeyChain.getGenericPassword();
          if (
            !accessToken?.password ||
            accessToken?.password?.toString?.() === '1'
          ) {
            await AsyncStorage.setItem(
              'beforeLoggedin',
              JSON.stringify(urlObj),
            );
            return;
          }

          const userInfoId = await dispatch(getUserInfo()).unwrap();
          setTimeout(() => {
            if (inviteCode && userInfoId) {
              validateInviteRequest(inviteCode, userInfoId?.data?._id);
            }
          }, 1000);
        } catch (error) {
          if (error?.message?.includes('401')) {
            await AsyncStorage.setItem(
              'beforeLoggedin',
              JSON.stringify(urlObj),
            );
          }
        }
        return;
      }

      if (refVal?.[2] === 'CO') {
        const bytes = CryptoJS?.AES?.decrypt(refEncrypt, 'ImeusWe104$#%98^');
        const decryptedId = bytes?.toString(CryptoJS?.enc?.Utf8);
        if (decryptedId) {
          console.log('decryptedId', decryptedId);
          // Handle community navigation
          navigateWithCustomBack('CommunityDetails', {
            item: {_id: decryptedId},
          });
        }
        return;
      }

      if (refVal?.[2] === 'AP') {
        const bytes = CryptoJS?.AES?.decrypt(refEncrypt, 'ImeusWe104$#%98^');
        const decryptedId = bytes?.toString(CryptoJS?.enc?.Utf8);
        if (decryptedId) {
          navigateWithCustomBack('AstroProfile', {
            astroId: decryptedId,
          });
        }
        return;
      }
    }

    // Handle CommunityDetails with encrypted ID (both imeuswe:// and https://imeuswe.app/)
    if (urlObj?.url?.includes('CommunityDetails')) {
      // Handle formats: CommunityDetails/encryptedId, CommunityDetails/:encryptedId
      // Works with: imeuswe://CommunityDetails/id, https://imeuswe.app/CommunityDetails/id
      let encryptedId = urlObj?.url?.split('CommunityDetails/')[1];
      if (!encryptedId) {
        encryptedId = urlObj?.url?.split('CommunityDetails/:')[1];
      }

      console.log('CommunityDetails encryptedId:', encryptedId);

      try {
        const originalId = await decrypt(encryptedId);
        console.log(
          'CommunityDetails Deep Link - originalId after decrypt:',
          originalId,
        );
        if (originalId) {
          const navParams = {
            item: {_id: originalId},
          };
          console.log(
            'CommunityDetails Deep Link - navigating with params:',
            navParams,
          );
          navigateWithCustomBack('CommunityDetails', navParams);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Invalid link',
            text2: 'The link appears to be invalid or expired',
          });
        }
      } catch (error) {
        console.error('Error decrypting ID:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to process the link',
          text2: 'Please try again later',
        });
      }
      return;
    }

    // Handle imeuswe:// and https://imeuswe.app/ deep links
    if (
      urlObj?.url?.includes('imeuswe://') ||
      urlObj?.url?.includes('https://imeuswe.app/')
    ) {
      let path = '';
      let pathParams = '';

      if (urlObj?.url?.includes('?path=')) {
        path = urlObj?.url?.split('?path=')[1];
      } else {
        const fullPath = urlObj?.url
          ?.replace('imeuswe://', '')
          .replace('https://imeuswe.app/', '');

        const pathParts = fullPath?.split('/');
        path = pathParts?.[0] || '';
        pathParams = pathParts?.slice(1)?.join('/') || '';
      }

      const normalizedPath = path?.toLowerCase();

      // Handle Stories deep link
      if (normalizedPath === 'stories') {
        handleStoriesDeepLink();
        return;
      }

      // Check ancestry screens
      const ANCESTRY_SCREENS = {
        whatsonbell: 'WhatsOnBell',
        home: 'Home',
        trees: 'Trees',
        communitiesscreentab: 'CommunitiesScreenTab',
        communitydetails: 'CommunityDetails',
        profile: 'Profile',
        feedback: 'Feedback',
        faq: 'Faq',
        aboutus: 'AboutUs',
        privacy: 'Privacy',
        accountdna: 'AccountDna',
        imeuswesearch: 'ImeusweSearch',
        login: 'Login',
        signup: 'SignUp',
        creatediscussions: 'CreateDiscussions',
        createpoll: 'CreatePoll',
      };

      if (ANCESTRY_SCREENS[normalizedPath]) {
        const screenName = ANCESTRY_SCREENS[normalizedPath];
        const navParams = {
          fromDeepLink: true,
          timestamp: new Date().getTime(),
        };

        if (normalizedPath === 'communitydetails' && pathParams) {
          // Handle encrypted ID from universal link format: CommunityDetails/:encryptedId
          try {
            console.log('pathParams', pathParams);

            const originalId = await decrypt(pathParams);
            console.log(
              'CommunityDetails PathParams Deep Link - originalId after decrypt:',
              originalId,
            );
            if (originalId) {
              const navParams = {
                item: {_id: originalId},
              };
              console.log(
                'CommunityDetails PathParams Deep Link - navigating with params:',
                navParams,
              );
              navigateWithCustomBack('CommunityDetails', navParams);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Invalid community link',
                text2: 'The link appears to be invalid or expired',
              });
              return;
            }
          } catch (error) {
            console.error('Error decrypting community ID:', error);
            Toast.show({
              type: 'error',
              text1: 'Failed to process community link',
              text2: 'Please try again later',
            });
            return;
          }
        }

        navigateWithCustomBack(screenName, navParams);
        return;
      }

      // Check astrology screens
      const ASTRO_SCREENS = {
        astrohome: 'AstroHome',
        horoscope: 'Horoscope',
        reports: 'Reports',
        matchmaking: 'MatchMaking',
        panchang: 'Panchang',
        consultation: 'Consultation',
        astroorderhistory: 'AstroOrderHistory',
        wallethistory: 'WalletHistory',
      };

      if (ASTRO_SCREENS[normalizedPath]) {
        dispatch(setAstroLinking(ASTRO_SCREENS[normalizedPath]));
        return;
      }

      // For other screens, navigate directly
      navigation.navigate(path);
      return;
    }

    // Handle publicStory and other legacy formats
    if (urlObj?.url?.includes('publicStory')) {
      // Handle public story logic here
      return;
    }
  }

  // Helper function for Stories deep link - using proper selectors like InviteReceive
  const handleStoriesDeepLink = async () => {
    console.log('handleStoriesDeepLink');

    try {
      // Fetch fresh tree data and get the response directly (like InviteReceive)
      const treeListResponse = await dispatch(getprivateTreeList()).unwrap();
      await dispatch(getGroupData()).unwrap();

      // Use the fresh data from the API response instead of selectors
      const freshTreeList = treeListResponse?.treeList || [];
      // Get userInfo from existing selector at component level
      const userInfoData = await dispatch(getUserInfo()).unwrap();

      console.log('freshTreeList', freshTreeList?.length);

      // Check if privateTreeList is empty
      if (!freshTreeList || freshTreeList.length === 0) {
        console.log('No trees available, navigating to Trees screen');
        navigateWithCustomBack('Trees', {
          fromDeepLink: true,
        });
        return;
      }

      // Check if user is owner of any tree (same logic as InviteReceive)
      const userOwnedTree = freshTreeList.find(
        item =>
          item.user?.id === userInfoData?._id && item.user?.role === 'owner',
      );
      console.log('userOwnedTree', userOwnedTree, freshTreeList);
      if (!userOwnedTree) {
        console.log(
          'User is not owner of any tree, navigating to Trees screen',
        );
        navigateWithCustomBack('Trees', {
          fromDeepLink: true,
        });
        return;
      }

      // Use the first owned tree
      const treeItem = userOwnedTree;

      // Reset Redux state (same as InviteReceive)
      dispatch(setGroupId([]));
      dispatch(setFamilyName(''));
      dispatch(setTreeId([]));

      const homePersonId = treeItem?.user?.homePerson?.[0]?.homePerson;

      if (!homePersonId) {
        console.error('HomePersonId is missing');
        navigateWithCustomBack('Trees', {
          fromDeepLink: true,
        });
        return;
      }

      // Make API call using TelephonyAxios (same pattern as InviteReceive)
      const response = await Axios.get(
        `/getGroupIdByTreeAndUser/${treeItem.tree.id}/${homePersonId}`,
      );

      const groupIdss = response.data.groupId;
      dispatch(setGroupId(response?.data?.groupId));
      const familyName = shrinkDisplayFamilyName(treeItem.tree.name);
      dispatch(setFamilyName(familyName));
      dispatch(setTreeId(treeItem));
      dispatch(setStoryFilters('allPosts'));

      navigateWithCustomBack('Stories', {
        fromDeepLink: true,
      });
    } catch (error) {
      console.error('Error in handleStoriesDeepLink:', error);
      Toast.show({
        type: 'error',
        text1: error.message || 'Failed to load Stories',
      });
      navigateWithCustomBack('Trees', {
        fromDeepLink: true,
      });
    }
  };

  // Helper function to format family names
  const shrinkDisplayFamilyName = familyName => {
    if (!familyName) return 'Family';
    return familyName.length > 15
      ? `${familyName.substring(0, 15)}...`
      : familyName;
  };

  // Helper function for custom back navigation - matches InviteReceive implementation
  const navigateWithCustomBack = (screenName, params = {}) => {
    console.log('navigateWithCustomBack', screenName, params);
    switch (screenName) {
      case 'Faq':
        navigation.dispatch(
          CommonActions.reset({
            index: 3,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Profile',
                },
              },
              {
                name: 'AccountSettings',
              },
              {
                name: 'Faq',
              },
            ],
          }),
        );
        break;

      case 'ImeusweSearch':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'ImeusweSearch',
              },
            ],
          }),
        );
        break;

      case 'WhatsOnBell':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'WhatsOnBell',
              },
            ],
          }),
        );
        break;

      case 'Feedback':
        navigation.dispatch(
          CommonActions.reset({
            index: 3,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Profile',
                },
              },
              {
                name: 'AccountSettings',
              },
              {
                name: 'Feedback',
              },
            ],
          }),
        );
        break;

      case 'AboutUs':
        navigation.dispatch(
          CommonActions.reset({
            index: 3,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Profile',
                },
              },
              {
                name: 'AccountSettings',
              },
              {
                name: 'AboutUs',
              },
            ],
          }),
        );
        break;

      case 'Privacy':
        navigation.dispatch(
          CommonActions.reset({
            index: 3,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Profile',
                },
              },
              {
                name: 'AccountSettings',
              },
              {
                name: 'Privacy',
              },
            ],
          }),
        );
        break;

      case 'AccountDna':
        navigation.dispatch(
          CommonActions.reset({
            index: 3,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Profile',
                },
              },
              {
                name: 'AccountSettings',
              },
              {
                name: 'AccountDna',
              },
            ],
          }),
        );
        break;

      case 'MatchMaking':
        console.log('MatchMaking');
        dispatch(setAstroLinking(screenName));
        break;

      case 'AstroOrderHistory':
        navigation.dispatch(
          CommonActions.reset({
            index: 3,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'Reports',
                },
              },
              {
                name: 'AstroOrderHistory',
              },
            ],
          }),
        );
        break;

      case 'WalletHistory':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
              {
                name: 'WalletHistory',
              },
            ],
          }),
        );
        break;

      case 'Stories':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Trees',
                },
              },
              {
                name: 'Stories',
              },
            ],
          }),
        );
        break;

      case 'Trees':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Trees',
                },
              },
            ],
          }),
        );
        break;

      case 'Home':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
            ],
          }),
        );
        break;

      case 'Profile':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Profile',
                },
              },
            ],
          }),
        );
        break;

      case 'CommunitiesScreenTab':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'CommunitiesScreenTab',
                },
              },
            ],
          }),
        );
        break;

      case 'CreateDiscussions':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'CommunitiesScreenTab',
                },
              },
              {
                name: 'CreateDiscussions',
              },
            ],
          }),
        );
        break;

      case 'CreatePoll':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'CommunitiesScreenTab',
                },
              },
              {
                name: 'CreatePoll',
              },
            ],
          }),
        );
        break;

      case 'Login':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Login',
              },
            ],
          }),
        );
        break;

      case 'SignUp':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'SignUp',
              },
            ],
          }),
        );
        break;

      case 'CommunityDetails':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'BottomTabs',
                params: {
                  screen: 'CommunitiesScreenTab',
                },
              },
              {
                name: 'CommunityDetails',
                params: {
                  ...params,
                  fromDeepLink: true,
                },
              },
            ],
          }),
        );
        break;

      // Astrology screens
      case 'AstroHome':
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
            ],
          }),
        );
        break;

      case 'Horoscope':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
              {
                name: 'Horoscope',
              },
            ],
          }),
        );
        break;

      case 'Reports':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'Reports',
                },
              },
              {
                name: 'Reports',
              },
            ],
          }),
        );
        break;

      case 'Panchang':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
              {
                name: 'Panchang',
              },
            ],
          }),
        );
        break;

      case 'Consultation':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
              {
                name: 'Consultation',
              },
            ],
          }),
        );
        break;

      case 'AstroProfile':
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              {
                name: 'BottomTabs',
                params: {
                  screen: 'Home',
                },
              },
              {
                name: 'AstroBottomTabs',
                params: {
                  screen: 'AstroHome',
                },
              },
              {
                name: 'AstroProfile',
                params: {
                  ...params,
                  fromDeepLink: true,
                },
              },
            ],
          }),
        );
        break;

      default:
        // For other screens, use default navigation
        navigation.navigate(screenName, {
          ...params,
          fromDeepLink: true,
          hasNavigationHistory: false,
        });
        break;
    }
  };

  // Validate invite request function
  const validateInviteRequest = async (inviteCode, userinfoId) => {
    const data = {
      inviteCode: Number(inviteCode),
      recieverId: userinfoId,
    };

    try {
      const response = await dispatch(PopupMessageValidation(data));

      if (response && response.payload && response.payload.btnStatus) {
        const res = await dispatch(checkInviteUser(data));
        if (!res.error) {
          // Show success dialog
          // Toast.show({
          //   type: 'success',
          //   text1: 'Invite Processed',
          //   text2: response.payload.message,
          // });
        }

        if (response && res && res.error && res.error.message) {
          // Toast.show({
          //   type: 'error',
          //   text1: 'Invite Error',
          //   text2: res.error.message,
          // });
        }
      } else if (response && response.error && response.error.message) {
        // Toast.show({
        //   type: 'error',
        //   text1: 'Invite Error',
        //   text2: response.error.message,
        // });
      }
      await AsyncStorage.removeItem('beforeLoggedin');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  // To Mark Notifications As Read
  async function selectNotification(id) {
    try {
      const viewNotificationData = {notificationId: id};
      await dispatch(
        markNotificationAsViewedApi?.(viewNotificationData),
      ).unwrap();
    } catch (error) {
      // Toast.show({
      //   type: 'error',
      //   text1: error.message,
      // });
    }
  }

  const findArrayByTreeId = async (treeId, senderTreeId, privateTreeList) => {
    const treeArray = privateTreeList;

    if (!treeArray) {
      return null;
    }

    for (let i = 0; i < treeArray?.length; i++) {
      const currentArray = treeArray?.[i];
      if (
        currentArray?.tree?.id === treeId ||
        currentArray?.tree?.id === senderTreeId
      ) {
        return currentArray;
      }
    }
    return null;
  };

  useEffect(() => {
    dispatch(getTree?.());
  }, []);

  // Redirect User to tree page
  const GotoDirectory = async notification => {
    if (notification.data?.notificationType === 'consultationEndForUser') {
      if (notification?.data?.consultationType === 'call') {
        navigation.navigate('WalletHistory', {
          index: 2,
        });
      } else {
        navigation.navigate('WalletHistory', {
          index: 1,
        });
      }
    }
    if (
      notification?.data?.notificationName === 'NewMember' ||
      notification?.data?.notificationName === 'LinkMember' ||
      notification?.data?.notificationType === 'treeCollabration'
    ) {
      let privateTreeList;
      const privateTreeRes = await dispatch(getprivateTreeList()).unwrap();
      if (privateTreeRes?.isOwner) {
        const familyArr = privateTreeRes?.treeList.filter(
          e => e.user.role !== 'owner',
        );
        privateTreeList = familyArr;
      } else {
        privateTreeList = privateTreeRes?.treeList;
      }

      let foundArray = await findArrayByTreeId(
        notification?.data?.treeId,
        notification?.data?.senderTreeId,
        privateTreeList,
      );

      dispatch(resetTreeItem());
      await dispatch(setTreeItemFromPrivateTree(foundArray));
      await dispatch(updateFamilyType(foundArray?.user?.role));
      navigation.navigate('TreeScreen', {
        family: foundArray?.tree?.name,
        currentTreeDetails: foundArray,
      });
    }

    // Conditions For Calender
    const conditionForCalenderNotifications =
      (notification?.data?.eventType === 'Birthday' ||
        notification?.data?.eventType === 'Marriage Anniversary' ||
        notification?.data?.eventType === 'Death anniversary') &&
      notification?.data?.notificationType === 'default';

    if (conditionForCalenderNotifications) {
      navigation.navigate('WhatsOnBell');
    }
    if (
      notification?.data?.Story_id !== undefined &&
      notification?.data?.Story_id !== null
    ) {
      gotoContent(notification);
    }

    // Redirect To Community Details
    if (
      notification?.data?.Community_id !== undefined &&
      notification?.data?.Community_id !== null &&
      (notification?.data?.notificationType === 'joinPublicCommunity' ||
        notification?.data?.notificationType === 'createCommunity' ||
        notification?.data?.notificationType === 'acceptedJoiningRequest' ||
        notification?.data?.notificationType === 'inviteUser')
    ) {
      navigation.navigate('CommunityDetails', {
        item: {_id: notification?.data?.Community_id},
      });
    }

    if (notification?.data?.notificationType === 'walletRechargeFailed') {
      navigation.navigate('WalletHistory');
    }

    if (notification?.data?.notificationType === 'walletRechargeSuccess') {
      navigation.navigate('AstroBottomTabs', {screen: 'Consultation'});
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Consultation',
        }),
      );
    }

    // Redirect to Requests page
    if (
      notification?.data?.Community_id !== undefined &&
      notification?.data?.Community_id !== null &&
      notification?.data?.notificationType === 'joinPrivateCommunity'
    ) {
      await dispatch(getCommunityDetails(notification?.data?.Community_id));
      navigation.navigate('CommunityJoiningRequests');
    }
    if (
      notification?.data?.Discussion_id !== undefined &&
      notification?.data?.Discussion_id !== null &&
      (notification?.data?.notificationType === 'discussionUpvoted' ||
        notification?.data?.notificationType === 'discussionCreation')
    ) {
      navigation.navigate('ViewSingleDiscussion', {
        _id: notification?.data?.Discussion_id,
      });
      if (notification?.data?.notificationType === 'discussionCreation') {
        const viewNotificationData = {
          notificationId: notification?.data?.notificationId,
        };
        await dispatch(
          markNotificationAsViewedApi(viewNotificationData),
        ).unwrap();
      }
    }
    if (
      notification?.data?.Poll_id !== undefined &&
      notification?.data?.Poll_id !== null &&
      notification?.data?.notificationType === 'pollCreation'
    ) {
      navigation.navigate('ViewSinglePoll', {
        _id: notification?.data?.Poll_id,
      });
      if (notification?.data?.notificationType === 'pollCreation') {
        const viewNotificationData = {
          notificationId: notification?.data?.notificationId,
        };
        await dispatch(
          markNotificationAsViewedApi(viewNotificationData),
        ).unwrap();
      }
    }
    // Redirect to Comment
    if (
      notification?.data?.Discussion_id !== undefined &&
      notification?.data?.Discussion_id !== null &&
      (notification?.data?.notificationType === 'commentedOnDiscussion' ||
        notification?.data?.notificationType === 'upvotedOnComment' ||
        notification?.data?.notificationType === 'replyOnComment')
    ) {
      if (notification?.data?.notificationType === 'replyOnComment') {
        navigation.navigate('ViewSingleDiscussion', {
          _id: notification?.data?.Discussion_id,
          type: 'reply',
          mainCommentId: notification?.data?.mainParentCommentId,
          replyId: notification?.data?.Comment_id,
        });
      } else if (
        notification?.data?.notificationType === 'commentedOnDiscussion'
      ) {
        navigation.navigate('ViewSingleDiscussion', {
          _id: notification?.data?.Discussion_id,
          type: 'mainComment',
          mainCommentId: notification?.data?.Comment_id,
        });
      }
      if (
        notification?.data?.notificationType === 'upvotedOnComment' &&
        notification?.data?.mainParentCommentId
      ) {
        navigation.navigate('ViewSingleDiscussion', {
          _id: notification?.data?.Discussion_id,
          type: 'reply',
          mainCommentId: notification?.data?.mainParentCommentId,
          replyId: notification?.data?.Comment_id,
        });
      } else if (notification?.data?.notificationType === 'upvotedOnComment') {
        navigation.navigate('ViewSingleDiscussion', {
          _id: notification?.data?.Discussion_id,
          type: 'mainComment',
          mainCommentId: notification?.data?.Comment_id,
        });
      }
    }
    if (notification?.data?.routeName === 'report') {
      dispatch(setStoredKundliObject({_id: notification?.data?.kundliId}));
      if (notification?.data?.isGenerated?.toString?.() === 'true') {
        dispatch(setAstroLinking('AstroViewReports'));
        dispatch(
          setAstroLinkingParams({
            reportId: notification?.data?.reportId,
            kundliId: notification?.data?.kundliId,
            reportName: notification?.data?.typeOfReport,
            nameOfPerson: notification?.data?.nameOfPerson || '',
          }),
        );
      } else {
        dispatch(
          setAstroLinkingParams({path: 'Reports', params: notification?.data}),
        );
        navigation.navigate('AstroBottomTabs', {
          screen: 'Reports',
        });
      }
    } else if (notification?.data?.routeName === 'horoscope') {
      dispatch(setAstroLinking('Horoscope'));
    }

    if (notification?.data?.notificationCategory === 'notifyMe') {
      const notifyMeData = JSON.parse(
        typeof notification?.data?.astrologerId === 'string'
          ? notification?.data?.astrologerId
          : '{}',
      );
      if (notifyMeData?.astrologerId) {
        navigation.navigate('AstroProfile', {
          astroId: notifyMeData?.astrologerId,
        });
      }
    }
    if (notification?.data?.topicData) {
      const data = JSON.parse(notification?.data?.topicData);
      if (data?.astrologerId) {
        navigation.navigate('AstroProfile', {
          astroId: data?.astrologerId,
        });
      }
    }
  };

  // Go to Story
  const gotoContent = async notification => {
    if (
      notification?.data?.Story_id === undefined ||
      notification?.data?.Story_id === null
    ) {
      return;
    }
    const response = await dispatch(
      fetchOneStory(notification?.data?.Story_id),
    ).unwrap();
    const findPu = response?.familyGroupId?.find(_group => {
      return _group?.groupType?.groupType1 === 'PU';
    });
    if (findPu) {
      dispatch(setGroupId(null));
      dispatch(setFamilyName(null));
      const res = await dispatch(getTreeDetailsByGroupId(findPu?._id)).unwrap();
      dispatch(setGroupId(findPu?._id));
      dispatch(setFamilyName(res?.familyName));
      navigation.navigate('ViewStory', {
        SingleStoryId: {
          _id: notification?.data?.Story_id,
          visible: notification?.data?.visibility !== false,
          categoryId: [
            {_id: '606ee362e66b6884b2ddccf6', categoryName: 'Category'},
          ],
        },
      });
    }
  };

  async function requestNotificationPermission() {
    try {
      if (Platform.OS === 'android') {
        Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
          {key: 'android.provider.extra.APP_PACKAGE', value: 'com.imeuswe.app'},
        ]);
        return true;
      } else {
        Linking.openSettings();
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  const checkNotificationPermission = async () => {
    try {
      const enabled = await messaging().hasPermission();

      // The hasPermission() method returns:
      // 1 or true: Authorized
      // 0: Not determined (iOS) or Denied (Android)
      // -1: Denied (iOS)
      if (
        enabled === messaging.AuthorizationStatus.AUTHORIZED ||
        enabled === true
      ) {
        return true;
      } else if (enabled === messaging.AuthorizationStatus.NOT_DETERMINED) {
        return false;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  async function triggerForeGroundNotification(notification) {
    const channelId = await notifee.createChannel({
      id: PUSH_CHANNEL_ID,
      name: PUSH_CHANNEL_NAME,
      description: PUSH_CHANNEL_DESCRIPTION,
      importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      id: PUSH_CHANNEL_ID,
      title: notification?.notification.title,
      body: notification?.notification.body,
      data: notification?.data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        smallIcon: 'ic_notification',
        color: '#E77237',
        circularLargeIcon: true,
        timestamp: Date.now(),
        showTimestamp: true,
        lightUpScreen: true,
      },
    });

    // Handle notifyMe unsubscription
    if (notification?.data.notificationCategory === 'notifyMe') {
      const notifyMeData = JSON.parse(
        typeof notification?.data?.astrologerId === 'string'
          ? notification?.data?.astrologerId
          : '{}',
      );
      if (notifyMeData?.astrologerId) {
        console.log('unsubscribingg');
        messaging().unsubscribeFromTopic(notifyMeData.astrologerId);
      }
    }

    // Handle notification click events
    notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        const {notification} = detail;
        if (notification?.data?.routeName === 'report') {
          // dispatch(setAstroLinking('Reports'));
        } else if (notification?.data?.routeName === 'horoscope') {
          // dispatch(setAstroLinking('Horoscope'));
        } else {
          GotoDirectory(notification);
        }
      }
    });
  }

  async function getForegroundNotification(remoteMessage) {
    if (
      remoteMessage?.data?.declineDetails &&
      typeof remoteMessage?.data?.declineDetails === 'string'
    ) {
      store.dispatch(setShowUnavailableDialogue(true));
      store.dispatch(setShowCallDialogue(false));
      AsyncStorage.removeItem('consultationInitTime');
    } else if (
      remoteMessage?.data?.callDetails &&
      typeof remoteMessage?.data?.callDetails === 'string'
    ) {
      incommingCallNotificationHandler(remoteMessage);
    } else if (
      remoteMessage?.data?.chatDetails &&
      typeof remoteMessage?.data?.chatDetails === 'string'
    ) {
      /* accept decline -> accept = below code should run 
         else log chat decline & show unavailable popup to astrologer 
      */
      const extractedData = formatChatDetails(remoteMessage);
      onDisplayChatNotification(extractedData);
      // dispatch(setChatReqDetails(extractedData));
    } else if (
      remoteMessage?.notification?.body &&
      remoteMessage?.notification?.title
    ) {
      triggerForeGroundNotification(remoteMessage);
    }
  }

  async function goToChatScreen({astrologerId, userId, expiry}) {
    await getChatToken({
      astrologerId: astrologerId,
      userId: userId ?? '',
      expiry: expiry,
    });
    // navigation.navigate('ChatScreen');
  }

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(token => {
      updateTokenInServer(token);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      const unsubscribe = messaging().onMessage(getForegroundNotification);
      return unsubscribe;
    } catch (error) {
      console.error('subscription error', error);
    }
  }, []);

  useEffect(() => {
    if (
      chatReqDetails.astrologerId &&
      typeof chatReqDetails.astrologerId === 'string' &&
      chatReqDetails.astrologerId.length > 0
    ) {
      goToChatScreen({
        astrologerId: chatReqDetails.astrologerId,
        userId: chatReqDetails.userId ?? '',
        expiry: totalAvailableTalkTime,
      });
    }
  }, [chatReqDetails]);

  return (
    <PushNotificationContext.Provider
      value={{
        setIsHomeVisible,
        isHomeVisible,
        checkNotificationPermission,
        requestNotificationPermission,
      }}>
      {children}
    </PushNotificationContext.Provider>
  );
};
export const usePushNotification = () => useContext(PushNotificationContext);

export {PushNotificationProvider, PushNotificationContext};
