import React, {useEffect, useState} from 'react';
import {useRewardedAd, TestIds} from 'react-native-google-mobile-ads';

const RewardedInterstitialAdComponent = () => {
  const {isLoaded, load, isClosed, show} = useRewardedAd(
    TestIds.REWARDED_INTERSTITIAL,
  );
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      const loadAd = async () => {
        await load();
      };

      loadAd();
    } catch (_error) {}
  }, [load]);

  useEffect(() => {
    try {
      const handleNavigation = async () => {
        if (isLoaded) {
          setAdLoaded(true);
          await show();
        }
      };

      handleNavigation();
    } catch (_error) {}
  }, [isLoaded, show]);

  useEffect(() => {
    if (adLoaded && isClosed) {
    }
  }, [adLoaded, isClosed]);

  return <></>;
};
export default RewardedInterstitialAdComponent;
