import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {Modal, Appbar, Portal, useTheme} from 'react-native-paper';
import {
  CommonActions,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {capitalize} from '../../../utils/format';
import GradientView from '../../../common/gradient-view';
import TransactionSuccessfulIcon from '../../../images/Icons/TransactionSuccessfulIcon';
import FaildIcon from '../../../images/Icons/FaildIcon';
import {useDispatch, useSelector} from 'react-redux';
import config from 'react-native-config';
import {AstroAxios} from '../../../plugin/Axios';
import {fetchUserLocation} from '../../../store/apps/userLocation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Track} from '../../../../App';
import {
  setRequestedInCurrentSession,
  setRequestPermissionState,
} from '../../../store/apps/pushnotification';
import Toast from 'react-native-toast-message';
import {usePushNotification} from '../../../context/PushNotificationContext';
import ConfettiCannon from 'react-native-confetti-cannon';
import ErrorBoundary from '../../../common/ErrorBoundary';
import AstroHeader from '../../../common/AstroHeader';
import {fetchUserProfile} from '../../../store/apps/fetchUserProfile';
import {parsePhoneNumber} from 'libphonenumber-js/mobile';
import axios from 'axios';
import Spinner from '../../../common/ButtonSpinner';
import {getAstroReports} from '../../../store/apps/astroKundali';
import {setSelected, setSelectedIndex} from '../../../store/apps/reportsSlide';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import analytics from '@react-native-firebase/analytics';

function calculateBasePriceAndGST(totalPrice, gstRate) {
  const basePrice = totalPrice / (1 + gstRate / 100);
  const gstAmount = totalPrice - basePrice;

  return {
    basePrice: basePrice.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
  };
}

function getGSTBreakdown(totalPrice, state, country) {
  let CGST = 0,
    SGST = 0,
    IGST = 0,
    gstRate = 0;

  if (country.toLowerCase() !== 'india') {
    IGST = 0; // No GST for international transactions
    gstRate = 0;
  } else if (state.toLowerCase() === 'maharashtra') {
    CGST = 9;
    SGST = 9;
    gstRate = CGST + SGST;
  } else {
    IGST = 18;
    gstRate = IGST;
  }

  const {basePrice, gstAmount} = calculateBasePriceAndGST(totalPrice, gstRate);

  return {
    basePrice,
    gstAmount,
    CGST: ((basePrice * CGST) / 100).toFixed(2),
    SGST: ((basePrice * SGST) / 100).toFixed(2),
    IGST: ((basePrice * IGST) / 100).toFixed(2),
  };
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

const ReportsPaymentScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const pushContext = usePushNotification();
  const navigation = useNavigation();
  const route = useRoute();
  const pageIsFocused = useIsFocused();

  const {kundli} = route.params;
  const {bottom} = useSafeAreaInsets();
  const userId = useSelector(state => state?.userInfo._id);
  const name = useSelector(state => state?.userInfo?.personalDetails?.name);
  const middlename = useSelector(
    state => state?.userInfo?.personalDetails?.middlename,
  );
  const lastname = useSelector(
    state => state?.userInfo?.personalDetails?.lastname,
  );
  const userName = [name, middlename, lastname].filter(Boolean).join(' ');
  const userEmail = useSelector(state => state?.userInfo?.email);

  const getUserDetails = async () => {
    await dispatch(fetchUserProfile(userId)).unwrap();
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  // const countryCode = useSelector(
  //   state => state?.fetchUserProfile?.data?.myProfile?.countryCode,
  // );

  const userMobile = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile?.mobileNo,
  );

  // const mobileNumber = userMobile ? `+${userMobile}` : '-----';

  const basicInfo = useSelector(
    state => state?.fetchUserProfile?.data?.myProfile,
  );

  const phoneInfo = basicInfo?.mobileNo
    ? parsePhoneNumber(
        `${basicInfo?.mobileNo}`.startsWith('+')
          ? basicInfo?.mobileNo
          : `+${basicInfo?.mobileNo}`,
        basicInfo?.countryISO || '',
      )
    : null;

  const mobileNumber = phoneInfo
    ? `+${phoneInfo?.countryCallingCode} ${phoneInfo?.nationalNumber}`
    : '-----';

  const typeOfReport = useSelector(
    state => state.astroKundaliSlice.selectedReport,
  );
  const reportId = useSelector(
    state => state.astroKundaliSlice.selectedReportId,
  );
  const price = useSelector(
    state => state.astroKundaliSlice.selectedReportPrice,
  );
  const storeDiscount = useSelector(
    state => state.astroKundaliSlice.selectedReportDiscount,
  );

  const userLocation = useSelector(state => state.userLocation.data);
  const userData = useSelector(state => state.userInfo);
  const toastMessages = useSelector(
    state => state.getToastMessages.toastMessages?.ai_astro_reports,
  );

  const [showConfetti, setShowConfetti] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [faildModalVisible, setFaildModalVisible] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState();
  const [reportPrice, setReportPrice] = useState(price);
  const [totalAmount, setTotalAmount] = useState(price);

  // Removed complex keyboard animation - using simple KeyboardAvoidingView instead

  // Removed Android keyboard adjustment - using KeyboardAvoidingView instead

  // Set All Amount total
  useEffect(() => {
    setReportPrice(price - storeDiscount);
    setTotalAmount(price - storeDiscount);
  }, []);

  const getLocation = async () => {
    try {
      const response = await dispatch(fetchUserLocation()).unwrap();
      setCountry(() => response.country_name);
      setState(() => response.region);
    } catch (error) {
      console.error('Failed to fetch location:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getLocation();

      Track({
        cleverTapEvent: 'Billing_Page_Visited',
        mixpanelEvent: 'Billing_Page_Visited',
        userData,
      });
    }, []),
  );
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const reports = await dispatch(getAstroReports()).unwrap();
          const selected = reports.filter(
            data => data?.typeOfReport === typeOfReport,
          )?.[0];

          if (
            selected &&
            selected?.activeOfferId?.[0]?.originalPrice?.inr !== price
          ) {
            Toast.show({
              type: 'error',
              text1:
                "We've updated our report prices with better offers. Please refresh the page to view the latest prices before placing your order.",
            });
          }
        } catch (_err) {
          /** empty */
        }
      })();
    }, []),
  );

  const goBack = () => {
    navigation.goBack();
  };

  const closeModel = () => {
    setModalVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: 'AstroBottomTabs',
            params: {
              screen: 'Reports',
            },
          },
          {
            name: 'AstroOrderHistory',
          },
        ],
      }),
    );
  };

  const closeModelFaild = () => {
    setFaildModalVisible(false);
    navigation.goBack();
  };

  const applyDiscount = async () => {
    try {
      setCouponError(''); // Clear previous error
      const {data} = await AstroAxios.post('/payment/apply-discount', {
        userId: userId,
        couponCode: couponCode,
        userName: userName,
        typeOfReport: typeOfReport,
      });

      const props = {
        'Coupon Code': couponCode,
        Valid: 'yes',
      };

      Track({
        cleverTapEvent: 'Coupon_Applied',
        mixpanelEvent: 'Coupon_Applied',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });

      if (data?.discountAmount) {
        const discountAmount =
          data.discountType === 'percentage'
            ? (totalAmount * data.discountAmount) / 100
            : data.discountAmount;

        // Check if discount is more than total
        console.log(discountAmount, 'discountAmount');
        if (discountAmount > totalAmount) {
          setCouponError('Invalid coupon');
          return;
        }

        const formattedDiscount = parseFloat(discountAmount.toFixed(2));
        const formattedTotal = parseFloat(
          (totalAmount - discountAmount).toFixed(2),
        );

        setShowConfetti(true);
        setDiscount(formattedDiscount);
        setTotalAmount(formattedTotal);

        Toast.show({
          type: 'success',
          text1: toastMessages?.['11007'],
        });
      } else {
        setCouponError('Invalid coupon');
      }
    } catch (error) {
      setCouponError('Invalid coupon');
      const props = {
        couponCode,
        valid: 'no',
      };
      Track({
        cleverTapEvent: 'Coupon_Applied',
        mixpanelEvent: 'Coupon_Applied',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });

      if (error.response?.data?.message === 'Coupon not found') {
        setCouponError('Invalid coupon');
      }
    }
  };

  async function checkPushPermission() {
    const enabled = await pushContext.checkNotificationPermission();
    if (!enabled) {
      dispatch(setRequestPermissionState(true));
      dispatch(setRequestedInCurrentSession(false));
    }
  }

  const removeDiscount = () => {
    try {
      setTotalAmount(totalAmount + discount);
      setDiscount();
      setCouponError('');
      setCouponCode('');
    } catch (error) {
      console.error('Remove Discount Error:', error);
    }
  };

  const [btnLoading, setBtnLoading] = useState(false);

  const handleFreeReport = async () => {
    setBtnLoading(true);
    try {
      const result = getGSTBreakdown(totalAmount, state, country);

      const props = {
        'Name Of Report': typeOfReport,
        'Price Of Report': reportPrice,
      };

      Track({
        cleverTapEvent: 'Free_Report_Claimed',
        mixpanelEvent: 'Free_Report_Claimed',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });

      // *** meta and firebase events
      if (config.ENV === 'prod') {
        const phoneNo = userData?.mobileNo ? '+' + userData?.mobileNo : '';
        await analytics().logEvent('Free_Report_Claimed');
        AppEventsLogger.logEvent('Free_Report_Claimed', {
          email: userData?.email || '',
          phone: phoneNo,
          first_name: userData?.personalDetails?.name || '',
          last_name: userData?.personalDetails?.lastname || '',
        });
      }

      const response = await AstroAxios.post('/payment/verify/free', {
        orderIdRazorpay: 'free',
        paymentIdRazorpay: 'free',
        userId: userId,
        reportId: reportId,
        kundliId: kundli._id,
        typeOfReport: typeOfReport,
        userName: userName,
        userEmail: userEmail || '-----',
        userMobileNo: mobileNumber || '-----',
        state: userLocation.region,
        country: userLocation.country_name,
        reportPrice: reportPrice,
        discountPrice: discount ? discount : 0,
        unitPrice: result.basePrice,
        grandTotal: totalAmount,
        couponCode: discount ? couponCode : '',
        paymentStatus: 'Success',
      });

      console.log(response, 'response free report');

      if (response.data) {
        await checkPushPermission();
        setModalVisible(true);
        Toast.show({
          type: 'success',
          text1: toastMessages?.['11017'],
        });
      }
      setBtnLoading(false);
      dispatch(setSelected(false));
      dispatch(setSelectedIndex(-1));
    } catch (error) {
      console.error('Free Report Error:', error);
      Toast.show({
        type: 'error',
        text1: toastMessages?.['11013'],
      });
      setFaildModalVisible(true);
      setBtnLoading(false);
    }
  };

  const handlePayment = async () => {
    if (totalAmount === 0) {
      await handleFreeReport();
      return;
    }

    try {
      // Start Tracking Payment Attempt
      const props = {
        'Name Of Report': typeOfReport,
        'Price Of Report': reportPrice,
      };

      Track({
        cleverTapEvent: 'Payment_Attempted',
        mixpanelEvent: 'Payment_Attempted',
        userData,
        cleverTapProps: props,
        mixpanelProps: props,
      });

      // End Tracking Payment Attempt
      const {data} = await AstroAxios.post('/payment/create-order', {
        amount: totalAmount,
      });

      if (!data?.order?.id) {
        throw new Error('Invalid response: order_id is missing');
      }

      const result = getGSTBreakdown(totalAmount, state, country);

      const options = {
        description: 'Payment for order',
        image:
          'https://testing-email-template.s3.ap-south-1.amazonaws.com/markating_images/imeusweLogoNew.png',
        currency: 'INR',
        key: config.RAZORPAY_KEY,
        amount: data?.order?.amount,
        name: 'iMeUsWe',
        order_id: data?.order?.id,
        description: 'Description Text',
        notes: {
          userId: userId,
          reportId: reportId,
          kundliId: kundli._id,
          typeOfReport: typeOfReport,
          userName: userName,
          paymentStatus: 'Success',
          userEmail: userEmail || '-----',
          userMobileNo: mobileNumber || '-----',
          state: userLocation.region,
          country: userLocation.country_name,
          reportPrice: reportPrice,
          discountPrice: discount ? discount : 0,
          unitPrice: result.basePrice,
          grandTotal: totalAmount,
          couponCode: discount ? couponCode : '',
        },
        prefill: {
          email: userEmail || 'test@gmail.com',
          contact: userMobile || '1234567890',
          name: userName,
        },
        theme: {color: '#F37254'},
      };

      const paymentResponse = await RazorpayCheckout.open(options);

      dispatch(setSelected(false));
      dispatch(setSelectedIndex(-1));
      if (paymentResponse.razorpay_payment_id) {
        // Start Tracking
        const eventProps = {
          'Name Of Report': typeOfReport,
          'Price Of Report': reportPrice,
          'Price Paid': totalAmount,
        };
        // End Tracking Payment
        Track({
          cleverTapEvent: 'Payment_Successful',
          mixpanelEvent: 'Payment_Successful',
          userData,
          cleverTapProps: eventProps,
          mixpanelProps: eventProps,
        });

        // *** meta and firebase events
        if (config.ENV === 'prod') {
          const phoneNo = userData?.mobileNo ? '+' + userData?.mobileNo : '';
          await analytics().logEvent('Report_Purchased');
          AppEventsLogger.logEvent('Report_Purchased', {
            email: userData?.email || '',
            phone: phoneNo,
            first_name: userData?.personalDetails?.name || '',
            last_name: userData?.personalDetails?.lastname || '',
          });
        }
        await checkPushPermission();
        setModalVisible(true);
        Toast.show({
          type: 'success',
          text1: toastMessages?.['11009'],
        });
      }
    } catch (error) {
      const result = getGSTBreakdown(totalAmount, state, country);

      // Start Tracking
      const eventProps2 = {
        'Name Of Report': typeOfReport,
        'Price Of Report': reportPrice,
        'Price Paid': totalAmount,
      };
      // End Tracking Payment
      Track({
        cleverTapEvent: 'Payment_Failed',
        mixpanelEvent: 'Payment_Failed',
        userData,
        cleverTapProps: eventProps2,
        mixpanelProps: eventProps2,
      });
      console.log('Payment Error:', error);

      Toast.show({
        type: 'error',
        text1: toastMessages?.['11008'],
      });

      setFaildModalVisible(true);

      // Generate a timestamp-based payment ID for failed payments
      // Generate IST timestamp for failed payment IDs
      const now = new Date();
      const offsetIST = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + offsetIST);
      const timestamp = istDate
        .toISOString()
        .replace(/[-:T.]/g, '')
        .slice(0, 14); // Format: YYYYMMDDHHMMSS
      const orderIdRazorpay = `order_FAILED_${timestamp}`; // e.g., order_FAILED_20250730094400
      const paymentIdRazorpay = `pay_FAILED_${timestamp}`; // e.g., pay_FAILED_20250730094400

      const failedPaymentResponse = await AstroAxios.post('/payment/failed', {
        orderIdRazorpay: orderIdRazorpay,
        paymentIdRazorpay: paymentIdRazorpay,
        userId: userId,
        reportId: reportId,
        kundliId: kundli._id,
        typeOfReport: typeOfReport,
        reportName: typeOfReport,
        userName: userName,
        paymentStatus: 'Failed',
        userEmail: userEmail,
        userMobileNo: userMobile || '1234567890',
        state: userLocation.region,
        country: userLocation.country_name,
        reportPrice: reportPrice,
        discountPrice: discount ? discount : 0,
        unitPrice: result.basePrice,
        total: reportPrice,
        subTotal: reportPrice,
        grandTotal: totalAmount,
        CGST: result.CGST,
        SGST: result.SGST,
        IGST: result.IGST,
        couponCode: couponCode,
      });
      // Start Tracking Payment Attempt
      const eventProps = {
        'Name Of Report': typeOfReport,
        'Price Of Report': reportPrice,
      };
      // End Tracking Payment Attempt
      Track({
        cleverTapEvent: 'Payment_Failed',
        mixpanelEvent: 'Payment_Failed',
        userData,
        cleverTapProps: eventProps,
        mixpanelProps: eventProps,
      });

      console.log(failedPaymentResponse, ' failedPaymentResponse');
    }
  };

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef(null);

  // Simple keyboard visibility tracking without complex listeners
  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  return (
    <ErrorBoundary.Screen>
      <View style={{flex: 1, backgroundColor: theme.colors.background}}>
        <AstroHeader>
          <AstroHeader.BackAction onPress={goBack} />
          <AstroHeader.Content title="Payment" />
        </AstroHeader>
        {kundli && (
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={{flex: 1}}>
            <ScrollView
              ref={scrollViewRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.container, {paddingBottom: keyboardVisible ? 10 : 20}]}
              keyboardDismissMode="interactive"
              style={{flex: 1}}>
              <View style={styles.detailsContainer}>
                <Text style={styles.title}>Name: {kundli.name}</Text>
                <Text style={styles.subText}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    Gender:{' '}
                  </Text>
                  {capitalize(kundli.gender)}
                </Text>
                <Text style={styles.subText}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    Date of birth:{' '}
                  </Text>
                  {formatDate(kundli.birthDetails.birthDateTime)}
                </Text>
                <Text style={styles.subText}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    Time of birth:{' '}
                  </Text>
                  {formatTime(kundli.birthDetails.birthDateTime)}
                </Text>
                <Text style={styles.subText}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.75)',
                    }}>
                    Place of birth:{' '}
                  </Text>
                  {kundli.birthDetails.birthPlace?.placeName}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.sectionTitle}>Price Details</Text>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <Text style={styles.label}>Price</Text>
                  <Text style={styles.value}>₹{price}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Discount</Text>
                  <Text style={styles.value}>-₹{storeDiscount}</Text>
                </View>
                {discount && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Coupon Applied</Text>
                    <Text style={styles.value}>-₹{discount}</Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.row}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>
              </View>
              <View style={styles.couponContainer}>
                <TextInput
                  style={[
                    styles.input,
                    couponError ? styles.inputError : {},
                    discount ? styles.inputDisabled : {}, // Apply disabled style when editable is false
                  ]}
                  placeholder="Coupon Code"
                  placeholderTextColor="white"
                  value={couponCode}
                  onChangeText={text => {
                    const upperCaseText = text.toUpperCase();
                    setCouponCode(upperCaseText);
                    setCouponError('');
                  }}
                  autoCapitalize="characters"
                  numberOfLines={1}
                  editable={discount ? false : true}
                  onFocus={() => {
                    // Simple scroll to end - let KeyboardAvoidingView handle the rest
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({animated: true});
                    }, 100);
                  }}
                />
                {discount ? (
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={removeDiscount}>
                    <Text style={styles.applyText}>Remove</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyDiscount}
                    disabled={discount}>
                    <Text style={styles.applyText}>Apply</Text>
                  </TouchableOpacity>
                )}
              </View>

              {couponError ? (
                <Text style={{color: 'red', fontSize: 12}}>{couponError}</Text>
              ) : null}
              {!couponError && discount > 0 && (
                <Text style={{color: 'white', fontSize: 12}}>
                  Coupon applied,
                  <Text style={{color: '#27C394'}}> you saved ₹{discount}</Text>
                </Text>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        <Portal>
          <ConfettiCannon
            key={showConfetti}
            count={200}
            origin={{x: -100, y: -20}}
            onAnimationEnd={() =>
              setTimeout(() => setShowConfetti(false), 50)
            }
            fadeOut
            autoStart={showConfetti}
          />
        </Portal>

        {/* Pay Now button outside KeyboardAvoidingView for stable positioning */}
        {!keyboardVisible && (
          <TouchableOpacity
            style={[
              styles.payButton,
              {bottom: bottom ? bottom : 10, position: 'absolute'},
            ]}
            onPress={handlePayment}>
            {btnLoading ? (
              <Spinner />
            ) : (
              <Text style={styles.payText}>Pay Now</Text>
            )}
          </TouchableOpacity>
        )}

        <Modal
          transparent={true}
          visible={faildModalVisible}
          onDismiss={() => setFaildModalVisible(false)}
          style={{
            paddingHorizontal: 0,
          }}
          contentContainerStyle={{
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View>
            <GradientView style={styles.modalContainer}>
              <View
                style={{
                  padding: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <FaildIcon />
                <Text style={styles.modalText}>Transaction failed</Text>
                <Text style={styles.modalSubText}>
                  Something went wrong, try again later.
                </Text>
                <TouchableOpacity
                  onPress={closeModelFaild}
                  style={styles.closeButton}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </GradientView>
          </View>
        </Modal>
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          style={{
            paddingHorizontal: 0,
          }}
          contentContainerStyle={{
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View>
            <GradientView style={styles.modalContainer}>
              <View
                style={{
                  padding: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TransactionSuccessfulIcon />
                <Text style={styles.modalText}>Transaction successful</Text>
                <Text style={styles.modalSubText}>
                  {name}, your report will be reviewed by an astrologer. It will
                  take approximately 24 hours for it to be ready.
                </Text>
                <Text style={styles.modalSubText}>
                  We will notify you once it's ready.
                </Text>
                <TouchableOpacity
                  onPress={closeModel}
                  style={styles.closeButton}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </GradientView>
          </View>
        </Modal>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 20, // Reduced padding
    backgroundColor: '#14102b',
  },
  detailsContainer: {
    backgroundColor: '#29273f',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#545266',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  subText: {
    fontSize: 14,
    color: 'white',
    marginVertical: 5,
  },
  priceContainer: {
    backgroundColor: '#292740',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#545266',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#545266',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: 'white',
  },
  inputDisabled: {
    backgroundColor: '#4A4A5E', // Muted gray for disabled background
    borderColor: '#6B6B7A', // Lighter gray for disabled border
    opacity: 0.6, // Slightly transparent to indicate disabled state
  },

  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  couponContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 2,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#545266',
    backgroundColor: '#292740',
    padding: 10,
    borderRadius: 5,
    color: 'white',
  },
  applyButton: {
    backgroundColor: '#6944D3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  payButton: {
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 20,
  },
  payText: {
    color: '#6944D3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 8,
    marginTop: 8,
    color: 'white',
    textAlign: 'center',
  },
  modalSubText: {
    fontSize: 12,
    marginBottom: 30,
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
});

export default ReportsPaymentScreen;
