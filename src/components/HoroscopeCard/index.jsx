import React, { useState, useCallback } from 'react';
import { Button, Text, useTheme } from 'react-native-paper';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import GradientView from '../../common/gradient-view';
import SpinningWheel from '../../common/SpinningWheel';
import AstroHoroscopeUnlockIcon from '../../images/Icons/AstrologyHoroscopeIcon/AstroHoroscopeUnlockIcon';
import HoroscopeArrowIcon from '../../images/Icons/HoroscopeArrowIcon';
import GeneratingHoroscopeCard from '../HoroscopeGeneratingCard';
import PersonalizedHoroscopeCard from '../HoroscopePersonalizedCard';
import {
  getPersonalHoroscope,
  getHoroscopeBirthDetails,
  setShouldRefreshHoroscope,
} from '../../store/apps/astroHoroscope';
import { Track } from '../../../App';

// Memoized selectors to prevent unnecessary re-renders
const selectUserId = state => state?.userInfo?._id;
const selectHoroscopeBirthDetails = state =>
  state.astroHoroscope.horoscopeBirthDetails;
const selectPersonalHoroscope = state => state.astroHoroscope.personalHoroscope;
const selectIsAstroFeatureEnabled = state =>
  state.astroFeature.isAstroFeatureEnabled;
const selectShouldRefreshHoroscope = state =>
  state.astroHoroscope.shouldRefreshHoroscope;

function HoroscopeCard({
  height = 258,
  width = '100%',
  screen = 'Horoscope',
  isScrolling = false,
}) {
  const theme = useTheme();
  const navigator = useNavigation();
  const dispatch = useDispatch();

  // Use memoized selectors
  const userId = useSelector(selectUserId);
  const horoscopeBirthDetails = useSelector(selectHoroscopeBirthDetails);
  const personalHoroscope = useSelector(selectPersonalHoroscope);
  const isAstroFeatureEnabled = useSelector(selectIsAstroFeatureEnabled);
  const shouldRefreshHoroscope = useSelector(selectShouldRefreshHoroscope);

  const [initialLoading, setInitialLoading] = useState(false);
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [stableData, setStableData] = useState(null);
  const [stablePersonalHoroscope, setStablePersonalHoroscope] = useState(null);
  const [stableCardType, setStableCardType] = useState(null);
  const purpose = 'horoscope';

  // Update stable data immediately when new data is available
  React.useEffect(() => {
    if (horoscopeBirthDetails) {
      setStableData(horoscopeBirthDetails);
    }
  }, [horoscopeBirthDetails]);

  React.useEffect(() => {
    if (personalHoroscope) {
      setStablePersonalHoroscope(personalHoroscope);
    }
  }, [personalHoroscope]);

  // Track stable card type to prevent flash during transitions
  React.useEffect(() => {
    if (horoscopeBirthDetails?.data?.horoscopeReport) {
      const report = horoscopeBirthDetails.data.horoscopeReport;
      if (report.generatedStatus) {
        setStableCardType('personalized');
      } else if (report.isFormSubmitted) {
        setStableCardType('generating');
      } else {
        setStableCardType('unlock');
      }
    }
  }, [horoscopeBirthDetails]);

  // Listen for Redux store refresh trigger instead of navigation events
  React.useEffect(() => {
    if (shouldRefreshHoroscope) {
      setForceRefresh(true);
      setHasCompletedInitialLoad(false);
      // Clear the refresh flag
      dispatch(setShouldRefreshHoroscope(false));
    }
  }, [shouldRefreshHoroscope, dispatch]);

  // Memoized fetch function that shows skeleton during API processing
  const fetchPersonalized = useCallback(async () => {
    // Add safety checks to prevent errors
    if (!dispatch || !userId) {
      return;
    }

    try {
      // Show skeleton loader during API processing
      setInitialLoading(true);

      // Execute API calls and wait for completion
      await Promise.all([
        dispatch(getPersonalHoroscope()),
        dispatch(getHoroscopeBirthDetails({ userId, purpose })),
      ]);
    } catch (error) {
      // Silent error handling to prevent console logging issues
      // Error is handled by Redux store's rejected actions
    } finally {
      // Hide skeleton loader after API calls complete (success or failure)
      setInitialLoading(false);
      setHasCompletedInitialLoad(true);
    }
  }, [dispatch, userId, purpose]);

  useFocusEffect(
    React.useCallback(() => {
      // Force refresh if returning from unlock flow
      if (forceRefresh) {
        setForceRefresh(false);
        fetchPersonalized();
        return;
      }

      // Only fetch if we don't have data yet to prevent redundant API calls
      if (!horoscopeBirthDetails && !personalHoroscope && !hasCompletedInitialLoad) {
        fetchPersonalized();
      } else if (horoscopeBirthDetails || personalHoroscope) {
        // Data exists, just mark as completed to avoid skeleton flash
        setHasCompletedInitialLoad(true);
      }
      return () => { };
    }, [fetchPersonalized, horoscopeBirthDetails, personalHoroscope, hasCompletedInitialLoad, forceRefresh]),
  );

  // Use stable data during refreshes to prevent component switching
  const dataToUse = stableData || horoscopeBirthDetails;
  const personalHoroscopeToUse = stablePersonalHoroscope || personalHoroscope;

  // Show skeleton loader during API processing OR before initial load completion
  if (initialLoading || !hasCompletedInitialLoad) {
    return <HoroscopeSkeleton height={height} width={width} />;
  }

  // Use stable card type during transitions to prevent flash
  const currentCardType = (() => {
    if (dataToUse?.data?.horoscopeReport?.generatedStatus) return 'personalized';
    if (dataToUse?.data?.horoscopeReport?.isFormSubmitted && !dataToUse?.data?.horoscopeReport?.generatedStatus) return 'generating';
    return 'unlock';
  })();

  // Use stable card type if available to prevent flash, otherwise use current
  const cardTypeToRender = stableCardType || currentCardType;

  // Render based on stable card type to prevent flash
  if (cardTypeToRender === 'personalized') {
    return (
      <PersonalizedHoroscopeCard
        height={height}
        width={width}
        data={dataToUse?.data}
        result={personalHoroscopeToUse?.data}
        screen={screen}
        isScrolling={isScrolling}
      />
    );
  }

  if (cardTypeToRender === 'generating') {
    return (
      <GeneratingHoroscopeCard
        height={height}
        width={width}
        isScrolling={isScrolling}
      />
    );
  }

  // Default: Show UnlockCard
  return (
    <UnlockCard
      height={height}
      width={width}
      screen={screen}
      isScrolling={isScrolling}
    />
  );
}

