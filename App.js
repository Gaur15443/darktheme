import React, { useEffect, useState } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { Provider } from 'react-redux';
import { Keyboard, Platform } from 'react-native';
import {
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
  PaperProvider,
  configureFonts,
} from 'react-native-paper';
import { Theme } from './src/common';
import NetInfo from '@react-native-community/netinfo';
// ** Store Imports
import SocketProvider from './src/context/SocketContext';
import { AuthProvider } from './src/context/AuthContext';
import { WalletProvider } from './src/context/WalletContext';
import { store } from './src/store';
import iconFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import Toast, { BaseToast } from 'react-native-toast-message';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import AppChild from './AppChild';
import AuthStack from './src/navigation/AuthStack';
import { PushNotificationProvider } from './src/context/PushNotificationContext';
import CheckUpdate from './src/components/CheckUpdate';
import { Mixpanel } from 'mixpanel-react-native';

import MaintenanceScreen from './src/components/MaintenanceScreen';
import remoteConfig from '@react-native-firebase/remote-config';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { loadGdprAdsConsent } from './src/components/ads/gdprAdsConsent';
import config from 'react-native-config';
import ErrorBoundary from './src/common/ErrorBoundary';
import UserManagementToastsConfig from './src/core/user-management-toasts-config';
import PaymentApiToastConfig from './src/core/payment-api-toast-config';
import UserAppApiToastConfig from './src/core/user-app-api-toast-config';
import GlobalLogout from './src/components/GlobalLogout';
import { OrientationProvider } from './src/context/OrientationContext';
import * as Sentry from '@sentry/react-native';
import NewTheme from './src/common/NewTheme';
import { linking } from './src/configs/DeepLinks/DeepLinkingConfig';
import VoipConfigIos from './src/components/VoipConfigIos';
import { navigationRef } from './src/configs/Voip/NavigationService';
import CallDeclinePopUp from './src/components/AstroConsultation/AstroAgoraCall/AgoraCallActions';
import CleverTap from 'clevertap-react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import FontSizeConfig from './src/core/FontSizeConfig';
import GlobalPermissionPopUp from './src/components/AstroConsultation/GlobalPermissionPopUp';
import FirebaseKeyConfig from './src/wrappers/FirebaseKeyConfig';
import CheckForActiveConsultations from './src/wrappers/CheckForActiveConsultations';
import { GestureProvider } from './src/context/GestureHandlerRootView';
import InviteReceive from './src/components/invite-receive';

import { useNetworkActivityDevTools } from '@rozenite/network-activity-plugin';
import { useReactNavigationDevTools } from '@rozenite/react-navigation-plugin';

const queryClient = new QueryClient();

