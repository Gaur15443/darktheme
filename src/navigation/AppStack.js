import React, {useEffect, useState} from 'react';
import {View, Text, Platform, Linking} from 'react-native';
import {Theme} from '../common';
import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import Members from './../screens/AppScreens/Members/index';
import NewsDetailScreen from '../components/News/News-Data/index';
import ViewReports from '../screens/AstrologyScreens/ViewReports';
import EmailReVerify from '../components/ProfileTab/EmailVerify';
import EmailOTPReverify from '../components/ProfileTab/EmailOtpVerify';
import MobileVerification from '../components/ProfileTab/MobileVerify';
import MobileOTPverification from '../components/ProfileTab/MobileOtpVerify';

import {
  Home,
  TreeScreen,
  AddMemberForm,
  CreateStory,
  AddTagging,
  StoryQuotes,
  AIStoryCategories,
  ViewStory,
  ManageGroups,
  EditGroup,
  FeedbackSurvey,
  AccountSettings,
  Faq,
  AboutUs,
  News,
  Feedback,
  AIStoryForm,
  LinkMember,
  ViewMemberDetails,
  ViewMemberDetailsHeader,
  ProfileDetailsScreen,
  ProfileSettings,
  Privacy,
  Tree,
  ImeusweSearch,
  ImuwTailorSearch,
  ImeusweUser,
  ImuwSearchResults,
  ImuwPublicSearch,
  ImuwSingularSearch,
  AccountDna,
  CommunitiesScreen,
} from '../screens';
import {
  BottomTabs,
  AddChapter,
  ViewAutoChapter,
  ViewChapter,
  EditMemory,
  EditChapter,
  ViewMemory,
  AddMemory,
  DeleteAccount,
  ConnectionInfo,
  CommunityInfo,
  MedicalInfo,
  WorkInfo,
  EducationInfo,
  BasicFact,
  MarriageInfo,
  CreateCommunity,
  EditCommunity,
  InviteIntialCommunityMembers,
  InviteScreen,
  CommunityDetails,
  CommunityJoiningRequests,
  ViewSingleDiscussion,
  InviteSearchScreen,
  ManageCommunityMembers,
  StoriesForm,
  CommunitySearchScreen,
  InviteToCommunity,
  ViewSinglePoll,
  ViewNotes,
  AddNote,
} from '../components';
import SubcategoryScreen from '../components/Admin_Faq/SubcategoryScreen';
import Categories from '../screens/AppScreens/Faq/index';
import InviteSheetModal from '../components/invites';
import {WhatsOn} from '../screens';
import BottomSheetModal from '../components/familyStats-popup';
import CommunityList from '../components/ProfileTab/CommunityHistoryList/CommunityList';
import ReligionList from '../components/ProfileTab/CommunityHistoryList/ReligionList';
import GothraList from '../components/ProfileTab/CommunityHistoryList/GothraList';
import ScriptList from '../components/ProfileTab/CommunityHistoryList/ScriptList';
import MyOrder from '../screens/AppScreens/MyOrder';
import Orderno from '../screens/AppScreens/Orderno';
import CreateCommunityPosts from '../components/Communities/MainScreens/CreateCommunityPost';
import CommunitySelector from '../components/Communities/MainScreens/CreateCommunityPost/CommunitySelector';
import AstroBottomTabs from '../components/BottomTabs/astrologyTabs';
import AstroBirthDetailsTabs from '../components/AstroConsultation/AstroBirthDetailsTabs/AstroBirthDetailsTabs';
import AstroBirthDetailsTabsReports from '../components/AstroConsultation/AstroBirthDetailsTabs/AstroBirthDetailsTabsReports';
import CallAnswer from '../screens/AppScreens/CallAnswer';
import {
  PaperProvider,
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
  configureFonts,
} from 'react-native-paper';
import Transactions from '../screens/AstrologyScreens/Transactions';
import {astroTheme, fontConfig} from '../../App';
import AstroNotifications from '../screens/AstrologyScreens/AstroNotifications';
import AstroBirthDetailsScreen from '../screens/AstrologyScreens/AstroBirthDetailsScreen';
import WalletHistory from '../components/Wallet/WalletHistory/WalletHistory';
import MoneyPreDefined from '../components/Wallet/MoneyPreDefined';
import GstCallculation from '../components/Wallet/GstCalculation';
import AstrologyLoginWithMobile from '../screens/AstrologyScreens/Home/AstrologyLoginWithMobile';
import AstrologyVerifyMobileOTP from '../screens/AstrologyScreens/Home/AstrologyVerifyMobileOTP';
import Wallet from '../components/Wallet';
import ChatScreen from '../components/AstroConsultation/AstroAgoraChat';
import WalletHistoryOverview from '../components/Wallet/WalletHistoryOverview';
import ConsultationSearch from '../screens/AstrologyScreens/ConsultationSearch';
import PayuMoney from '../components/Wallet/PayUMoney';
import AstroProfile from '../screens/AstrologyScreens/AstroProfile';
import AstroProfileReviews from '../screens/AstrologyScreens/AstroProfileReviews';
import OrderHistory from '../screens/AstrologyScreens/OrderHistory';
import MatchMaking from '../screens/AstrologyScreens/MatchMaking';
import ViewMatchMakingResults from '../screens/AstrologyScreens/ViewMatchMakingResults/index.jsx';