function HoroscopeSkeleton({ height, width }) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          height,
          width,
          borderRadius: 8,
          backgroundColor: '#6944D31A',
          borderWidth: 1,
          borderColor: '#FFFFFF1A',
          position: 'relative',
          overflow: 'hidden',
        },
      ]}>
      {/* Background Gradient Skeleton */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#6944D31A',
        }}
      />

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'space-between',
        }}>
        <SkeletonPlaceholder
          backgroundColor="rgba(255, 255, 255, 0.1)"
          highlightColor="rgba(255, 255, 255, 0.2)"
          borderRadius={4}>
          {/* Header Section Skeleton */}
          <View style={{ marginBottom: 20 }}>
            <SkeletonPlaceholder.Item
              width={200}
              height={16}
              marginBottom={4}
            />
            <SkeletonPlaceholder.Item width={150} height={16} />
          </View>

          {/* Main Content Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
            {/* Left Side - User Info */}
            <View style={{ flex: 1 }}>
              {/* Gender */}
              <SkeletonPlaceholder.Item
                width={40}
                height={12}
                marginBottom={8}
              />

              {/* Name */}
              <SkeletonPlaceholder.Item
                width={80}
                height={24}
                marginBottom={8}
              />

              {/* Zodiac */}
              <SkeletonPlaceholder.Item
                width={60}
                height={16}
                marginBottom={16}
              />

              {/* Birth Details */}
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SkeletonPlaceholder.Item width={80} height={12} />
                  <SkeletonPlaceholder.Item
                    width={4}
                    height={4}
                    marginHorizontal={8}
                    borderRadius={2}
                  />
                  <SkeletonPlaceholder.Item width={70} height={12} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SkeletonPlaceholder.Item width={80} height={12} />
                  <SkeletonPlaceholder.Item
                    width={4}
                    height={4}
                    marginHorizontal={8}
                    borderRadius={2}
                  />
                  <SkeletonPlaceholder.Item width={60} height={12} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SkeletonPlaceholder.Item width={80} height={12} />
                  <SkeletonPlaceholder.Item
                    width={4}
                    height={4}
                    marginHorizontal={8}
                    borderRadius={2}
                  />
                  <SkeletonPlaceholder.Item width={120} height={12} />
                </View>
              </View>
            </View>

            {/* Right Side - Zodiac Chart Circle */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SkeletonPlaceholder.Item
                width={120}
                height={120}
                borderRadius={60}
              />
            </View>
          </View>

          {/* Read More Button Skeleton */}
          <View style={{ alignItems: 'center' }}>
            <SkeletonPlaceholder.Item
              width={200}
              height={40}
              borderRadius={20}
            />
          </View>
        </SkeletonPlaceholder>
      </View>
    </View>
  );
}

