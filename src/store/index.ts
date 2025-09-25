import { configureStore } from '@reduxjs/toolkit';
import userInfo from './apps/userInfo';
import apiViewChapter from './apps/viewChapter';
import fetchUserProfile from './apps/fetchUserProfile';
import apiViewMemory from './apps/viewMemory';
import redDot from './apps/redDot';
import apiDirectFamily from './apps/directFamily';
import CheckAuth from './apps/CheckAuth';
import Feedback from './apps/Feedback';
import getCategoryData from './apps/SearchResult';
// import NotificationSettings from './apps/NotificationSettings';
import Tree from './apps/tree';
import invitedMember from './apps/Members';
import invitedTreeMember from './apps/suggestedInvites';
import familyType from './apps/familyType';
import home from './apps/home';
import story from './apps/story';
import memberDirectory from './apps/memberDirectorySlice';
import removeActiveMember from './apps/removeActiveMember';
import media from './apps/mediaSlice';
import deleteMember from './apps/deleteMember';
import community from './apps/community';
import getFamilyStats from './apps/familyStats';
import getprivateTreeList from './apps/tree';
import existMemberInvite from './apps/tree/treeSlice';
import DeclineInvite from './apps/tree/treeSlice';
import getGroupData from './apps/tree';
import fetchUserNotification from './apps/notifications';
import getListPublicData from './apps/listPublicData';
import addUserProfile from './apps/addUserProfile';
import apiProgressBar from './apps/progressBar';
import deepSearch from './apps/deepSearch';
import socialLoginData from './apps/socialLoginData';
import createCommunity from './apps/createCommunity';
import uploadCommunityLogo from './apps/uploadCommunityLogo';
import getCommunityDetails from './apps/getCommunityDetails';
import getCommunityJoiningRequests from './apps/getCommunityJoiningRequests';
import createPoll from './apps/createPoll';
import getAllCommunityPosts from './apps/getAllCommunityPosts';
import pollsUpdatedData from './apps/pollsUpdatedData';
import tag from './apps/tagSlice';
import Faq from './apps/Faq';
import getToastMessages from './apps/getToastMessages';
import userManagementToasts from './apps/userManagementToastsSlice';
import searchResult from './apps/SearchResult';
import agoraCallSlice from './apps/agora';
import astroKundaliSlice from './apps/astroKundali';
import walletSlice from './apps/wallet';
import astroProfile from './apps/astroProfile';
import astrologersSearch from './apps/astrologersSearch';
import astroFilters from './apps/astroFilters';
import astrologersListing from './apps/astrologersListing';
import userLocation from './apps/userLocation';
import astroHome from './apps/astroHome';
import astroMatchMaking from './apps/astroMatchMaking';
import astroPanchang from './apps/astroPanchang';
import astroHoroscope from './apps/astroHoroscope';
import news from './apps/news';
import authSlice from './apps/auth';
import funFact from './apps/funFactCard';
import locationSearch from './apps/locationSearch';
import pushNotificationSlice from './apps/pushnotification';
import reportsSlide from './apps/reportsSlide';
import astroLinking from './apps/astroLinking';
import astroFeature from './apps/astroFeatureSlice';
import astrologerProfile from './apps/astrologerProfile';
import orderHistory from './apps/orderHistory';
import sentry from './apps/sentry';

export const store = configureStore({
  reducer: {
    reportsSlide,
    pushNotificationSlice,
    userLocation,
    locationSearch,
    astroPanchang,
    astroKundaliSlice,
    astroMatchMaking,
    astroHome,
    redDot,
    tag,
    userInfo,
    searchResult,
    getCategoryData,
    CheckAuth,
    Feedback,
    // NotificationSettings,
    apiViewChapter,
    fetchUserProfile,
    apiViewMemory,
    apiDirectFamily,
    astroLinking,
    Tree,
    invitedMember,
    invitedTreeMember,
    familyType,
    removeActiveMember,
    deleteMember,
    media,
    home,
    story,
    memberDirectory,
    community,
    getFamilyStats,
    getprivateTreeList,
    getGroupData,
    fetchUserNotification,
    existMemberInvite,
    DeclineInvite,
    getListPublicData,
    deepSearch,
    addUserProfile,
    apiProgressBar,
    socialLoginData,
    Faq,
    createCommunity,
    uploadCommunityLogo,
    getCommunityDetails,
    getCommunityJoiningRequests,
    createPoll,
    getAllCommunityPosts,
    pollsUpdatedData,
    getToastMessages,
    userManagementToasts,
    agoraCallSlice,
    walletSlice,
    astroProfile,
    astrologersSearch,
    astroFilters,
    astrologersListing,
    funFact,
    astroHoroscope,
    news,
    authSlice,
    astroFeature,
    astrologerProfile,
    orderHistory,
    sentry,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
