import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import GradientView from '../../common/gradient-view';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useWallet} from '../../context/WalletContext';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {Track} from '../../../App';

interface RootStackParamList {
  AstroBirthDetailsTabs: {
    type: 'Call' | 'Chat';
  };
}

const Wallet = ({
  cleverTapEvent,
  mixpanelEvent,
}: {
  cleverTapEvent: string;
  mixpanelEvent: string;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {totalBalance} = useWallet();
  const userData = useSelector((state: RootState) => state.userInfo);
  const WalletBalanceAmt = useSelector(
    (state: RootState) => state.walletSlice.walletBalance,
  );

  return (
    <TouchableOpacity
      style={styles.walletContainer}
      onPress={() => {
        Track({
          cleverTapEvent,
          mixpanelEvent,
          userData,
        });
        navigation.navigate('WalletHistory');
      }}>
      <Text style={styles.amount}>₹ {totalBalance.toFixed(2)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  currencySymbol: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Wallet;
