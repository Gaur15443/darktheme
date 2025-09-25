import {useNavigation, useRoute} from '@react-navigation/native'; // Add useRoute
import React, {useState, useEffect} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import {TabView, TabBar, TabBarProps} from 'react-native-tab-view';
import {BackArrowIcon} from '../../../images';
import WalletHistoryOverview from '../WalletHistoryOverview';
import CallHistory from '../CallHistory';
import ChatHistory from '../ChatHistory';
import PayuMoney from '../PayUMoney/index';
import TransactionFailur from '../../../assets/images/wallet/TranscationFailur';
import TransactionSuccess from '../../../assets/images/wallet/TransactionSuccess';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../MoneyPreDefined'; // Adjust path as needed
import {AstroWrapper} from '../../../navigation/AppStack';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import analytics from '@react-native-firebase/analytics';
import config from 'react-native-config';
import {useDispatch, useSelector} from 'react-redux';
import {markCashbackForRefresh} from '../../../store/apps/wallet';

interface TabBarRoutes {
  key: string;
  title: string;
}

const WalletHistory: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute<RouteProp<RootStackParamList, 'WalletHistory'>>(); // Add useRoute
  const {top}: EdgeInsets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState<number>(route?.params?.index || 0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const userData = useSelector(state => state.userInfo);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const {transactionStatus} = route.params || {};
      if (transactionStatus === 'success') {
        setShowSuccessPopup(true);
      } else if (transactionStatus === 'failed') {
        setShowFailurePopup(true);
      }
    });
    return unsubscribe;
  }, [navigation, route.params]);

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    dispatch(markCashbackForRefresh());
    // *** meta and firebase events
    if (config.ENV === 'prod') {
      const phoneNo = userData?.mobileNo ? '+' + userData?.mobileNo : '';
      analytics().logEvent('Wallet_Recharged');
      AppEventsLogger.logEvent('Wallet_Recharged', {
        email: userData?.email || '',
        phone: phoneNo,
        first_name: userData?.personalDetails?.name || '',
        last_name: userData?.personalDetails?.lastname || '',
      });
    }
    navigation.setParams({transactionStatus: undefined}); // Prevent re-showing
  };

  const closeFailurePopup = () => {
    setShowFailurePopup(false);
    navigation.setParams({transactionStatus: undefined}); // Prevent re-showing
  };

  const renderScene = ({route}: {route: TabBarRoutes}) => {
    switch (route.key) {
      case 'first':
        return <WalletHistoryOverview />;
      case 'second':
        return <ChatHistory />;
      case 'third':
        return <CallHistory />;
      default:
        return null;
    }
  };

  const routes: TabBarRoutes[] = [
    {key: 'first', title: 'Wallet'},
    {key: 'second', title: 'Chat History'},
    {key: 'third', title: 'Call History'},
  ];

  function renderTabBar(props: TabBarProps<any>) {
    return (
      <TabBar
        {...props}
        renderLabel={({route, focused}) => (
          <Text
            style={{
              color: focused ? 'white' : 'rgba(255, 255, 255, 0.7)',
            }}>
            {route.title}
          </Text>
        )}
        indicatorStyle={styles.indicatorStyle}
        style={{backgroundColor: 'transparent'}}
      />
    );
  }

  return (
    <AstroWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, {paddingTop: top}]}>
          <View style={{alignItems: 'center', flexDirection: 'row', gap: 10}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <BackArrowIcon fill={'white'} />
            </TouchableOpacity>
            <Text style={styles.headerText}>History</Text>
          </View>
        </View>

        {/* Tab View */}
        <View style={styles.tabViewContainer}>
          <TabView
            renderTabBar={renderTabBar}
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={idx => setIndex(idx)}
            initialLayout={{width: layout.width}}
          />
        </View>
        {showSuccessPopup && (
          <PayuMoney
            heading="Transaction successful"
            icon={<TransactionSuccess />}
            subtitle={`Your payment has been successfully done.`}
            closeButtonText="Close"
            showModal={showSuccessPopup}
            backgroundColor={'rgba(42, 32, 83, 0.9)'}
            onClose={closeSuccessPopup}
          />
        )}
        {showFailurePopup && (
          <PayuMoney
            heading="Transaction failed"
            icon={<TransactionFailur />}
            subtitle="Something went wrong, try again later"
            closeButtonText="Close"
            showModal={showFailurePopup}
            // backgroundColor={'rgba(42, 32, 83, 0.9)'}
            onClose={closeFailurePopup}
          />
        )}
      </View>
    </AstroWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 41, 1)',
  },
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
  tabViewContainer: {
    flex: 1,
    padding: 10,
  },
  indicatorStyle: {
    height: 45,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    borderBottomWidth: 2,
    borderColor: 'white',
  },
});

export default WalletHistory;
