import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// ** Fetch UserInfo
export const getUserInfo = createAsyncThunk(
  'appUserInfo/getUserInfo',
  async () => {
    const response = await Axios.get('userInfo/v1');
    return response;
  },
);

const initialState = {
  loading: false,
  deviceInfo: null,
  groupType: null,
  personalDetails: null,
  mobileNo: null,
  location: null,
  birthDetails: null,
  marriageDetails: null,
  medicalDetails: null,
  moreInfo: null,
  educationDetails: null,
  signup: null,
  cognitousername: null,
  smsCount: null,
  treeIdin: null,
  parents: null,
  children: null,
  husbands: null,
  wifes: null,
  siblings: null,
  linkedGroup: null,
  _id: null,
  userRoles: null,
  emailVerified: null,
  mobileVerified: null,
  countryCode: null,
  email: null,
  updatedSmsCountDate: null,
  workDetails: null,
  sociallinks: null,
  other: null,
  createdAt: null,
  updatedAt: null,
  __v: null,
  MD_Flag: null,
  isoCode: null,
  error: null,
  isClone: null,
  cLink: null,
};

export const appUserInfoSlice = createSlice({
  name: 'appUserInfo',
  initialState,
  reducers: {
    /**
     * Updates user profile picture.
     * @param {string} url - image url
     */
    setUserProfilePic(state, {payload: url}) {
      if (!state.personalDetails) {
        state.personalDetails = {};
      }
      state.personalDetails.profilepic = url;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getUserInfo.pending, state => {
        state.loading = true;
        state.deviceInfo = null;
        state.groupType = null;
        state.personalDetails = null;
        state.location = null;
        state.birthDetails = null;
        state.marriageDetails = null;
        state.medicalDetails = null;
        state.moreInfo = null;
        state.mobileNo = null;
        state.educationDetails = null;
        state.signup = null;
        state.cognitousername = null;
        state.smsCount = null;
        state.treeIdin = null;
        state.parents = null;
        state.children = null;
        state.husbands = null;
        state.wifes = null;
        state.siblings = null;
        state.linkedGroup = null;
        state._id = null;
        state.userRoles = null;
        state.emailVerified = null;
        state.mobileVerified = null;
        state.countryCode = null;
        state.email = null;
        state.updatedSmsCountDate = null;
        state.workDetails = null;
        state.sociallinks = null;
        state.other = null;
        state.createdAt = null;
        state.updatedAt = null;
        state.__v = null;
        state.MD_Flag = null;
        state.isoCode = null;
        state.error = null;
        state.isClone = null;
        state.cLink = null;
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.deviceInfo = action?.payload?.data?.deviceInfo;
        state.groupType = action?.payload?.data?.groupType;
        state.personalDetails = action?.payload?.data?.personalDetails;
        state.location = action?.payload?.data?.location;
        state.birthDetails = action?.payload?.data?.birthDetails;
        state.marriageDetails = action?.payload?.data?.marriageDetails;
        state.medicalDetails = action?.payload?.data?.medicalDetails;
        state.moreInfo = action?.payload?.data?.moreInfo;
        // state.educationDetails = action.payload.data.educationDetails
        // state.signup = action.payload.data.signup
        // state.cognitousername = action.payload.data.cognitousername
        // state.smsCount = action.payload.data.smsCount
        state.treeIdin = action?.payload?.data?.treeIdin;
        // state.parents = action.payload.data.parents
        // state.children = action.payload.data.children
        // state.husbands = action.payload.data.husbands
        // state.wifes = action.payload.data.wifes
        // state.siblings = action.payload.data.siblings
        state.linkedGroup = action.payload?.data?.linkedGroup;
        state._id = action?.payload?.data?._id;
        state.userRoles = action?.payload?.data?.userRoles;
        state.emailVerified = action.payload.data.emailVerified;
        state.mobileVerified = action.payload.data.mobileVerified;
        // state.countryCode = action.payload.data.countryCode
        state.email = action?.payload?.data?.email;
        state.mobileNo = action?.payload?.data?.mobileNo;
        // state.updatedSmsCountDate = action.payload.data.updatedSmsCountDate
        // state.workDetails = action.payload.data.workDetails
        // state.sociallinks = action.payload.data.sociallinks
        // state.other = action.payload.data.other
        // state.createdAt = action.payload.data.createdAt
        // state.updatedAt = action.payload.data.updatedAt
        // state.__v = action.payload.data.__v
        // state.MD_Flag = action.payload.data.MD_Flag
        // state.isoCode = action.payload.data.isoCode
        state.error = action?.payload?.data?.error;
        state.isClone = action?.payload?.data?.isClone;
        state.cLink = action?.payload?.data?.cLink;
      })
      .addCase(getUserInfo.rejected, state => {
        state.loading = false;
        state.deviceInfo = null;
        state.groupType = null;
        state.personalDetails = null;
        state.location = null;
        state.birthDetails = null;
        state.marriageDetails = null;
        state.medicalDetails = null;
        state.moreInfo = null;
        state.educationDetails = null;
        state.signup = null;
        state.cognitousername = null;
        state.smsCount = null;
        state.treeIdin = null;
        state.parents = null;
        state.children = null;
        state.husbands = null;
        state.wifes = null;
        state.siblings = null;
        state.linkedGroup = null;
        state._id = null;
        state.userRoles = null;
        state.emailVerified = null;
        state.mobileVerified = null;
        state.countryCode = null;
        state.email = null;
        state.mobileNo = null;
        state.updatedSmsCountDate = null;
        state.workDetails = null;
        state.sociallinks = null;
        state.other = null;
        state.createdAt = null;
        state.updatedAt = null;
        state.__v = null;
        state.MD_Flag = null;
        state.isoCode = null;
        state.error = null;
        state.isClone = null;
        state.cLink = null;
      });
  },
});

export const {setUserProfilePic} = appUserInfoSlice.actions;

export default appUserInfoSlice.reducer;