import ReportsPaymentScreen from '../screens/AstrologyScreens/ReportsPaymentScreen';

import HoroscopeBySign from '../screens/AstrologyScreens/HoroscopeBySign';
import HoroscopeBirthDetails from '../screens/AstrologyScreens/HoroscopeBirthDetails';
import HoroscopePersonalized from '../screens/AstrologyScreens/HoroscopePersonalizedScreen';
import LocationScreen from '../screens/AstrologyScreens/LocationScreen';
import ReportOrderDetails from '../screens/AppScreens/ReportOrderDetails/index.jsx';
import OrderInvoice from '../screens/AppScreens/OrderInvoice/index.jsx';

import BottomSheetModalAddMember from '../components/bottomsheet-modal';
import SelectedCategory from '../screens/AppScreens/SelectedCategory';
import Stories from '../screens/AppScreens/Stories/index';
import FunFactWebView from '../components/funFactWebView';
import PanchangDefinitions from '../screens/AstrologyScreens/PanchangDefinitions/index.jsx';
import {useSelector} from 'react-redux';
import MatchMakingDefinitions from '../screens/AstrologyScreens/MatchMakingDefinitions';
enableScreens(false);
const Stack = createNativeStackNavigator();

export const AstroWrapper = ({children}) => {
  return <PaperProvider theme={astroTheme}>{children}</PaperProvider>;
};

