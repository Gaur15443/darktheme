import React, { memo, useCallback, useMemo, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import { BackIcon } from '../../images';
import { BlurView } from '@react-native-community/blur';
import AstroHomeIcon from '../../images/Icons/AstrologyBottomTabIcons/AstroHomeIcon';
import AstroHoroscopeIcon from '../../images/Icons/AstrologyBottomTabIcons/AstroHoroscopeIcon';
import AstroPanchangIcon from '../../images/Icons/AstrologyBottomTabIcons/AstroPanchangIcon';
import { astroTheme, Track } from '../../../App';
import Home from '../../screens/AstrologyScreens/Home';
import Horoscope from '../../screens/AstrologyScreens/Horoscope';
import Panchang from '../../screens/AstrologyScreens/Panchang';
import {
  useIsFocused,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import AstroReportsIcon from '../../images/Icons/AstrologyBottomTabIcons/AstroReportsIcon';
import Reports from '../../screens/AstrologyScreens/Reports';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import AstroArrowIcon from '../../images/Icons/AstrologyBottomTabIcons/AstroArrowIcon';
import Consultation from '../../screens/AstrologyScreens/Consultation';
import AstroConsultationIcon from '../../images/Icons/AstrologyBottomTabIcons/AstroConsultationIcon';
import ConsultationBlur from '../ConsultationBlur';
import {
  setAstroFeatureEnabled,
  setPersonalisedHoroscopeEnabled,
  setConsultationEnabled,
} from '../../store/apps/astroFeatureSlice';
import { setAstroLinking } from '../../store/apps/astroLinking';

const tabLogo = require('../../images/Icons/AstroLogo.png');

const Tab = createBottomTabNavigator();

const BUTTON_HEIGHT = 60;

const TabBarButton = memo(
  ({
    text,
    children,
    style = {},
    isImeuswe = false,
    onFocus = () => { },
    ...props
  }) => {
    const isFocused = useIsFocused();

    useEffect(() => {
      if (isFocused) {
        onFocus();
      }
    }, [isFocused]);

    return (
      <Pressable
        {...props}
        style={[
          styles.tabBarButton,
          style,
          { height: BUTTON_HEIGHT, opacity: isFocused || isImeuswe ? 1 : 0.5 },
        ]}>
        {children}
        {!isImeuswe && text && (
          <Text
            variant={isFocused ? 'bodyLarge' : 'bodySmall'}
            style={{ fontSize: 9, lineHeight: 16, textAlign: 'center' }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {text}
          </Text>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  buttonContainer: {
    width: 20,
    height: 21,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingBlock: 6,
  },
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    elevation: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  headerStyle: {
    backgroundColor: 'transparent',
    height: 100,
  },
  backButton: {
    marginLeft: 10,
  },
  imeusweContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  imeusweButton: {
    backgroundColor: '#E77237',
    width: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingVertical: 12,
    paddingRight: 17,
    paddingLeft: 13,
    position: 'relative',
  },
  arrowContainer: {
    position: 'absolute',
    right: 8,
    top: 2,
    bottom: 0,
  },
  logoImage: {
    height: 16.76,
    width: 42.65,
  },
});

const NUMBER_OF_TABS = 6;
const TAB_WIDTH = Dimensions.get('window').width / NUMBER_OF_TABS;

const tabPositions = {
  AstroHome: 0,
  Consultation: 1,
  Reports: 2,
  Horoscope: 3,
  Panchang: 4,
  IMeUsWe: 5,
};

const AstroBottomTabs = function ({ navigation }) {
  const { bottom } = useSafeAreaInsets();
  const userData = useSelector(state => state.userInfo);
  const navigator = useNavigation();
  const dispatch = useDispatch();
  const theme = useMemo(() => astroTheme, []);
  const navigationState = useNavigationState(state => state);

  const userInfo = useSelector(state => state.userInfo);
  const deepLinkingPath = useSelector(state => state.astroLinking.path);
  const [isConsultationState, setIsConsultationState] = useState(false);
  const astroReleaseController = useSelector(
    state => state?.userManagementToasts.userManagementToastsConfig,
  );
  const isConsultationEnabled = useSelector(
    state => state.astroFeature.isConsultationEnabled,
  );
  const indicatorPosition = useSharedValue(0);

  const getTabPosition = tabName => {
    return tabPositions[tabName] * TAB_WIDTH;
  };

  const getActiveTab = () => {
    const routes = navigationState.routes;
    const currentRoute = routes[routes.length - 1];
    const tabState = currentRoute.state;

    if (tabState && tabState.routes) {
      const activeTabRoute = tabState.routes[tabState.index || 0];
      return activeTabRoute.name;
    }
    return currentRoute.name;
  };

  useEffect(() => {
    let activeTab;
    if (
      navigationState?.routes[navigationState?.index]?.name ===
      'AstroBottomTabs' &&
      typeof navigationState?.routes[navigationState?.index].path ===
      'undefined' &&
      !navigationState?.routes[navigationState?.index]?.state
    ) {
      activeTab =
        navigationState?.routes[navigationState?.index]?.params?.screen;
    } else {
      activeTab = getActiveTab();
    }

    if (tabPositions[activeTab] !== undefined) {
      indicatorPosition.value = getTabPosition(activeTab);
    }
  }, [navigationState, indicatorPosition]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(indicatorPosition.value, {
            damping: 20,
            stiffness: 300,
          }),
        },
      ],
    };
  });

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const createTabScreen = useCallback(
    (name, component, icon, trackingInfo = {}, isImeuswe = false) => (
      <Tab.Screen
        name={name}
        component={component}
        options={{
          tabBarButton: props => (
            <TabBarButton
              text={name === 'AstroHome' ? 'Astrology' : name}
              isImeuswe={isImeuswe}
              {...props}
              onFocus={() => {
                indicatorPosition.value = getTabPosition(name);
              }}
              onPress={() => {
                indicatorPosition.value = getTabPosition(name);

                if (name === 'IMeUsWe') {
                  dispatch(setAstroLinking(null));
                  navigator.navigate('BottomTabs', { screen: 'Home' });
                } else {
                  navigator.navigate('AstroBottomTabs', { screen: name });
                }

                if (trackingInfo && trackingInfo?.cleverTapEvent) {
                  Track({
                    cleverTapEvent: trackingInfo.cleverTapEvent,
                    mixpanelEvent: trackingInfo.mixpanelEvent,
                    userData,
                  });
                }
              }}>
              <View
                style={
                  isImeuswe ? styles.imeusweContainer : styles.buttonContainer
                }>
                {isImeuswe ? (
                  <View style={styles.imeusweButton}>
                    <View style={styles.arrowContainer}>
                      <AstroArrowIcon />
                    </View>
                    <View>
                      <Image
                        source={{
                          uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/WhiteLogo.png',
                        }}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                ) : (
                  icon
                )}
              </View>
            </TabBarButton>
          ),
        }}
      />
    ),
    [indicatorPosition, navigator, userData, getTabPosition],
  );

  const ConsultationScreen = Consultation;

  return (
    <PaperProvider theme={theme}>
      <Animated.View
        style={[
          {
            backgroundColor: '#fff',
            height: 4,
            width: TAB_WIDTH,
            maxWidth: TAB_WIDTH,
            position: 'absolute',
            bottom: BUTTON_HEIGHT + bottom - 5,
            zIndex: 1,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
          },
          animatedIndicatorStyle,
        ]}
      />
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: theme.colors.background }}
        initialRouteName="AstroHome"
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onPrimary,
          sceneStyle: {
            backgroundColor: theme.colors.background,
          },
          headerLeft: ({ ...props }) => (
            <Pressable
              {...props}
              onPress={handleBackPress}
              style={styles.backButton}>
              <BackIcon />
            </Pressable>
          ),
          tabBarStyle: { ...styles.tabBarStyle, height: BUTTON_HEIGHT + bottom },
          tabBarBackground: () => (
            <BlurView
              style={{ height: BUTTON_HEIGHT + bottom }}
              blurType="light"
              blurAmount={20}
            />
          ),
          tabBarActiveTintColor: theme.colors.onPrimary,
          tabBarInactiveTintColor: theme.colors.onPrimary,
        }}>
        {createTabScreen('AstroHome', Home, <AstroHomeIcon />)}
        {createTabScreen(
          'Consultation',
          ConsultationScreen,
          <AstroConsultationIcon />,
          null,
        )}
        {createTabScreen('Reports', Reports, <AstroReportsIcon />, null)}
        {createTabScreen('Horoscope', Horoscope, <AstroHoroscopeIcon />, null)}
        {createTabScreen('Panchang', Panchang, <AstroPanchangIcon />, null)}
        {createTabScreen(
          'IMeUsWe',
          Home,
          null,
          {
            cleverTapEvent: 'Switch_Ancestory',
            mixpanelEvent: 'Switch_Ancestory',
          },
          true,
        )}
      </Tab.Navigator>
    </PaperProvider>
  );
};

export default memo(AstroBottomTabs);
