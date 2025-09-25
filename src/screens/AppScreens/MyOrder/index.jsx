import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import NewTheme from '../../../common/NewTheme';
import {GlobalStyle} from '../../../core';
import {OrderIcon, RightIcon} from '../../../images';
import {useDispatch, useSelector} from 'react-redux';
import {getOrderData, setNoOrders} from '../../../store/apps/fetchUserProfile';
import LottieView from 'lottie-react-native';
import Spinner from '../../../common/Spinner';
import {AstroAxios} from '../../../plugin/Axios';

const MyOrder = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const orderData = useSelector(
    state => state?.fetchUserProfile?.orderData?.orders || [],
  );
  const userInfo = useSelector(state => state.userInfo);
  const [loading, setLoading] = useState(true);
  const [reportOrderData, setReportOrderData] = useState([]);
  const [combinedOrders, setCombinedOrders] = useState([]);
  const userId = useSelector(state => state?.userInfo?._id);
  const noOrders = useSelector(state => state?.fetchUserProfile?.noOrders);

  function handleBack() {
    navigation.goBack();
  }

  const GoToOrderNo = order => {
    navigation.navigate('Orderno', {order});
  };

  useEffect(() => {
    if (userInfo && !noOrders && orderData === undefined) {
      setLoading(true);
      dispatch(getOrderData(userInfo?.email)).finally(() => setLoading(false));
      dispatch(getOrderData(userInfo?.email))
        .then(response => {
          if (response?.payload === undefined) {
            dispatch(setNoOrders(true));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, userInfo]);

  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  };

  const handlePress = () => {
    Linking.openURL('https://www.imeuswe.in/dna/');
  };

  const getReportOrder = async () => {
    try {
      setLoading(true);
      const response = await AstroAxios.get(
        `/payment/get-orders?userId=${userId}`,
      );
      setReportOrderData(response.data?.orders);
      setLoading(false);
      const fetchedOrders = response.data?.orders || [];

      // Merge fetched orders with Redux orders
      setCombinedOrders([...fetchedOrders, ...(orderData || [])]);
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    getReportOrder();
    setReportOrderData([...reportOrderData, orderData]);
  }, []);

  const finalData = combinedOrders.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at);
    const dateB = new Date(b.createdAt || b.created_at);
    return dateB - dateA; // Descending order (latest first)
  });
  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        accessibilityLabel="My-Orders"
        onBack={handleBack}
        heading={'My Orders'}
        backgroundColor={NewTheme.colors.backgroundCreamy}
        fontSize={30}
      />
      <View
        style={{
          paddingTop: 24,
          paddingBottom: Platform.OS === 'ios' ? 110 : 0,
        }}>
        <GlobalStyle>
          {loading ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                alignSelf: 'center',
                marginTop: 30,
                backgroundColor: NewTheme.colors.backgroundCreamy,
              }}>
              <Spinner />
            </View>
          ) : finalData && finalData.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{height: '100%'}}>
              {finalData?.map((order, index) =>
                order?.order_number ? (
                  <TouchableOpacity
                    key={index}
                    onPress={() => GoToOrderNo(order)}>
                    <View style={styles.container}>
                      <View style={styles.container}>
                        <View style={styles.iconContainer}>
                          <OrderIcon />
                        </View>
                        <View style={{marginLeft: 12}}>
                          <Text style={styles.textheader}>
                            Order No #{order?.order_number}
                          </Text>
                          <Text style={styles.text}>
                            Placed on {formatDate(order?.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <RightIcon />
                      </View>
                    </View>
                    <Divider style={{marginVertical: 12}} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      navigation.navigate('ReportOrderDetails', {
                        order,
                        type: order?.typeOfReport,
                      })
                    }>
                    <View style={styles.container}>
                      <View style={[styles.container, {flex: 1}]}>
                        <View style={styles.iconContainer}>
                          <OrderIcon />
                        </View>
                        <View style={{marginLeft: 12, flex: 1}}>
                          <Text
                            style={[styles.textheader, {flexShrink: 1}]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {order?.typeOfReport} Report: {order?.name}
                          </Text>
                          <Text style={styles.text}>
                            Placed on {formatDate(order?.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <RightIcon />
                      </View>
                    </View>
                    <Divider style={{marginVertical: 12}} />
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          ) : (
            <ScrollView>
              <View style={styles.emptyStateContainer}>
                <LottieView
                  source={require('../../../animation/lottie/empty_state.json')}
                  loop={false}
                  autoPlay
                  speed={1}
                  style={styles.emptyAnimation}
                />
                <Text style={styles.emptyStateText}>
                  Looks like you haven't made any purchases yet
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handlePress}
                  activeOpacity={0.7}>
                  <Text style={styles.buttonText}>Start exploring!</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </GlobalStyle>
      </View>
    </ErrorBoundary.Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    color: NewTheme.colors.blackText,
    fontWeight: '600',
    fontSize: 14,
  },
  textheader: {
    color: NewTheme.colors.blackText,
    fontWeight: '600',
    fontSize: 20,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: NewTheme.colors.secondaryLightPeach,
    borderRadius: 5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 30,
    textAlign: 'center',
  },
  button: {
    borderColor: NewTheme.colors.primaryOrange,
    borderWidth: 1,
    backgroundColor: NewTheme.colors.whiteText,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: NewTheme.colors.primaryOrange,
    fontWeight: '700',
    fontSize: 16,
  },
  emptyAnimation: {
    width: 500,
    height: 400,
  },
});

export default MyOrder;
