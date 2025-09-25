import {Pressable, View, ScrollView, Image} from 'react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Text, useTheme} from 'react-native-paper';
import GradientView from '../../../common/gradient-view';
import HeartSolidIcon from '../../../images/Icons/HeartIcon/HeartSolidIcon';
import SuitCaseIcon from '../../../images/Icons/SuitCaseIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BellIcon from '../../../images/Icons/BellIcon';
import {useDispatch, useSelector} from 'react-redux';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {
  getAstroBannerDetails,
  getAstroHomeData,
} from '../../../store/apps/astroHome';
import Toast from 'react-native-toast-message';
import Spinner from '../../../common/Spinner';
import HoroscopeCard from '../../../components/HoroscopeCard';
import {AppDispatch, RootState} from '../../../store';
import {
  defaultLocation,
  fetchUserLocation,
} from '../../../store/apps/userLocation';
import PanchangCard from '../../../components/AstroHome/PanchangCard';
import type {PanchangDataProps} from '../../../components/AstroHome/PanchangCard/index.d';
import Slider from '../../../components/AstroHome/Slider';
import type {SliderProps} from '../../../components/AstroHome/Slider/index.d';
import HomeReportCard from '../../../components/AstroHome/HomeReportCard';
import {HomeReportCardProps} from '../../../components/AstroHome/HomeReportCard/index.d';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {Track} from '../../../../App';
import {usePushNotification} from '../../../context/PushNotificationContext';
import AstroConfirmPush from '../../../components/AstroConfirmPush';
import {
  setRequestPermissionState,
  setShowedInHome,
} from '../../../store/apps/pushnotification';
import SparkleIcon from '../../../images/Icons/SparkleIcon';
import PromotionalBanner from '../../../components/AstroHome/PromotionalBanner';

type VedicCardProps = {
  data: {
    header: string;
    subHeader: (string | number | boolean | React.ReactNode)[];
  };
};

