import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import {BackArrowIcon} from '../../../images';
import axios from 'axios';
import {useWallet} from '../../../context/WalletContext';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
import Spinner from '../../../common/Spinner';
import {set} from 'lodash';
import {AppDispatch} from '../../../store';
import {
  fetchCashbackRules,
  fetchCashbackEligibility,
} from '../../../store/apps/wallet';
import TransactionFailur from '../../../assets/images/wallet/TranscationFailur';
import PayuMoney from '../PayUMoney';
import {Track} from '../../../../App';

const MoneyPreDefined = () => {
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const {
    showInsufficientBalance,
    astrologerName,
    requiredMinutes,
    requiredAmount,
  } = route.params || {};
  const navigation = useNavigation();
  const {top} = useSafeAreaInsets();
  const [selectAmount, setSelectAmount] = useState(0);
  const {totalBalance} = useWallet();
  console.log('totalBalance', totalBalance);
  const userId = useSelector(state => state?.userInfo?._id);
  const userData = useSelector((state: RootState) => state.userInfo);
  const {cashbackRules, needsRefresh, loading} = useSelector(
    (state: any) => state.walletSlice,
  );
  console.log('cashbac---kRules', cashbackRules);
  const [cashback, setCashback] = useState([]);

  const sortedCashbackRules = [...cashbackRules].sort(
    (a, b) => a.baseAmount - b.baseAmount,
  );

  useEffect(() => {
    if (!userId) return;

    if (cashbackRules.length === 0 || needsRefresh) {
      setIsLoading(true);

      dispatch(fetchCashbackRules())
        .unwrap()
        .then(rules => {
          return dispatch(fetchCashbackEligibility({userId, rules})).unwrap();
        })
        .then(result => {
          console.log('Eligible cashbacks:', result);
        })
        .catch(err => console.error('Error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [userId, dispatch, cashbackRules.length, needsRefresh]);

  const renderCard = ({item}) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectAmount === item.baseAmount && styles.selectedCard,
      ]}
      onPress={() => setSelectAmount(item.baseAmount)}>
      {/* Show cashback tag only if eligible */}
      {item.isCashbackEligible && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {Number(item.cashbackAmount) > 0
              ? `₹${Number(item.cashbackAmount)} Cashback`
              : `${Number(item.cashbackPercentage) || 0}% Cashback`}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.cardText,
          selectAmount === item.baseAmount && styles.selectedCardText,
        ]}>
        ₹ {item.baseAmount}
      </Text>
    </TouchableOpacity>
  );

  const handleRechargeNow = () => {
    if (selectAmount === 0) {
      setIsPopupVisible(true);
      return;
    }
    const props = {
      'Entered ammount': selectAmount,
    };
    Track({
      userData,
      cleverTapEvent: 'Selected_amount',
      mixpanelEvent: 'Selected_amount',
      cleverTapProps: props,
      mixpanelProps: props,
    });

    const selectedCashback = cashbackRules.find(
      item => item.baseAmount === selectAmount,
    );

    console.log('selectedCashback', selectedCashback);

    if (selectedCashback) {
      navigation.navigate('GstCallculation', {
        selectAmount,
        cashbackAmount: selectedCashback.isCashbackEligible
          ? selectedCashback.cashbackAmount
          : 0,
        cashbackPercentage: selectedCashback.isCashbackEligible
          ? selectedCashback.cashbackPercentage
          : '0%',
        cashbackType: selectedCashback.isCashbackEligible
          ? selectedCashback.cashbackType // ✅ pass cashbackType here
          : null,
      });
      console.log('Selected amount:', selectAmount);
      console.log('Cashback amount:', selectedCashback.cashbackAmount);
      console.log('Cashback percentage:', selectedCashback.cashbackPercentage);
      console.log('Is cashback eligible:', selectedCashback.isCashbackEligible);
    } else {
      setIsPopupVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: top}]}>
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 10}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon fill={'white'} />
          </TouchableOpacity>
          <Text style={styles.headerText}> Add Money to Wallet </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 20,
        }}>
        {showInsufficientBalance && (
          <>
            <Text
              style={[
                styles.balanceText,
                {paddingTop: 20, fontSize: 18, fontWeight: '600'},
              ]}>
              Insufficient Balance
            </Text>
            <Text
              style={[
                styles.balanceText,
                {
                  opacity: 0.8,
                  textAlign: 'center',
                  paddingTop: 10,
                  paddingHorizontal: 20,
                },
              ]}>
              To start conversation with {astrologerName ?? 'the astrologer'},
              you'll need a minimum balance of {requiredMinutes ?? 5} minutes (₹
              {requiredAmount ?? 50})
            </Text>
            <Text
              style={[
                {
                  opacity: 0.4,
                  textAlign: 'center',
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  fontSize: 12,
                  color: 'white',
                },
              ]}>
              Tip: 95% users recharge for 10 mins or more
            </Text>
          </>
        )}

        <Text
          style={[
            styles.balanceText,
            {fontSize: 35, fontWeight: 'bold', paddingTop: 20},
          ]}>
          ₹{totalBalance.toFixed(2)}
        </Text>
        <Text
          style={[
            styles.balanceText,
            {
              opacity: 0.6,
              alignItems: 'center',
              paddingTop: 15,
            },
          ]}>
          Available Balance
        </Text>
      </View>
      <FlatList
        data={sortedCashbackRules}
        renderItem={renderCard}
        // keyExtractor={item => item.baseAmount.toString()}
        keyExtractor={(item, index) => `${item.baseAmount}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.cardContainer}
      />

      <TouchableOpacity
        style={styles.rechargeButton}
        onPress={handleRechargeNow}>
        <Text style={styles.rechargeText}>Recharge Now</Text>
      </TouchableOpacity>

      {isPopupVisible && (
        <PayuMoney
          heading="Recharge Alert"
          icon={<TransactionFailur />}
          subtitle="Please select an amount to recharge"
          closeButtonText="Close"
          showModal={isPopupVisible}
          onClose={() => setIsPopupVisible(false)}
        />
      )}
      {loading && (
        <View style={styles.overlayLoader}>
          <Spinner size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
  header: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
  balanceText: {
    fontSize: 14,
    color: 'white',
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    paddingVertical: 10,
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 50,
    gap: 15,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '30%',
    marginBottom: 15,
    marginHorizontal: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCard: {
    backgroundColor: 'white',

    // borderColor: 'white',
  },

  selectedCardText: {
    color: '#6944D3',
  },
  tag: {
    position: 'absolute',
    top: -11,
    left: '7%',
    backgroundColor: 'rgba(39, 195, 148, 1)',
    paddingVertical: 4,
    width: '87%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderRadius: 5,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  rechargeButton: {
    flex: 1,
    position: 'absolute',
    bottom: 50,
    left: '30%',
    transform: [{translateX: -100}],
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 350,
  },
  rechargeText: {
    color: 'rgba(105, 68, 211, 1)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MoneyPreDefined;
