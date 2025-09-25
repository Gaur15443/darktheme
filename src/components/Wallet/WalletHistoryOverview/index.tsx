import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import GradientView from '../../../common/gradient-view';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useWallet} from '../../../context/WalletContext';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../../store';
import axios from 'axios';
import authConfig from '../../../configs';
import {AppDispatch} from '../../../store';
import {fetchTransactions, resetTransactions} from '../../../store/apps/wallet';
import {Track} from '../../../../App';
import Toast from 'react-native-toast-message';

const WalletHistoryOverview: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    transactions,
    loading,
    hasMore,
    page,
    pageSize,
    totalPages,
    totalRecords,
  } = useSelector((state: RootState) => state.walletSlice);

  const {totalBalance, fetchWalletData, walletErrorMessage} = useWallet();
  const userId = useSelector((state: RootState) => state?.userInfo?._id);
  const walletToasts = useSelector(
    state => state.walletSlice.toastConfig.wallet,
  );
  const [hasFetched, setHasFetched] = useState(false);

  const userData = useSelector((state: RootState) => state.userInfo);
  const paymentModeMap = {
    NB: 'Net Banking',
    DC: 'Debit Card',
    CC: 'Credit Card',
    UPI: 'UPI',
    WALLET: 'Wallet',
    CASH: 'Cash',
    PAYTM: 'Paytm',
    RECHARGE: 'Recharge',
  } as const;

  const getReadableMode = (code: string | undefined) => {
    if (!code) return 'N/A';

    const upperCode = code.toUpperCase();
    return (
      paymentModeMap[upperCode as keyof typeof paymentModeMap] || upperCode
    );
  };

  const handleRechargePress = () => {
    if (walletErrorMessage?.message === 'walletCreationFailed') {
      Toast.show({
        type: 'error',
        text1: walletToasts?.error?.['5001'],
      });
      return;
    }
    const props = {
      'Available Balance': totalBalance.toFixed(2),
    };
    Track({
      userData,
      cleverTapEvent: 'View_Recharge_page',
      mixpanelEvent: 'View_Recharge_page',
      cleverTapProps: props,
      mixpanelProps: props,
    });
    navigation.navigate('MoneyPreDefined');
  };

  const formatDateTime = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);

    // Get the date parts
    const day = date.toLocaleDateString('en-GB', {day: 'numeric'}); // e.g. "22"
    const month = date.toLocaleDateString('en-GB', {month: 'long'}); // e.g. "June"
    const year = date.toLocaleDateString('en-GB', {year: 'numeric'}); // e.g. "2025"

    // Get time like "7:33 PM"
    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Combine with a comma after the month
    return `${day} ${month}, ${year} · ${timePart}`;
  };
  useFocusEffect(
    useCallback(() => {
      if (userId && !hasFetched) {
        dispatch(resetTransactions());
        dispatch(fetchTransactions({userId, page: 1, pageSize}));
        fetchWalletData(userId);
        setHasFetched(true);
      }
    }, [userId, dispatch, fetchWalletData, hasFetched]),
  );
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        dispatch(resetTransactions());
        dispatch(fetchTransactions({userId, page: 1, pageSize}));

        fetchWalletData(userId); // also refresh the wallet balance if needed
      }
    }, [userId, dispatch, fetchWalletData]),
  );
  const loadMore = () => {
    if (!loading && hasMore && userId) {
      dispatch(
        fetchTransactions({userId, page: page + 1, pageSize}), // page increment
      );
    }
  };

  const dataWithCashbacks = transactions.flatMap(txn => {
    const isSuccess = txn.status === 'success' || txn.status === 'cashback';
    const isCashback = txn.status === 'cashback';

    const mainCard = {
      ...txn,
      isSuccess,
      isCashback,
      amountToShow: isCashback ? txn.amount : txn.baseAmount,
    };
    const cashbackCards = (txn.cashback || []).map((cb: any) => ({
      ...cb,
      isCashback: true,
      isSuccess: true,
      amountToShow: cb.cashbackAmount,
      createdAt: cb.createdAt || txn.createdAt,
      description: `Recharge Cashback (valid for 6 months)`,
    }));
    return [mainCard, ...cashbackCards];
  });

  const renderTransaction = ({item}: {item: any}) => {
    const formattedDateTime = formatDateTime(item.createdAt || new Date());
    const isExpiredCashback = item.isCashback && item.status === 'expired';

    return (
      <GradientView
        style={[
          styles.transactionCardContainer,
          {
            borderColor: isExpiredCashback
              ? '#FF4F4F'
              : item.isSuccess
                ? '#6944D3'
                : '#FF4F4F',
          },
        ]}
        variant={
          isExpiredCashback || !item.isSuccess ? 'highlight' : 'default'
        }>
        <View style={styles.transactionCard}>
          <View style={styles.amountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color: isExpiredCashback
                    ? '#FF4F4F'
                    : item.isSuccess
                      ? '#27C394'
                      : '#FF4F4F',
                },
              ]}>
              {item.isSuccess || isExpiredCashback ? '+' : '-'} ₹
              {parseFloat(item.amountToShow)}
            </Text>

            {/* ✅ Show tag only if not expired cashback */}
            {!isExpiredCashback && (
              <View style={styles.tagContainer}>
                <Text
                  style={
                    item.isSuccess ? styles.completedTag : styles.failedTag
                  }>
                  {item.isSuccess ? 'Completed' : 'Failed'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.transactionDescription}>
            {isExpiredCashback
              ? 'Cashback Expired'
              : item.isSuccess
                ? item.description ||
                  (item.isCashback
                    ? 'Recharge Cashback (valid for 6 months)'
                    : 'Added to wallet')
                : 'Payment failed'}
          </Text>

          <View style={styles.transactionDetails}>
            {!item.isCashback && (
              <Text style={[styles.transactionDetailText, {opacity: 0.6}]}>
                {item.orderId ? `Order ID: ${item.orderId}` : 'Order ID: N/A'}
              </Text>
            )}
            <Text style={[styles.transactionDetailText, {fontWeight: 'bold'}]}>
              {formattedDateTime}
            </Text>
            <View style={styles.typeTagContainer}>
              {/* ✅ Show type tag only if not cashback and payment is successful */}
              {!item.isCashback && item.isSuccess && (
                <View style={styles.typeTagContainer}>
                  <Text style={styles.typeTag}>
                    {getReadableMode(item.mode)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </GradientView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <Text
        style={[
          styles.balanceText,
          {paddingTop: 30, fontSize: 35, fontWeight: 'bold'},
        ]}>
        ₹{totalBalance.toFixed(2) || 0}
      </Text>
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceText, {opacity: 0.6}]}>
          Available Balance
        </Text>
        <TouchableOpacity
          style={styles.rechargeButton}
          onPress={handleRechargePress}>
          <Text style={styles.rechargeText}>Recharge Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />

      {/* Wallet Transaction History */}
      <Text style={{fontSize: 14, color: 'white', paddingBottom: 20}}>
        Wallet Transaction History
      </Text>

      <FlatList
        data={dataWithCashbacks}
        keyExtractor={item => item._id}
        renderItem={renderTransaction}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{paddingBottom: 100}}
        ListEmptyComponent={
          <Text style={{color: 'white', textAlign: 'center'}}>
            {loading ? 'Loading...' : 'No Wallet Transaction Found'}
          </Text>
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#27C394"
              style={{paddingVertical: 20}}
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 41, 1)',
    paddingHorizontal: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  balanceText: {fontSize: 16, color: 'white'},
  rechargeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#27C394',
    borderRadius: 8,
    alignItems: 'center',
  },
  rechargeText: {color: 'white', fontSize: 14, fontWeight: '600'},
  separator: {
    marginVertical: 20,
    borderBottomWidth: 0.4,
    borderBottomColor: 'white',
  },

  transactionCardContainer: {borderRadius: 8, marginBottom: 15, borderWidth: 1},
  transactionCard: {padding: 10, borderRadius: 8},
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {fontSize: 24, fontWeight: 'bold'},
  tagContainer: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4},
  completedTag: {
    color: 'white',
    fontSize: 10,
    backgroundColor: '#27C394',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  failedTag: {
    color: 'white',
    fontSize: 12,
    backgroundColor: '#FF4F4F',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 2,
  },

  transactionDescription: {fontSize: 14, color: 'white', marginVertical: 2},
  transactionDetails: {marginTop: 1},
  transactionDetailText: {fontSize: 11, color: 'white', marginVertical: 2},
  typeTagContainer: {marginTop: 5, alignSelf: 'flex-start'},
  typeTag: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default WalletHistoryOverview;
