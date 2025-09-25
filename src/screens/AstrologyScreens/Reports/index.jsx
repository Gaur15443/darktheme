import { View } from 'react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Portal, Text, useTheme } from 'react-native-paper';
import { ScrollView, TouchableOpacity } from 'react-native';
import GradientView from '../../../common/gradient-view';
import AstroReportsIcon from '../../../images/Icons/AstrologyBottomTabIcons/AstroReportsIcon';
import StarIcon from '../../../images/Icons/StarIcon';
import PlanetIcon from '../../../images/Icons/PlanetIcon';
import SparkleIcon from '../../../images/Icons/SparkleIcon';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import MobileVerificationGuard from '../../../components/Wallet/MobileVerificationGuard';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAstroReports,
  getSavedKundli,
  getSavedKundliById,
  setIsFirstTimeUser,
  setSelectedReport,
  setSelectedReportDiscount,
  setSelectedReportId,
  setSelectedReportPrice,
  setStoredKundliObject,
  updateSavedKundli,
  updateSavedKundlis,
} from '../../../store/apps/astroKundali';
import Spinner from '../../../common/Spinner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigatedStack } from '../../../../AppChild';
import ErrorBoundary from '../../../common/ErrorBoundary';
import TowerIcon from '../../../images/Icons/owerIcon';
import ReportsSlide from './ReportsSlide';
import Toast from 'react-native-toast-message';
import { Track } from '../../../../App';
import AstroConfirmPush from '../../../components/AstroConfirmPush';
import { usePushNotification } from '../../../context/PushNotificationContext';
import {
  setRequestPermissionState,
  setShownInReports,
} from '../../../store/apps/pushnotification';
import { setSelectedIndex, setSelected } from '../../../store/apps/reportsSlide';
import AstroHeader from '../../../common/AstroHeader';
import { setAstroLinkingParams } from '../../../store/apps/astroLinking';
import Svg, { Path } from 'react-native-svg';

function formatTime(time) {
  time = time || new Date();
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    hour12: true,
  }).format(new Date(time));

  return formattedTime;
}

function formatDate(date) {
  date = date || new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
  return formattedDate;
}

const CARD_BREAKPOINT = 380;