const AppStack = () => {
  const navigation = useNavigation();
  const isChatScreenOpenedInReadOnlyMode = useSelector(
    state => state?.agoraCallSlice?.readOnlyMode,
  );

  const globalScreenOptions = {
    headerShown: false,
    contentStyle: {
      backgroundColor: Theme.light.background,
    },
    headerBackTitleVisible: false,
    ...Platform.select({
      android: {
        gestureEnabled: true,
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
        presentation: 'card',
      },
    }),
  };

  useEffect(() => {
    const handleDeepLink = ({url}) => {
      // Handle the URL
      const route = url.replace(/.*?:\/\//g, '');

      // Use a more flexible regex to extract the ID
      const match = route.match(/story\/([^\/]+)/);

      if (match && match[1]) {
        const id = match[1];
        navigation.navigate('ViewStory', {SingleStoryId: id});
      } else {
        // Optionally, you can show an alert or handle this case
        // Alert.alert('Invalid Link', 'The link does not contain a valid story ID.');
      }
    };

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({url});
      }
    });

    return () => {
      // Clean up the event listener
      subscription.remove();
    };
  }, [navigation]);

  const _theme = {
    ...DefaultDarkTheme,
    colors: {
      ...DefaultDarkTheme.colors,
      primary: '#6944D3',
      onPrimary: '#fff',
      background: '#13102B',
      headerIcon: '#fff',
      surfaceVariant: '#2B2941',
      text: '#fff',
      inputColor: '#fff',
      error: '#FF4F4F',
    },
    fonts: configureFonts({config: fontConfig}),
    isDarkTheme: true,
  };

  const AstroNotificationsScreen = () => (
    <AstroWrapper>
      <AstroNotifications />
    </AstroWrapper>
  );
  const ViewReportsScreen = () => (
    <AstroWrapper>
      <ViewReports />
    </AstroWrapper>
  );
  const AstroOrderHistoryScreen = () => (
    <AstroWrapper>
      <OrderHistory />
    </AstroWrapper>
  );

  const AstroTransactionScreen = () => (
    <AstroWrapper>
      <Transactions />
    </AstroWrapper>
  );
  const BirthDetailsScreen = () => (
    <AstroWrapper>
      <AstroBirthDetailsScreen />
    </AstroWrapper>
  );
  const MatchMakingScreen = () => (
    <AstroWrapper>
      <MatchMaking />
    </AstroWrapper>
  );
  const AstroBirthDetailsReportsScreen = () => (
    <AstroWrapper>
      <AstroBirthDetailsReportsScreen />
    </AstroWrapper>
  );
  const AstroProfileReviewsScreen = () => (
    <AstroWrapper>
      <AstroProfileReviews />
    </AstroWrapper>
  );
  const AstroBirthDetailsTabsScreen = () => (
    <AstroWrapper>
      <AstroBirthDetailsTabs />
    </AstroWrapper>
  );
  const AstroProfileScreen = () => (
    <AstroWrapper>
      <AstroProfile />
    </AstroWrapper>
  );
  const AstroConsultationSearch = () => (
    <AstroWrapper>
      <ConsultationSearch />
    </AstroWrapper>
  );
  const AstroReportPaymentScreen = () => (
    <AstroWrapper>
      <ReportsPaymentScreen />
    </AstroWrapper>
  );

  const AstroHoroscopeBySign = () => (
    <AstroWrapper>
      <HoroscopeBySign />
    </AstroWrapper>
  );
  const AstroHoroscopeBirthDetails = () => (
    <AstroWrapper>
      <HoroscopeBirthDetails />
    </AstroWrapper>
  );
  const AstroHoroscopePersonalized = () => (
    <AstroWrapper>
      <HoroscopePersonalized />
    </AstroWrapper>
  );
  const AstroViewMatchMakingResults = () => (
    <AstroWrapper>
      <ViewMatchMakingResults />
    </AstroWrapper>
  );
  const AstroLocation = () => (
    <AstroWrapper>
      <LocationScreen />
    </AstroWrapper>
  );

  const PanchangDefinitionsScreen = () => (
    <AstroWrapper>
      <PanchangDefinitions />
    </AstroWrapper>
  );
  const MatchMakingDefinitionsScreen = () => (
    <AstroWrapper>
      <MatchMakingDefinitions />
    </AstroWrapper>
  );

  return (
    <>
      <Stack.Navigator
        screenOptions={globalScreenOptions}
        initialRouteName="BottomTabs">
        <Stack.Screen
          options={{
            animation: 'slide_from_right',
            animationTypeForReplace: 'push',
          }}
          name="BottomTabs"
          component={BottomTabs}
        />
        <Stack.Screen
          options={{
            animation: 'slide_from_right',
            animationTypeForReplace: 'push',
            gestureEnabled: false,
          }}
          name="AstroBottomTabs"
          component={AstroBottomTabs}
        />
        <Stack.Screen
          name="CallAnswer"
          options={{gestureEnabled: false}}
          component={CallAnswer}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{gestureEnabled: isChatScreenOpenedInReadOnlyMode}}
        />
        <Stack.Screen
          name="ReadOnlyChatScreen"
          component={ChatScreen}
          options={{gestureEnabled: isChatScreenOpenedInReadOnlyMode}}
        />
        <Stack.Screen
          name="AstroBirthDetailsTabs"
          component={AstroBirthDetailsTabs}
        />
        <Stack.Screen
          name="AstroBirthDetailsTabsReports"
          component={AstroBirthDetailsTabsReports}
        />
        <Stack.Screen
          name="AstroHoroscopePersonalized"
          component={AstroHoroscopePersonalized}
        />
        <Stack.Screen
          name="AstroHoroscopeBySign"
          component={AstroHoroscopeBySign}
        />
        <Stack.Screen
          name="AstroHoroscopeBirthDetails"
          component={AstroHoroscopeBirthDetails}
        />

        <Stack.Screen
          name="AstroBirthDetailsReportsScreen"
          component={AstroBirthDetailsReportsScreen}
        />

        <Stack.Screen name="AstroLocation" component={AstroLocation} />
        <Stack.Screen
          name="AstroViewMatchMakingResults"
          component={AstroViewMatchMakingResults}
        />
        <Stack.Screen name="MatchMaking" component={MatchMakingScreen} />

        <Stack.Screen
          name="AstroTransaction"
          component={AstroTransactionScreen}
        />
        <Stack.Screen
          name="AstroProfile"
          component={AstroProfileScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="AstroProfileReviews"
          component={AstroProfileReviewsScreen}
        />
        <Stack.Screen
          name="AstroConsultationSearch"
          component={AstroConsultationSearch}
        />
        <Stack.Screen
          name="AstroBirthDetailsScreen"
          component={BirthDetailsScreen}
        />

        <Stack.Screen
          name="AstroNotifications"
          component={AstroNotificationsScreen}
        />
        <Stack.Screen
          name="AstroOrderHistory"
          component={AstroOrderHistoryScreen}
        />
        <Stack.Screen name="WalletHistory" component={WalletHistory} />
        <Stack.Screen name="Wallet" component={Wallet} />

        <Stack.Screen name="MoneyPreDefined" component={MoneyPreDefined} />
        <Stack.Screen name="GstCallculation" component={GstCallculation} />
        <Stack.Screen
          name="WalletHistoryOverview"
          component={WalletHistoryOverview}
        />
        <Stack.Screen name="PayuMoney" component={PayuMoney} />
        <Stack.Screen name="AstroViewReports" component={ViewReportsScreen} />
        <Stack.Screen name="OrderInvoice" component={OrderInvoice} />
        <Stack.Screen
          name="ReportsPaymentScreen"
          component={AstroReportPaymentScreen}
        />
        <Stack.Screen
          name="ProfileDetails"
          component={ProfileDetailsScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
            headerLeft: () => null,
            animationEnabled: false,
          }}
        />
        <Stack.Screen name="Members" component={Members} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen
          name="AstrologyLoginWithMobile"
          component={AstrologyLoginWithMobile}
          options={{
            title: 'AstrologyLoginWithMobile',
          }}
        />
        <Stack.Screen
          name="AstrologyVerifyMobileOTP"
          component={AstrologyVerifyMobileOTP}
          options={{
            title: 'AstrologyVerifyMobileOTP',
          }}
        />

        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{
            title: 'Account Settings',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="MyOrder"
          component={MyOrder}
          options={{
            title: 'MyOrder',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />

        <Stack.Screen
          name="ReportOrderDetails"
          component={ReportOrderDetails}
        />

        <Stack.Screen
          name="Orderno"
          component={Orderno}
          options={{
            title: 'Orderno',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="ProfileSettings"
          component={ProfileSettings}
          options={{
            title: 'Profile Settings',
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="Faq"
          component={Faq}
          options={{
            title: 'FAQs',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="SelectedCategory"
          component={SelectedCategory}
          options={{
            title: 'Selected Category',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="funFactWebView"
          component={FunFactWebView}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="News"
          component={News}
          options={{
            title: 'News',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{
            title: 'News',
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="EmailReVerify"
          component={EmailReVerify}
          options={{
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="EmailOTPReverify"
          component={EmailOTPReverify}
          options={{
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="MobileVerification"
          component={MobileVerification}
          options={{
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="MobileOTPverification"
          component={MobileOTPverification}
          options={{
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen
          name="SubcategoryScreen"
          component={SubcategoryScreen}
          options={{title: 'Subcategory'}}
        />
        <Stack.Screen name="Stories" component={Stories} />
        <Stack.Screen
          name="AboutUs"
          component={AboutUs}
          options={{
            title: 'About iMeUsWe',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="ImeusweUser"
          component={ImeusweUser}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ImuwTailorSearch"
          component={ImuwTailorSearch}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Feedback" component={Feedback} />
        <Stack.Screen name="AIStoryForm" component={AIStoryForm} />
        <Stack.Screen
          name="FeedbackSurvey"
          component={FeedbackSurvey}
          options={{
            title: 'Feedback Survey',
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="TreeScreen"
          component={TreeScreen}
          options={{
            title: 'TreeScreen',
          }}
        />
        <Stack.Screen
          name="Tree"
          component={Tree}
          options={{
            title: 'Create Tree',
            headerShown: true,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="Privacy"
          component={Privacy}
          options={{
            title: 'Privacy Policy',
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="AccountDna"
          component={AccountDna}
          options={{
            title: 'DNA',
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.light.background,
            },
          }}
        />
        <Stack.Screen
          name="AddMemory"
          component={AddMemory}
          options={{
            title: 'Add Memory',
            headerShown: false,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="AddNote"
          component={AddNote}
          options={{
            title: 'Add Notes',
            headerShown: false,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="ViewNotes"
          component={ViewNotes}
          options={{
            title: 'View Notes',
            headerShown: false,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="AddChapter"
          component={AddChapter}
          options={{
            title: 'Create Lifestory',
            headerShown: false,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="StoriesForm"
          component={StoriesForm}
          options={{
            title: 'Create AI Story',
            headerShown: false,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="ConnectionInfo"
          component={ConnectionInfo}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Social Media
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WorkInfo"
          component={WorkInfo}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Work History
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MarriageInfo"
          component={MarriageInfo}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Marriage History
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EducationInfo"
          component={EducationInfo}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Education History
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BasicFact"
          component={BasicFact}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Basic Facts
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunityInfo"
          component={CommunityInfo}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Community Details
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MedicalInfo"
          component={MedicalInfo}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Medical History
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditMemory"
          component={EditMemory}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Edit Memory
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewMemory"
          component={ViewMemory}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddMemberForm"
          component={AddMemberForm}
          options={{
            title: 'AddMemberForm',
          }}
        />
        <Stack.Screen
          name="EditChapter"
          component={EditChapter}
          options={{
            headerTitle: () => (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80%',
                }}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Edit Lifestory!
                </Text>
              </View>
            ),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewMemberDetails"
          component={ViewMemberDetails}
          options={({route}) => ({
            headerShown: true,
            header: () => (
              <ViewMemberDetailsHeader
                selectedMemberData={route.params.selectedMemberData}
                currentTreeDetails={route.params.currentTreeDetails}
                reloadTreeCallback={route.params.reloadTreeCallback}
                fromMemberTab={route.params.fromMemberTab}
                treeId={route.params.treeId}
                id={route.params.id}
              />
            ),
          })}
        />
        <Stack.Screen
          name="LinkMember"
          component={LinkMember}
          options={{
            title: 'AddMemberForm',
          }}
        />
        <Stack.Screen name="InviteSheetModal" component={InviteSheetModal} />
        <Stack.Screen name="BottomSheetModal" component={BottomSheetModal} />
        <Stack.Screen
          name="CreateStory"
          component={CreateStory}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddTagging"
          component={AddTagging}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StoryQuotes"
          component={StoryQuotes}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AIStoryCategories"
          component={AIStoryCategories}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewStory"
          options={{
            headerShown: false,
          }}
          component={ViewStory}
        />
        <Stack.Screen
          name="ViewChapter"
          component={ViewChapter}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewAutoChapter"
          component={ViewAutoChapter}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
        <Stack.Screen
          name="ManageGroups"
          options={{
            // title: '',
            headerShown: false,
            // headerBackVisible: false,
            // // headerShadowVisible: false,
            // headerTitle: () => (
            //   <StoriesHeader showLogo={false} from={'manageGroup'} />
            // ),
            // headerShown: true,
            // headerShadowVisible: false,
            // headerStyle: {backgroundColor: '#f8f4f4'},
          }}
          component={ManageGroups}
        />
        <Stack.Screen
          name="EditGroup"
          options={{
            headerShown: false,
            headerBackVisible: false,
            // title: '',
            // headerTitle: () => (
            //   <EditGroupHeader
            //     onDelete={() =>
            //       navigation.navigate('EditGroup', {delete: true})
            //     }
            //     onSave={() => navigation.navigate('EditGroup', {save: true})}
            //   />
            // ),
            // headerShown: true,
            // headerShadowVisible: false,
            // headerStyle: {backgroundColor: 'white'},
            // initialParams: {data: 'demo'},
          }}
          component={EditGroup}
        />
        <Stack.Screen
          name="ImeusweSearch"
          component={ImeusweSearch}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ImeusweSearchResults"
          component={ImuwSearchResults}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ImeuswePublicSearch"
          component={ImuwPublicSearch}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ImeusweSingularSearch"
          component={ImuwSingularSearch}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="WhatsOnBell"
          component={WhatsOn}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateCommunity"
          component={CreateCommunity}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditCommunity"
          component={EditCommunity}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewSingleDiscussion"
          component={ViewSingleDiscussion}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="CommunitiesScreen"
          component={CommunitiesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="InviteIntialCommunityMembers"
          component={InviteIntialCommunityMembers}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunityInviteScreen"
          component={InviteScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunitySearchScreen"
          component={CommunitySearchScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunityDetails"
          component={CommunityDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunityJoiningRequests"
          component={CommunityJoiningRequests}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="InviteSearchScreen"
          component={InviteSearchScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageCommunityMembers"
          component={ManageCommunityMembers}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunityList"
          component={CommunityList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ReligionList"
          component={ReligionList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GothraList"
          component={GothraList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ScriptList"
          component={ScriptList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="InviteToCommunity"
          component={InviteToCommunity}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="InviteScreen"
          component={InviteScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewSinglePoll"
          component={ViewSinglePoll}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateCommunityPosts"
          component={CreateCommunityPosts}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CommunitySelector"
          component={CommunitySelector}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BottomSheetModalAddMember"
          component={BottomSheetModalAddMember}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PanchangDefinitions"
          component={PanchangDefinitionsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MatchMakingDefinitions"
          component={MatchMakingDefinitionsScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </>
  );
};

export default AppStack;
