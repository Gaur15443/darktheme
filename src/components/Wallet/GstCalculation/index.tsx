// ... (imports remain unchanged)
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  PermissionsAndroid,
  NativeEventEmitter,
  Alert,
} from 'react-native';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import {BackArrowIcon} from '../../../images';
import {RootStackParamList} from '../MoneyPreDefined';
import {RouteProp} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import PayUBizSdk from 'payu-non-seam-less-react';
import {sha512} from 'js-sha512';
import PayuMoney from '../PayUMoney/index';
import {fetchGstDetails, saveTransaction} from '../../../store/apps/wallet';
import TransactionFailur from '../../../assets/images/wallet/TranscationFailur';
import TransactionSuccess from '../../../assets/images/wallet/TransactionSuccess';
import {unwrapResult} from '@reduxjs/toolkit';

import {Track} from '../../../../App';
import Config from 'react-native-config';
import {setShouldMask} from '../../../store/apps/sentry';
const GstCallculation: React.FC = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isSuccessPopupVisible, setSuccessPopupVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // NEW
  const dispatch = useDispatch<AppDispatch>();

  const openPopup = () => setPopupVisible(true);
  const closePopup = () => setPopupVisible(false);
  const closeSuccessPopup = () => setSuccessPopupVisible(false);
  const userData = useSelector((state: RootState) => state.userInfo);

  const navigation = useNavigation();
  const {top}: EdgeInsets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, 'GstCallculation'>>();
  const {selectAmount, cashbackAmount, cashbackPercentage, cashbackType} =
    route.params || {};
  const {gstLoading, gstData, gstError} = useSelector(
    (state: RootState) => state.walletSlice,
  );
  const userId = useSelector(state => state?.userInfo?._id);
  const userInfoData = useSelector(state => state?.userInfo);
  const layout = useWindowDimensions();

  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [key, setKey] = useState(Config.PAYU_KEY);
  const [amount, setAmount] = useState(totalAmount.toString());
  const [productInfo, setProductInfo] = useState('Astrology consultation');
  const [firstName, setFirstName] = useState(
    userInfoData?.personalDetails?.name || '',
  );
  const [email, setEmail] = useState(userInfoData?.email || 'admin@imeuswe.in');
  const [phone, setPhone] = useState(
    getLast10Digits(String(userInfoData?.mobileNo || '')),
  );
  const [payuEnvironment] = useState(Config.PAYU_ENVIRONMENT);
  const [userCredential] = useState(Config.PAYU_USER_CREDENTIAL);
  const numericBase = Number(selectAmount || 0);
  const numericAmount = Number(cashbackAmount || 0);
  const numericPercentage = Number(
    String(cashbackPercentage || '').replace('%', ''),
  );
  const [lastName, setLastName] = useState(
    userInfoData?.personalDetails?.lastname || '',
  );
  const [mobilewithCountryCode, setMobilewithCountryCode] = useState(
    userInfoData?.mobileNo.toString() || '',
  );

  const amountSelected = Number(selectAmount);
  let finalCashbackAmount = 0;
  let finalCashbackPercentage = 0;

  // Case 1: If cashbackPercentage is provided, calculate cashbackAmount
  if (cashbackPercentage > 0) {
    finalCashbackPercentage = cashbackPercentage;
    finalCashbackAmount = (amountSelected * cashbackPercentage) / 100;
    finalCashbackAmount = Math.round(finalCashbackAmount * 10) / 10; // 1 decimal
  }
  // Case 2: If cashbackAmount is provided, calculate cashbackPercentage
  else if (cashbackAmount > 0) {
    finalCashbackAmount = cashbackAmount;
    finalCashbackPercentage = (cashbackAmount / amountSelected) * 100;
    finalCashbackPercentage = Math.round(finalCashbackPercentage * 10) / 10; // 1 decimal
  }

  const [ios_surl] = useState(Config.PAYU_IOS_SURL);
  const [ios_furl] = useState(Config.PAYU_IOS_FURL);
  const [android_surl] = useState(Config.PAYU_ANDROID_SURL);
  const [android_furl] = useState(Config.PAYU_ANDROID_FURL);
  const [merchantSalt] = useState(Config.PAYU_MERCHANT_SALT);

  function getLast10Digits(mobile: String) {
    if (!mobile) return '';
    const digits = mobile.replace(/\D/g, '');
    return digits.slice(-10);
  }

  useEffect(() => {
    if (selectAmount && userId) {
      dispatch(fetchGstDetails({selectAmount, userId}));
    }
  }, [selectAmount, userId]);

  useEffect(() => {
    setAmount(totalAmount.toString());
  }, [totalAmount]);

  const onPaymentSuccess = e => {
    setIsProcessingPayment(false);
    navigation.navigate('WalletHistory', {transactionStatus: 'success'});
  };

  const onPaymentFailure = e => {
    setIsProcessingPayment(false);
    setPopupVisible(true);
  };

  const onPaymentCancel = async e => {
    setIsProcessingPayment(false);
    const reason = e.ixTxnInitiated
      ? 'Transaction was cancelled during processing'
      : 'Payment Failed';
    const now = new Date();
    try {
      await dispatch(
        saveTransaction({
          userId,
          amount: Number(selectAmount),
          baseAmount: Number(selectAmount),
          status: 'failed',
          reason,
          createdAt: now.toISOString(),
          type: 'recharge',
          productinfo: productInfo,
          firstname: firstName,
          email,
          phone,
          lastName,
          mobileNumber: mobilewithCountryCode,
        }),
      );
      navigation.navigate('WalletHistory', {
        transactionStatus: 'failed',
        transactionAmount: selectAmount,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to log the transaction.');
    }
  };

  const onError = e => {
    setIsProcessingPayment(false);
    setPopupVisible(true);
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(PayUBizSdk);
    const payUOnPaymentSuccess = eventEmitter.addListener(
      'onPaymentSuccess',
      onPaymentSuccess,
    );
    const payUOnPaymentFailure = eventEmitter.addListener(
      'onPaymentFailure',
      onPaymentFailure,
    );
    const payUOnPaymentCancel = eventEmitter.addListener(
      'onPaymentCancel',
      onPaymentCancel,
    );
    const payUOnError = eventEmitter.addListener('onError', onError);
    const payUGenerateHash = eventEmitter.addListener(
      'generateHash',
      generateHash,
    );
    return () => {
      payUOnPaymentSuccess.remove();
      payUOnPaymentFailure.remove();
      payUOnPaymentCancel.remove();
      payUOnError.remove();
      payUGenerateHash.remove();
    };
  }, [merchantSalt]);

  useEffect(() => {
    if (isProcessingPayment) {
      dispatch(setShouldMask(true));
    } else {
      dispatch(setShouldMask(false));
    }
  }, [isProcessingPayment]);

  const generateHash = e => {
    sendBackHash(e.hashName, e.hashString + merchantSalt);
  };

  const sendBackHash = (hashName, hashData) => {
    const hashValue = sha512(hashData);
    PayUBizSdk.hashGenerated({[hashName]: hashValue});
  };

  const launchPayU = () => {
    if (isProcessingPayment) return;

    if (!gstData?.totalAmount || gstData.totalAmount <= 0) {
      Alert.alert(
        'Error',
        'Unable to calculate total amount. Please try again.',
      );
      return;
    }

    if (!firstName || !email || !phone || phone.length !== 10) {
      Alert.alert('Error', 'Missing or invalid user details.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      PayUBizSdk.openCheckoutScreen({
        payUPaymentParams: {
          key,
          transactionId: Date.now().toString(),
          amount: gstData.totalAmount.toString(),
          productInfo,
          firstName,
          email,
          phone,
          ios_surl,
          ios_furl,
          android_surl,
          android_furl,
          environment: payuEnvironment,
          userCredential: userCredential,
          additionalParam: {
            udf1: userId,
            udf2: lastName,
            udf3: mobilewithCountryCode,
            udf4: 'udf4',
            udf5: 'udf5',
            walletUrn: '100000',
          },
        },
        payUCheckoutProConfig: {
          primaryColor: '#2a2053',
          secondaryColor: '#ffffff',
          merchantName: 'iMeUsWe',
          merchantLogo:
            'https://uat-dms.payu.in/merchants/11ef-9db8-f773f570-bc24-021ec077a271/documents/b453da7e2e394aa5b5891979bc9b9fa3',
          showExitConfirmationOnCheckoutScreen: true,
          showExitConfirmationOnPaymentScreen: true,
          cartDetails: [{Order: 'Value'}, {'Key Name': 'Value1'}],
          paymentModesOrder: [
            {UPI: 'TEZ'},
            {Wallets: 'PAYTM'},
            {EMI: ''},
            {Wallets: 'PHONEPE'},
          ],
          surePayCount: 1,
          merchantResponseTimeout: 10000,
          autoSelectOtp: true,
          autoApprove: false,
          merchantSMSPermission: false,
          showCbToolbar: true,
        },
      });
    } catch (error) {
      console.error('PayU launch error:', error);
      Alert.alert('Error', 'Something went wrong while launching payment.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: top}]}>
        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackArrowIcon fill={'white'} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Price Details</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={{color: 'white', fontSize: 16}}>Price Details</Text>
        <View style={styles.separator} />
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, {paddingBottom: 8}]}>
            Recharge Amount
          </Text>
          <Text style={styles.amountText}>₹{selectAmount}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>GST(18%)</Text>
          <Text style={styles.amountText}>₹{gstData?.gstAmount || 0}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.amountContainer}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            Grand Total
          </Text>
          <Text style={{fontWeight: 'bold', color: 'white'}}>
            ₹{gstData?.totalAmount || 0}
          </Text>
        </View>
      </View>

      {(finalCashbackPercentage > 0 || finalCashbackAmount > 0) && (
        <View style={{marginTop: -12}}>
          <View style={[styles.content, {gap: 4}]}>
            {finalCashbackPercentage > 0 && (
              <Text style={{fontSize: 13, color: 'rgba(39, 195, 148, 1)'}}>
                {`${finalCashbackPercentage}% extra on recharge of ₹${amountSelected}`}
              </Text>
            )}
            {finalCashbackAmount > 0 && (
              <Text style={{color: 'white', fontSize: 12, opacity: 0.6}}>
                {`₹${finalCashbackAmount} cashback in iMeUsWe wallet with this recharge`}
              </Text>
            )}
          </View>
          {isPopupVisible && (
            <PayuMoney
              heading="Transaction Failed"
              icon={<TransactionFailur />}
              subtitle="Something went wrong, try again later"
              closeButtonText="Close"
              showModal={isPopupVisible}
              backgroundColor="rgba(42, 32, 83, 0.9)"
              onClose={closePopup}
            />
          )}
        </View>
      )}

      {isSuccessPopupVisible && (
        <PayuMoney
          heading="Transaction Successful"
          icon={<TransactionSuccess />}
          subtitle="Your payment has been successfully done."
          closeButtonText="Close"
          showModal={isSuccessPopupVisible}
          backgroundColor="rgba(42, 32, 83, 0.9)"
          onClose={closeSuccessPopup}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={launchPayU}
          disabled={isProcessingPayment}
          style={[
            styles.rechargeButton,
            isProcessingPayment && {opacity: 0.6},
          ]}>
          <Text style={styles.buttonText}>
            {isProcessingPayment ? 'Processing...' : 'Recharge Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'rgba(18, 16, 41, 1)'},
  header: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    paddingVertical: 10,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 40,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  separator: {
    borderBottomWidth: 0.7,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'stretch',
    marginVertical: 6,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',

    // paddingBottom: 8,
  },
  amountText: {color: 'white', fontSize: 16, opacity: 0.7},
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  rechargeButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: '30%',
    borderRadius: 8,
  },
  buttonText: {color: 'rgba(105, 68, 211, 1)', fontSize: 16, fontWeight: '600'},
});

export default GstCallculation;