const LongArrow = props => (
  <Svg
    width={16}
    height={10}
    viewBox="0 0 16 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Path
      d="M1 5H15"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 9L15 5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 1L15 5"
      stroke="white"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function Reports() {
  /**
   * @typedef {Object} SwiperRef
   * @property {function(number, boolean=): void} scrollTo - Scroll to a specific index
   * @property {{ index: number }} state - Current state of the swiper
   */

  /**
   * @type {import('react-native-swiper').default}
   */
  const swiperRef = useRef(null);
  const pushContext = usePushNotification();
  const route = useRoute();
  const dispatch = useDispatch();
  const theme = useTheme();
  const pageIsFocused = useIsFocused();
  const { bottom } = useSafeAreaInsets();
  const userData = useSelector(state => state.userInfo);
  const shownInReports = useSelector(
    state => state.pushNotificationSlice.shownInReports,
  );
  const selected = useSelector(state => state.reportsSlide.selected);
  const selectedIndex = useSelector(state => state.reportsSlide.selectedIndex);
  const savedKundlis = useSelector(
    state => state.astroKundaliSlice.savedKundlis,
  );
  const astroLinkingParams = useSelector(state => state.astroLinking.params);
  const reports = useSelector(state => state.astroKundaliSlice.astroReports);
  const storedKundliObject = useSelector(
    state => state.astroKundaliSlice.storedKundliObject,
  );
  const navigator = useNavigation();
  const [savedKundli, setSavedKundli] = useState({});
  const [loading, setLoading] = useState(true);
  const [slideRenderKey, setSlideRenderKey] = useState(Date.now());
  const [showPushPopup, setShowPushpopup] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (pageIsFocused) {
        setSlideRenderKey(Date.now());
        dispatch(setSelected(false));
        dispatch(setSelectedIndex(-1));
      }
      Track({
        cleverTapEvent: 'Reports_Page_Visited',
        mixpanelEvent: 'Reports_Page_Visited',
        userData,
      });
    }, []),
  );

  // useFocusEffect(
  //   React.useCallback(() => {
  //     return () => {
  //       navigatedStack.push('Reports');
  //     };
  //   }, [route]),
  // );

  useEffect(() => {
    (async () => {
      try {
        const promises = [];

        if (
          astroLinkingParams?.path === 'Reports' &&
          astroLinkingParams?.params?.kundliId
        ) {
          setLoading(true);
          if (!reports?.length) {
            await dispatch(getAstroReports()).unwrap();
          }
          fetchSavedKundaliById(astroLinkingParams?.params?.kundliId).finally(
            () => {
              dispatch(setAstroLinkingParams(null));
              setLoading(false);
            },
          );
          return;
        }

        if (!reports?.length) {
          setLoading(true);
          promises.push(dispatch(getAstroReports()).unwrap());

          if (!savedKundlis?.length) {
            try {
              const result = await dispatch(getSavedKundli()).unwrap();
              if (result?.length) {
                dispatch(updateSavedKundli(result[0]));
                dispatch(setIsFirstTimeUser(false));
                setSavedKundli(result[0]);
                dispatch(setStoredKundliObject(result[0]));
              }
            } catch (_error) { }
          }
        }

        if (storedKundliObject?._id) {
          console.log(storedKundliObject._id, 'storedKundliObject._id');
          promises.push(fetchSavedKundaliById(storedKundliObject._id));
        }

        await Promise.all(promises);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      }
    })();
  }, [pageIsFocused]);

  useFocusEffect(
    useCallback(() => {
      checkPushPermission();
    }, []),
  );
  async function checkPushPermission() {
    if (shownInReports) return;
    const enabled = await pushContext.checkNotificationPermission();

    if (!enabled) {
      dispatch(setRequestPermissionState(true));
    }
  }

  const reportsDisplayed = useMemo(() => {
    return (
      reports?.filter?.(report => report?.status?.toLowerCase?.() !== 'hide') ||
      []
    );
  }, [reports]);

  async function fetchSavedKundaliById(id) {
    try {
      const saved = await dispatch(getSavedKundliById(id)).unwrap();
      setSavedKundli(saved);
      dispatch(setStoredKundliObject(saved));
      return saved;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  }

  const handleReportSelection = useCallback((_slide, slideIndex) => {
    dispatch(setSelectedReport(_slide.typeOfReport));
    dispatch(setSelectedReportId(_slide._id));
    dispatch(
      setSelectedReportPrice(_slide?.activeOfferId?.[0]?.originalPrice?.inr),
    );
    dispatch(
      setSelectedReportDiscount(
        _slide?.activeOfferId?.[0]?.originalPrice?.inr -
        _slide?.activeOfferId?.[0]?.offerPrice?.inr,
      ),
    );
    dispatch(setSelected(true));
    dispatch(setSelectedIndex(slideIndex));
  }, []);

  return (
    <ErrorBoundary.Screen>
      <MobileVerificationGuard navigationTarget="Reports" redirectTo="Reports">
        {!shownInReports && pageIsFocused && (
          <AstroConfirmPush onClose={() => dispatch(setShownInReports(true))} />
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
          {!loading && (
            <>
              <AstroHeader>
                <AstroHeader.Content
                  title="Reports"
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingRight: 10,
                  }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      paddingHorizontal: 12,
                      paddingVertical: 4.5,
                      borderRadius: 8,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                    }}
                    onPress={() => navigator.navigate('AstroOrderHistory')}>
                    <Text style={{ fontSize: 14 }}>My Orders</Text>
                    <LongArrow />
                  </TouchableOpacity>
                </AstroHeader.Content>
              </AstroHeader>
              <ScrollView
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
                }}>
                <View style={{ marginBottom: 10 }}>
                  <Text variant="bold" style={{ fontSize: 18, marginBottom: 10 }}>
                    Navigate your future with iMeUsWe Astrology
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    iMeUsWe Astrology Reports offer profound insights into your
                    life's journey, covering key areas like career, marriage,
                    health, and well-being. By revealing deeper aspects of your
                    personality, these reports empower you to navigate life with
                    greater clarity and confidence.
                  </Text>
                </View>
                <ReportsInfo />
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 14.5,
                      marginBottom: 10,
                      marginTop: 10,
                      alignItems: 'center',
                    }}>
                    <SparkleIcon style={{ transform: [{ scaleX: -1 }] }} />
                    <Text style={{ padding: 1, fontSize: 14, fontWeight: 500 }}>
                      Choose your report
                    </Text>
                    <SparkleIcon />
                  </View>
                  <ReportsSlide key={slideRenderKey} />
                  <View style={{ marginBlock: 70 }} />
                  {pageIsFocused && selected && selectedIndex >= 0 && (
                    <Portal>
                      <GradientView
                        style={{
                          position: 'absolute',
                          bottom: 60 + bottom,
                          right: 0,
                          left: 0,
                          zIndex: 2,
                          width: '100%',
                        }}
                        contentStyle={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 15,
                        }}>
                        <View>
                          <Text
                            style={{
                              fontSize: 14,
                              flexShrink: 1,
                              paddingRight: 10,
                            }}
                            ellipsizeMode="tail"
                            numberOfLines={1}>
                            {reportsDisplayed?.[selectedIndex]?.typeOfReport}{' '}
                            Report
                          </Text>
                          <Text
                            variant="bold"
                            style={{
                              fontSize: 20,
                            }}>
                            {`₹${reportsDisplayed?.[selectedIndex]?.activeOfferId?.[0]?.offerPrice?.inr}`}
                          </Text>
                        </View>
                        <Button
                          onPress={() => {
                            dispatch(setSelected(true));
                            Track({
                              cleverTapEvent: 'Reports_Continue_CTA_Clicked',
                              mixpanelEvent: 'Reports_Continue_CTA_Clicked',
                              userData,
                            });
                            handleReportSelection(
                              reportsDisplayed[selectedIndex],
                              selectedIndex,
                            );
                            navigator.navigate('AstroBirthDetailsScreen');
                          }}
                          mode="contained"
                          theme={{
                            colors: {
                              primary: '#fff',
                              onPrimary: theme.colors.primary,
                            },
                          }}
                          style={{
                            height: 46,
                            borderRadius: 8,
                            justifyContent: 'center',
                          }}>
                          Continue
                        </Button>
                      </GradientView>
                    </Portal>
                  )}
                </View>
                <View style={{ marginBottom: 60 }} />
              </ScrollView>
            </>
          )}
        </View>
      </MobileVerificationGuard>
    </ErrorBoundary.Screen>
  );
}

const ReportsInfo = memo(() => (
  <ScrollView horizontal style={{ marginBottom: 10 }}>
    {[
      {
        icon: <PlanetIcon />,
        text: 'Personalized Astrological Insights',
      },
      {
        icon: <StarIcon />,
        text: 'Reviewed by Expert Astrologers',
      },
      {
        icon: <AstroReportsIcon />,
        text: 'Easy-to-Understand Reports',
      },
      {
        icon: <TowerIcon />,
        text: 'Comprehensive Life Guidance',
      },
    ].map((item, index) => (
      <View
        key={index}
        style={{
          height: 78,
          width: 150,
          backgroundColor: '#FFFFFF0D',
          marginRight: 10,
          padding: 8,
          borderRadius: 6,
          justifyContent: 'space-between',
        }}>
        {item.icon}
        <Text style={{ fontSize: 10 }}>{item.text}</Text>
      </View>
    ))}
  </ScrollView>
));

Reports.displayName = 'Reports';

export default memo(Reports);
