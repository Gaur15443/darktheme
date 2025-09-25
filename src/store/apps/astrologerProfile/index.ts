import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';
import {AxiosError} from 'axios';
import authConfig from '../../../configs';
import {AstrologerProfileResponse, AstrologerProfileState} from './types';

export const getAstrologerProfile = createAsyncThunk<
  AstrologerProfileResponse,
  {userId: string}
>('astrologer/getAstrologerProfile', async (payload, {rejectWithValue}) => {
  try {
    const response = await Axios.get(
      `${authConfig.atrologerBaseUrl}/api/astro-profile/get/?userId=${payload.userId}`,
    );
    return response.data;
  } catch (error: AxiosError | any) {
    return rejectWithValue(error?.response?.data);
  }
});

const initialState: AstrologerProfileState = {
  astrologerProfileDetails: {
    success: false,
    message: '',
    astroProfile: {
      permanentAddress: {
        address: '',
        city: '',
        district: '',
        state: '',
        country: '',
      },
      currentAddress: {
        address: '',
        city: '',
        district: '',
        state: '',
        country: '',
      },
      bankDetails: {
        accountHolderName: '',
        IFSCcode: '',
        bankFileMediaId: '',
      },
      panrCard: {
        panHolderName: '',
        panNumber: '',
        pancardMediaId: '',
      },
      aadharCard: {
        aadharName: '',
        aadharNumber: '',
        aadharCardFileMediaId: '',
      },
      rates: {
        STIndia: 0,
        STOutsideIndia: 0,
        India: null,
        OutsideIndia: null,
      },
      imeusweCommissionPercentage: 0,
      _id: '',
      userId: '',
      skills: '',
      language: [],
      commissionPercentage: 0,
      liveStatus: '',
      isActive: false,
      isShow: false,
      isFirstRequestType: false,
      isFirstRequestStatus: '',
      isCompleteProfile: false,
      isLogin: false,
      createdAt: '',
      updatedAt: '',
      __v: 0,
      alternateEmail: '',
      alternateMobile: '',
      astrologerSpecialty: '',
      bestSkills: '',
      bio: '',
      displayName: '',
      prefix: '',
      gstNumber: '',
      yearsOfExp: 0,
    },
    userProfile: {
      deviceInfo: {
        appVersion: '',
        platForm: '',
        osVersion: '',
        model: '',
        operatingSystem: '',
        deviceToken: '',
      },
      groupType: {
        groupType1: '',
        groupType2: 0,
      },
      personalDetails: {
        name: '',
        middlename: '',
        lastname: '',
        nickname: null,
        showNickname: false,
        gender: null,
        relationStatus: null,
        profilepic: null,
        livingStatus: null,
      },
      location: {
        currentLocationObject: {
          city: null,
          stateRegion: null,
          country: null,
        },
        currentlocation: null,
        previous_locations: [],
        placeOfBirth: null,
        placeOfDeath: null,
      },
      birthDetails: {
        dob: null,
        dod: null,
        dobMediaIds: [],
        dodMediaIds: [],
      },
      medicalDetails: {
        chronic_condition: [],
        allergies: [],
        illnesses: [],
        preExistingConditions: [],
      },
      moreInfo: {
        community: null,
        subcommunity: null,
        religion: null,
        motherTounge: null,
        gothra: null,
        deity: null,
        priestName: null,
        ancestorVillage: null,
      },
      educationDetails: {
        college: [],
        school: [],
      },
      _id: '',
      cognitousername: '',
      smsCount: 0,
      email: '',
      password: '',
      countryCode: 91,
      mobileNo: 0,
      isAroundDOB: false,
      isAroundDOD: false,
      updateaIStoryCountDate: null,
      treeIdin: [],
      parents: [],
      children: [],
      husbands: [],
      wifes: [],
      siblings: [],
      linkedGroup: [],
      isClone: false,
      userRoles: [],
      isDeleted: false,
      isActiveStatus: false,
      updatedSmsCountDate: '',
      aIStoryCount: 0,
      marriageDetails: [],
      workDetails: [],
      sociallinks: [],
      other: [],
      cLink: [],
      createdAt: '',
      updatedAt: '',
      emailVerification: '',
      emailVerified: false,
      mobileVerification: '',
      otpExpiry: '',
      mobileVerified: false,
      astrologyOnboardingComplete: false,
    },
    images: {
      profileImgUrl: '',
      bankFileUrl: '',
      pancardFileUrl: '',
      aadharCardFileUrl: '',
    },
  },
};

export const astrologerProflieSlice = createSlice({
  name: 'astrologerProfile',
  initialState,
  reducers: {},
  extraReducers: builder => {
    //astrologer profile
    builder
      .addCase(getAstrologerProfile.pending, _ => {})
      .addCase(getAstrologerProfile.fulfilled, (state, action) => {
        state.astrologerProfileDetails = action.payload;
      })
      .addCase(getAstrologerProfile.rejected, _ => {});
  },
});
export const {} = astrologerProflieSlice.actions;
export default astrologerProflieSlice.reducer;