Sentry.init({
  dsn: 'https://590b0d4256db1f65a929b35615dfa3f4@o4509921648574464.ingest.de.sentry.io/4509921650540624',
  tracesSampleRate: 0.8,
  environment: 'production',
  debug: true,
  appHangTimeoutInterval: 5,
  sessionTrackingIntervalMillis: 300000,
  replaysSessionSampleRate: config.ENV === 'uat' ? 1.0 : 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
  ],
  beforeSend(event, hint) {
    console.log(event, hint, 'senrtylog');
  },
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

// Mixpanel init
const trackAutomaticEvents = false;
export const mixpanel = new Mixpanel(
  config.MIXPANEL_PROJECT_TOKEN,
  trackAutomaticEvents,
);
mixpanel.init();

export function Track({
  cleverTapEvent,
  mixpanelEvent,
  userData,
  mixpanelProps = {},
  cleverTapProps = {},
}) {
  if (!userData) {
    return;
  }
  const phoneNo = userData?.mobileNo ? '+' + userData?.mobileNo : '';
  if (typeof cleverTapEvent === 'string') {
    const commonProps = {
      Name: `${userData?.personalDetails?.name || ''} ${userData?.personalDetails?.lastname || ''}`.trim(),
      Identity: userData?._id || '',
      Email: userData?.email || '',
      Phone: phoneNo,
      Firstname: userData?.personalDetails?.name || '',
      Lastname: userData?.personalDetails?.lastname || '',
      Gender: userData?.personalDetails?.gender || '',
      ...cleverTapProps,
    };

    CleverTap.recordEvent(cleverTapEvent, commonProps);
  }

  if (typeof mixpanelEvent === 'string') {
    mixpanel.track(mixpanelEvent, {
      user_id: userData?._id || '',
      email: userData?.email || '',
      phone: phoneNo,
      userFirstname: userData?.personalDetails?.name || '',
      userLastname: userData?.personalDetails?.lastname || '',
      gender: userData?.personalDetails?.gender || '',
      ...mixpanelProps,
    });
  }
}

const toastProps = {
  text1Style: {
    fontSize: 14,
    fontWeight: 500,
  },
  text2Style: {
    fontSize: 12,
    fontWeight: 300,
  },
  text2NumberOfLines: 4,
  style: {
    height: 'auto',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 30,
  },
};

export const toastConfig = {
  success: props => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: '#69C779',
        },
      ]}
      text1NumberOfLines={4}
    />
  ),
  error: props => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: 'red',
        },
      ]}
      text1NumberOfLines={4}
    />
  ),
};
export function MainToast() {
  return (
    <Toast
      config={toastConfig}
      position="bottom"
      bottomOffset={20}
      autoHide
      visibilityTime={3000}
    />
  );
}
export const fontConfig = {
  bold: {
    fontFamily: 'PublicSans Bold',
    fontWeight: 600,
  },
  default: {
    fontFamily: 'PublicSans Regular',
    fontWeight: 'normal',
    letterSpacing: 0.5,
  },
  headlineLarge: {
    fontFamily: 'PublicSans Bold',
    fontSize: 32,
    fontWeight: 'normal',
    letterSpacing: 1,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: 'PublicSans Bold',
    fontSize: 28,
    fontWeight: 'normal',
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: 'PublicSans Bold',
    fontSize: 24,
    fontWeight: 'normal',
    letterSpacing: 0.5,
    lineHeight: 32,
  },
};
const theme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    ...Theme.light,
  },
  fonts: configureFonts({ config: fontConfig }),
  isDarkTheme: false,
};

export const astroTheme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: '#6944D3',
    onPrimary: '#fff',
    background: '#13102B',
    headerIcon: '#fff',
    surfaceVariant: '#2B2941',
    error: '#FF4F4F',
    inputColor: '#fff',
    text: '#fff',
    backdrop: '#000000E5',
  },
  fonts: configureFonts({ config: fontConfig }),
  isDarkTheme: true,
};

