import {useFocusEffect} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {Platform} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ad unit id
const adUnitId =
  Platform.OS === 'android' ? config.ANDROID_BANNER_AD : config.IOS_BANNER_AD;

const AdaptiveBanner = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [consentStatus, setConsentStatus] = useState(false);
  // Function to handle the ad load failure
  const handleAdFailedToLoad = () => {
    setAdLoaded(false);
  };

  // Function to handle the ad load success
  const handleAdLoaded = () => {
    setAdLoaded(true);
  };

  // Reset the adLoaded state when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (consentStatus) {
        setAdLoaded(true);
      }
    }, [consentStatus]),
  );
  useFocusEffect(
    React.useCallback(() => {
      // Retrieve consent status from AsyncStorage
      const retrieveConsentStatus = async () => {
        try {
          const consentData = await AsyncStorage.getItem('consentStatus');
          if (consentData !== null) {
            setConsentStatus(JSON.parse(consentData));
          }
        } catch (error) {
          console.error('Error retrieving consent status:', error);
        }
      };

      retrieveConsentStatus();
    }, []),
  );
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />;
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.FULL_BANNER} />;
  return adLoaded ? (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.LARGE_BANNER}
      onAdFailedToLoad={handleAdFailedToLoad}
      onAdLoaded={handleAdLoaded}
    />
  ) : null;
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.MEDIUM_RECTANGLE} />;
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.INLINE_ADAPTIVE_BANNER} />;
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.LEADERBOARD} />;
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.WIDE_SKYSCRAPER} />;
};

export default AdaptiveBanner;
