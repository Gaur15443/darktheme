// MobileVerificationGuard.js
import React, {useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useWallet} from '../../../context/WalletContext';
import {ActivityIndicator, View} from 'react-native';

const MobileVerificationGuard = ({children, navigationTarget}) => {
  const navigation = useNavigation();
  const userId = useSelector(state => state.userInfo._id);
  const {fetchWalletData, isVerified, setIsVerified} = useWallet();

  const [checking, setChecking] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      const verifyWallet = async () => {
        setChecking(true);
        try {
          if (isVerified) return;

          const walletData = await fetchWalletData(userId);

          if (!walletData) {
            // 🚀 Redirect immediately, do not render tabs
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'AstrologyLoginWithMobile',
                  params: {
                    navigationTarget,
                    onVerified: async () => {
                      await fetchWalletData(userId);
                      setIsVerified(true);
                      navigation.replace(navigationTarget);
                    },
                  },
                },
              ],
            });
          } else {
            setIsVerified(true);
          }
        } catch (err) {
          console.error('❌ Wallet verification error:', err);
        } finally {
          setChecking(false);
        }
      };

      verifyWallet();
    }, [userId, isVerified]),
  );

  if (checking || !isVerified) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

export default MobileVerificationGuard;