function App() {
  // Enable Network Activity DevTools in development
  useNetworkActivityDevTools();
  useReactNavigationDevTools({ ref: navigationRef });

  const iconFontStyles = `@font-face {
  src: url(${iconFont});
  font-family: FontAwesome;
}`;

  const [loading, setLoading] = useState(true);

  // customer io init
  useEffect(() => {
    // GDPR And ATT Form
    loadGdprAdsConsent()
      .then(() => {})
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: error,
        });
      });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // if required in futher updates
  // const [networkAvailable, setNetworkAvailable] = useState(null);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // setNetworkAvailable(state.isConnected);
      if (!state.isConnected) {
        Toast.show({
          type: 'error',
          text1: 'Uh-oh! No network found.',
        });
      }
    });

    return () => {
      unsubscribe();
      // setNetworkAvailable(null);
    };
  }, []);

  //.............Below can be used in future
  //const colorScheme = useColorScheme(); // Get the device's color scheme

  // Choose theme based on color scheme
  // const theme =
  //   colorScheme === 'dark'
  //     ? {
  //         ...DefaultDarkTheme,
  //         colors: {
  //           ...DefaultDarkTheme.colors,
  //           ...Theme.dark,
  //         },
  //       }
  //     : {
  //         ...DefaultLightTheme,
  //         myOwnProperty: true,
  //         colors: {
  //           ...DefaultLightTheme.colors,
  //           ...Theme.light,
  //         },
  //       };
  //.............Above can be used in future

  function handleKeyboardDismiss() {
    try {
      Keyboard?.dismiss();
    } catch (_error) {
      /**empty */
    }
  }

  //............Maintenance Mode using Remote Config Firebase
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    const fetchRemoteConfig = async () => {
      try {
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: 3600000, // 1 hour
        });

        await remoteConfig().fetchAndActivate();

        const isProduction = config.ENV === 'prod';
        const maintenanceModeKey = isProduction
          ? 'IS_MAINTENANCE'
          : 'TEST_IS_MAINTENANCE';
        const platformKey = isProduction
          ? 'ON_WHICH_PLATFORM'
          : 'TEST_ON_WHICH_PLATFORM';

        const maintenanceMode = remoteConfig()
          .getValue(maintenanceModeKey)
          .asBoolean();
        const whichPlatform = remoteConfig().getValue(platformKey).asString();
        const currentPlatform = Platform.OS;

        let shouldEnableMaintenanceMode = false;

        if (whichPlatform === 'BOTH') {
          shouldEnableMaintenanceMode = maintenanceMode;
        } else if (
          (whichPlatform === 'ANDROID' && currentPlatform === 'android') ||
          (whichPlatform === 'IOS' && currentPlatform === 'ios')
        ) {
          shouldEnableMaintenanceMode = maintenanceMode;
        }

        setIsMaintenanceMode(shouldEnableMaintenanceMode);
      } catch (error) {
        // You might want to set a default value or handle the error in some way
        setIsMaintenanceMode(false);
      }
    };
    fetchRemoteConfig();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isMaintenanceMode) {
    return (
      <ErrorBoundary.Screen>
        <MaintenanceScreen />
      </ErrorBoundary.Screen>
    );
  }
  //............End of Maintenance Mode using Remote Config Firebase

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: NewTheme.colors.backgroundCreamy,
    },
  };

  return (
    <FontSizeConfig>
      <SafeAreaProvider>
        <ErrorBoundary.Screen>
          <OrientationProvider>
            <NavigationContainer
              ref={navigationRef}
              linking={linking}
              theme={navTheme}
            >
              <KeyboardProvider>
                <QueryClientProvider client={queryClient}>
                  <Provider store={store}>
                    <FirebaseKeyConfig>
                      <UserManagementToastsConfig>
                        <PaymentApiToastConfig>
                          <BottomSheetModalProvider>
                            <SocketProvider>
                              <GestureProvider>
                                <AuthProvider>
                                  <WalletProvider>
                                    <GlobalLogout>
                                      <PaperProvider theme={theme}>
                                        <PushNotificationProvider>
                                          {config.ENV === 'prod' && (
                                            <CheckUpdate />
                                          )}
                                          <AuthStack>
                                            <CheckForActiveConsultations>
                                              <CallDeclinePopUp>
                                                <VoipConfigIos>
                                                  <GlobalPermissionPopUp>
                                                    {/* <InviteReceive /> */}
                                                    <AppChild />
                                                  </GlobalPermissionPopUp>
                                                </VoipConfigIos>
                                              </CallDeclinePopUp>
                                            </CheckForActiveConsultations>
                                          </AuthStack>
                                        </PushNotificationProvider>
                                      </PaperProvider>
                                    </GlobalLogout>
                                  </WalletProvider>
                                </AuthProvider>
                              </GestureProvider>
                            </SocketProvider>
                          </BottomSheetModalProvider>
                        </PaymentApiToastConfig>
                      </UserManagementToastsConfig>
                    </FirebaseKeyConfig>
                  </Provider>
                </QueryClientProvider>
              </KeyboardProvider>
            </NavigationContainer>
          </OrientationProvider>
          {/* For some reasons, it's  loading before app renders and toasts are hidden. This fixed it. */}
          {!loading && <MainToast />}
        </ErrorBoundary.Screen>
      </SafeAreaProvider>
    </FontSizeConfig>
  );
}

//export default App;
export default Sentry.wrap(App);
