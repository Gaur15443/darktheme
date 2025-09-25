import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {useInterstitialAd} from 'react-native-google-mobile-ads';
import config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InterstitialAdComponent = () => {
  // Ad unit id
  const adUnitId =
    Platform.OS === 'android'
      ? config.ANDROID_INTERSTITIAL_AD
      : config.IOS_INTERSTITIAL_AD;

  const {isLoaded, load, isClosed, show} = useInterstitialAd(adUnitId);
  const [consentStatus, setConsentStatus] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Function to generate a random ad
  const getRandomAd = () => {
    const no = Math.random();
    const value = no < 0.1;

    return value;
  };

  useFocusEffect(
    useCallback(() => {
      try {
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

        const loadAd = async () => {
          await load();
        };
        loadAd();
        // setIsFocused(true);
      } catch (_error) {
        /** empty. */
      }

      return () => {
        setIsFocused(false);
        setConsentStatus(false);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && getRandomAd() && consentStatus) {
        setIsFocused(true);
      } else {
        // Ensure the ad is always loaded if conditions are not met
        if (!isLoaded) {
          load();
        }
      }
    }, [isLoaded, consentStatus]),
  );

  useEffect(() => {
    if (isFocused) {
      show();
      setIsFocused(false); // Reset after showing the ad
    }
  }, [isFocused, show]);

  useEffect(() => {
    if (isClosed) {
      load();
      setConsentStatus(false);
    }
  }, [isClosed, load]);

  return null;
};

export default InterstitialAdComponent;