function UnlockCard({
  height,
  width,
  screen = 'Horoscope',
  isScrolling = false,
}) {
  const theme = useTheme();
  const navigator = useNavigation();
  const userData = useSelector(state => state?.userInfo);

  /** convert string "100%" etc. into a real number */
  const cardWidth =
    typeof width === 'string' ? Dimensions.get('window').width : width;
  /** make the dial a bit larger than the longer card side */
  const dialSize = Math.max(height, cardWidth) * 1.3;

  const handlePress = () => {
    const props = { screen };
    Track({
      cleverTapEvent: 'Personalised_Horoscope_Clicked',
      mixpanelEvent: 'Personalised_Horoscope_Clicked',
      userData,
      cleverTapProps: props,
      mixpanelProps: props,
    });
    navigator.navigate('AstroHoroscopeBirthDetails');
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: isScrolling ? 100 : height,
          width,
          borderRadius: isScrolling ? 16 : 8,
          borderColor: isScrolling ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF1A',
        },
      ]}>
      <GradientView
        variant="modal"
        style={[styles.gradientContainer, { width }]}
        contentStyle={[
          styles.gradientContentBase,
          isScrolling ? styles.shrunkenLayout : styles.fullLayout,
        ]}>
        {/* === spinning background dial === */}
        {!isScrolling && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.centerAll}>
              <SpinningWheel
                source={require('../../images/horoscopeBackground.png')}
                size={100}
                duration={40000}
                style={{
                  width: 500 / 1.3,
                  height: 500 / 1.3,
                  borderRadius: 500 / 2,
                  opacity: 0.3,
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>
        )}

        {isScrolling ? (
          <TouchableOpacity
            onPress={handlePress}
            style={styles.shrunkWrapper}
            activeOpacity={0.8}>
            <View style={styles.shrunkIconWrapper}>
              <AstroHoroscopeUnlockIcon stroke={theme.colors.primary} />
            </View>
            <View style={styles.shrunkTextBlock}>
              <Text style={styles.shrunkTextTitle}>
                Unlock My Personalized Horoscope
              </Text>
            </View>
            <View style={styles.shrunkChevron}>
              <HoroscopeArrowIcon />
            </View>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.iconCircle}>
              <AstroHoroscopeUnlockIcon stroke={theme.colors.primary} />
            </View>

            <Text variant="bold" style={styles.title}>
              Unlock My Personalized Horoscope
            </Text>
            <Text variant="bold" style={styles.subtitle}>
              Share your birth details to unlock personalized predictions
            </Text>

            <Button
              mode="contained"
              onPress={handlePress}
              style={styles.cta}
              theme={{
                colors: { primary: '#fff', onPrimary: theme.colors.primary },
              }}>
              <Text style={[styles.ctaText, { color: theme.colors.primary }]}>
                Unlock Now
              </Text>
            </Button>
          </>
        )}
      </GradientView>
    </View>
  );
}

/* ───────── Updated styles ───────── */
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
  },

  shrunkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    // borderWidth: 1,
    // borderColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },

  shrunkIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
  },

  shrunkTextBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shrunkTextTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  shrunkTextSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },

  shrunkChevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 25,
  },

  gradientContentBase: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },

  fullLayout: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
  },

  shrunkenLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  gradientContainer: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },

  centerAll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconCircle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 6,
  },

  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 1,
    fontWeight: '900',
    color: '#fff',
  },

  subtitle: {
    textAlign: 'center',
    marginBottom: 6,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  cta: {
    borderRadius: 8,
    width: '100%',
  },

  ctaText: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default HoroscopeCard;