const VedicCard = memo(({data}: VedicCardProps) => {
  return (
    <View
      style={{
        minHeight: 168,
        backgroundColor: '#2B2941',
        borderRadius: 8,
        borderColor: '#FFFFFF33',
        borderWidth: 1,
        padding: 12,
        gap: 8,
      }}>
      <Text
        // @ts-ignore
        variant="bold"
        style={{
          fontSize: 14,
          lineHeight: 16.45,
        }}>
        {data?.header}
      </Text>

      {data?.subHeader.map(
        (
          item:
            | string
            | number
            | boolean
            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
            | Iterable<React.ReactNode>
            | React.ReactPortal
            | null
            | undefined,
          itemIndex: React.Key | null | undefined,
        ) => (
          <View
            key={itemIndex}
            style={{
              flexDirection: 'row',
              gap: 8,
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}>
            <SparkleIcon />
            <Text
              style={{
                fontSize: 14,
              }}>
              {item}
            </Text>
          </View>
        ),
      )}
    </View>
  );
});

export default function Home() {
  const pushContext = usePushNotification();
  const dispatch = useDispatch<AppDispatch>();
  const navigator = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const userLocation = useSelector(
    (state: RootState) => state.userLocation.data,
  );
  const pageIsFocused = useIsFocused();
  const userData = useSelector((state: RootState) => state.userInfo);
  const userId = useSelector((state: RootState) => state.userInfo._id);
  const showedInHome = useSelector(
    (state: RootState) => state.pushNotificationSlice.showedInHome,
  );
  const isPersonalisedHoroscopeEnabled = useSelector(
    (state: RootState) => state.astroFeature.isPersonalisedHoroscopeEnabled,
  );
  const personalDetails = useSelector(
    (state: RootState) => state.userInfo.personalDetails,
  );

  const homeData = useSelector((state: RootState) => state.astroHome.data);
  const showedBanner = useSelector(
    (state: RootState) => state.astroHome.showedBanner,
  );
  const bannerDetails = useSelector(
    (state: RootState) => state.astroHome.bannerDetails,
  );

  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const showRedDot = useSelector((state: RootState) => state.redDot.showRedDot);
  const showRedDotLikeComment = useSelector(
    (state: RootState) => state.redDot.showRedDotLikeComment,
  );

  const shouldShowRedDot = useMemo(() => {
    const receiverIsPresent =
      (showRedDotLikeComment as any)?.notificationReceivers?.includes?.(
        userId,
      ) ?? false;

    return (
      showRedDot || ((showRedDotLikeComment as any).redDot && receiverIsPresent)
    );
  }, [showRedDot, showRedDotLikeComment, userId]);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({y: 0, animated: false});
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      Track({
        cleverTapEvent: 'Astrology_Home',
        mixpanelEvent: 'Astrology_Home',
        userData,
      });
    }, []),
  );

  const fetchHomeData = useCallback(async () => {
    try {
      let locationInfo = userLocation;

      if (!userLocation?.city) {
        locationInfo = await dispatch(fetchUserLocation()).unwrap();
      }

      const date = new Date();
      const formattedDate = date.toLocaleDateString('en-GB');

      const data = {
        date: formattedDate,
        location: {
          place: defaultLocation.country_name,
          latitude: defaultLocation.coordinates[0],
          longitude: defaultLocation.coordinates[1],
        },
      };

      // @ts-ignore
      return dispatch(getAstroHomeData(data)).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }, [userLocation, dispatch]);

  useFocusEffect(
    useCallback(() => {
      checkPushPermission();
      if (!bannerDetails?._id) {
        dispatch(getAstroBannerDetails()).then(res => {
          setTimeout(() => {
            setShowBanner(true);
          }, 0);
        });
      }
    }, []),
  );

  useEffect(() => {
    if (!(homeData?.[0]?.length > 0) && !(homeData?.[1]?.length > 0)) {
      setLoading(true);

      fetchHomeData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function checkPushPermission() {
    const enabled = await pushContext.checkNotificationPermission();

    if (!enabled) {
      dispatch(setRequestPermissionState(true));
    } else {
      dispatch(setShowedInHome(true));
    }
  }

  return (
    <ErrorBoundary.Screen>
      {!showedInHome && pageIsFocused && (
        <AstroConfirmPush onClose={() => dispatch(setShowedInHome(true))} />
      )}
      {showBanner && showedInHome && !showedBanner && pageIsFocused && (
        <PromotionalBanner onClose={() => setShowBanner(false)} />
      )}
      <View
        style={{
          flex: 1,
        }}>
        {loading && (
          <View
            style={{
              width: '100%',
              height: '100%',
              alignSelf: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.background,
            }}>
            <Spinner />
          </View>
        )}
        {!loading &&
          Object.entries(homeData?.[0] || {})?.length > 0 &&
          Object.entries(homeData?.[1] || {})?.length > 0 && (
            <ScrollView
              ref={scrollRef}
              scrollEnabled
              style={{
                paddingBottom: 100,
                flex: 1,
                backgroundColor: 'transparent',
              }}>
              <GradientView
                variant="modal"
                colors={['#6944D3', '#000000']}
                style={{
                  height: 200,
                  borderBottomRightRadius: 24,
                  borderBottomLeftRadius: 24,
                }}
                contentStyle={{
                  height: '100%',
                  justifyContent: 'space-between',
                  paddingBottom: 24,
                  paddingTop: insets.top + 4,
                  borderBottomRightRadius: 24,
                  borderBottomLeftRadius: 24,
                  paddingHorizontal: 16,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      marginBottom: 6,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        gap: 6,
                      }}>
                      <Image
                        source={{
                          uri: 'https://testing-email-template.s3.ap-south-1.amazonaws.com/astro-logo.png',
                        }}
                        style={{height: 32, width: 161}}
                      />
                      {/* <AstrologyTextIcon /> */}
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    <Pressable
                      style={{
                        position: 'relative',
                      }}
                      // @ts-ignore
                      onPress={() => navigator.navigate('AstroNotifications')}>
                      <BellIcon />
                      {shouldShowRedDot && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 3,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: 5,
                            backgroundColor: 'red',
                          }}
                        />
                      )}
                    </Pressable>
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 24,
                    }}>
                    {/* @ts-ignore */}
                    Hi {personalDetails?.name || ''},
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                    }}>
                    {homeData?.[0]?.description}
                  </Text>
                </View>
              </GradientView>
              <View
                style={{
                  paddingHorizontal: 10,
                }}>
                <View>
                  {/* Horoscope */}
                  {isPersonalisedHoroscopeEnabled && (
                    <>
                      <View style={{padding: 10}}></View>
                      <HoroscopeCard screen="Home" />
                    </>
                  )}
                  <View style={{padding: 10}}></View>
                  <Slider vedic={homeData?.[0] as SliderProps['vedic']} />

                  {/* Vedic */}
                  {homeData?.[0]?.vedicAstrology && (
                    <VedicCard data={homeData?.[0]?.vedicAstrology} />
                  )}
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      marginTop: 24,
                    }}
                  />
                </View>
                {/* Relationship */}
                <HomeReportCard
                  data={
                    homeData?.[0]
                      ?.matchMakingCard as HomeReportCardProps['data']
                  }
                  navigationScreen="Reports"
                  Icon={HeartSolidIcon}
                  gradient={['#FFE03D', '#0E0E10']}
                />
                {/* Career */}
                <HomeReportCard
                  data={
                    homeData?.[0]
                      ?.careerReportCard as HomeReportCardProps['data']
                  }
                  navigationScreen="Reports"
                  Icon={SuitCaseIcon}
                  gradient={['#27C394', '#0E0E10']}
                />
                {/* Panchang */}
                <PanchangCard data={homeData?.[1] as PanchangDataProps} />
                <View
                  style={{
                    height: 100,
                  }}
                />
              </View>
            </ScrollView>
          )}
      </View>
    </ErrorBoundary.Screen>
  );
}
