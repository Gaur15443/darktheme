import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';
import axios from 'axios';
import {getDeviceInfo} from '../../../utils/format';
// ** Config
import authConfig from '../../../configs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTimezone} from './../../../utils/index';

const authAxios = axios.create({
  baseURL: authConfig.authBaseUrl,
});

const timezone = getTimezone();

authAxios.interceptors.response.use(
  request => request,
  error => {
    if (error?.response?.data?.name === authConfig.webError) {
      (async () => await AsyncStorage.clear())();
    }
    if (error?.response?.data?.message && error?.response?.status !== 503) {
      error.message = error?.response?.data?.message;
    }
    if (error?.response?.status === 503) {
      error.message = 'Oops! Something went wrong.';
    }
    if (error?.message === 'Network Error') {
      error.message = 'Uh-oh! No network found.';
    }

    throw error;
  },
);

export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async (payload, {rejectWithValue}) => {
    try {
      const cognitousername = payload.email.split('@')[0];
      const deviceInfo = getDeviceInfo();

      deviceInfo.timezone = timezone;

      const data = {
        cognitousername,
        deviceInfo,
        email: payload.email,
        password: payload.password,
      };

      const res = await authAxios.post('/user/signup/email', data);
      return res;
    } catch (error) {
      throw rejectWithValue(error?.response?.data);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async payload => {
    const res = await authAxios.post('/user/forgotPassword', payload);
    return res?.data;
  },
);

export const forgotPasswordVerification = createAsyncThunk(
  'auth/forgotPasswordVerification',
  async payload => {
    const {data} = await authAxios.post(
      '/user/forgotPasswordVerification',
      payload,
    );
    await AsyncStorage.setItem('forgotPasswordVerificationAccessToken', data);
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async payload => {
    const response = await authAxios.post('/user/resetPassword', payload);
    return response?.data;
  },
);

export const setUserBasicSignupInfo = createAsyncThunk(
  'auth/setUserBasicSignupInfo',
  async (payload, {rejectWithValue}) => {
    try {
      await Axios.post('/userMgmt/basicInfo', payload);
    } catch (error) {
      throw rejectWithValue(error?.response?.data);
    }
  },
);

export const setGenderDataUpdate = createAsyncThunk(
  'auth/setGenderDataUpdate',
  async (payload, {rejectWithValue}) => {
    try {
      const res = await Axios.put('/userMgmt/genderUpdate', payload);
      return res;
    } catch (error) {
      throw rejectWithValue(error?.response?.data);
    }
  },
);

export const updateGroupSignupPage = createAsyncThunk(
  'auth/updateGroupSignupPage',
  async payload => {
    await Axios.put(`/updategroupsignupPage/${payload.userId}`, payload.data);
  },
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async payload => {
    const response = await authAxios.post('/user/verifyEmail/v1', payload);
    return response;
  },
);

export const sendEmailOtp = createAsyncThunk(
  'auth/resendOtp',
  async payload => {
    const {data} = await authAxios.post('/user/resendOtp', payload);
    return data;
  },
);

// * Mobile OTP Apis
export const registerWithMobile = createAsyncThunk(
  'auth/registerWithMobile',
  async (payload, {rejectWithValue}) => {
    try {
      const deviceInfo = getDeviceInfo();
      deviceInfo.timezone = timezone;

      const data = {
        deviceInfo,
        mobileNo: payload.mobileNo,
        countryCode: payload.countryCode,
      };

      const res = await authAxios.post('/user/signup/mobile', data);
      return res;
    } catch (error) {
      throw rejectWithValue(error?.response?.data);
    }
  },
);

// Verify OTP
export const verifyMobile = createAsyncThunk(
  'auth/verifyMobile',
  async payload => {
    const response = await authAxios.post('/user/verifyMobile', payload);
    return response;
  },
);

// * Login with OTP
export const loginwithMobile = createAsyncThunk(
  'auth/loginwithMobile',
  async payload => {
    const response = await authAxios.post('/user/loginWithMobile', payload);
    return response;
  },
);

// Login with OTP Astrology
export const loginwithMobileV2 = createAsyncThunk(
  'auth/loginwithMobileV2',
  async payload => {
    const response = await authAxios.post('/user/loginWithMobileV2', payload);
    return response;
  },
);
// Resend Mobile OTP
export const resendOtpMobile = createAsyncThunk(
  'auth/resendOtpMobile',
  async payload => {
    const response = await authAxios.post(`/user/resendOtpMobile`, payload);
    return response;
  },
);

const initialState = {
  authDetails: {},
  confirmGender: {},
  mobileNumber: null,
  countryCode: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setMobileNumber(state, {payload}) {
      state.mobileNumber = payload;
    },
    setCountryCodeStore(state, {payload}) {
      state.countryCode = payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(verifyEmail.pending, state => {
        state.authDetails = {};
      })

      .addCase(sendEmailOtp.pending, state => {
        state.authDetails = {};
      })
      .addCase(sendEmailOtp.fulfilled, (state, {payload}) => {
        state.authDetails = payload;
      })
      .addCase(resendOtpMobile.pending, state => {
        state.authDetails = {};
      })
      .addCase(resendOtpMobile.fulfilled, (state, {payload}) => {
        state.authDetails = payload;
      })
      .addCase(verifyMobile.pending, state => {
        state.authDetails = {};
      });

    builder
      .addCase(setGenderDataUpdate.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setGenderDataUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.confirmGender = action.payload;
      })
      .addCase(setGenderDataUpdate.rejected, state => {
        state.loading = false;
        state.error = 'Error fetching confirmGender';
      });
  },
});
export const {setMobileNumber, setCountryCodeStore} = authSlice.actions;
export default authSlice.reducer;
