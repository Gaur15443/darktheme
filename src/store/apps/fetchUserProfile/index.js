// apiSlice.js

import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';
import nativeConfig from 'react-native-config';

export const accountDelete = createAsyncThunk(
  'api/accountDelete',
  async data => {
    const {UserId, Email, Firstname, Lastname, Subject, Description} = data;
    const response = await Axios.post('/deleteAccount', {
      UserId,
      Email,
      Firstname,
      Lastname,
      Subject,
      Description,
    });

    return response.data;
  },
);

export const fetchUserProfile = createAsyncThunk(
  'api/fetchUserProfile',
  async (userId, {rejectWithValue}) => {
    try {
      const response = await Axios.get(`/getUserProfile/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

// Async thunk to get order data
export const getOrderData = createAsyncThunk(
  'api/getOrderData',
  async email => {
    const response = await Axios.get(
      `${nativeConfig.CRON_BASE_URL}/getOrder/${email}`,
    );
    return response.data;
  },
);

const initialState = {
  data: [],
  loading: 'idle',
  error: null,
  orderData: null,
  isDataFetched: false,
  noOrders: false,
  basicInfo: {},
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setOtherUserProfile(state, {payload: url}) {
      if (
        state.data &&
        state.data.myProfile &&
        !state.data.myProfile.personalDetails
      ) {
        state.data.myProfile.personalDetails = {};
      }
      if (state.data.myProfile.personalDetails.profilepic) {
        state.data.myProfile.personalDetails.profilepic = url;
      }
    },
    resetUserProfile(state, {payload}) {
      state.basicInfo[payload] = null;
    },
    setNoOrders: (state, action) => {
      state.noOrders = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(fetchUserProfile.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state.loading = 'succeeded';
        state.data = action.payload;
        state.basicInfo[userId] = action.payload;
        state.isDataFetched = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    builder

      .addCase(accountDelete.fulfilled, (state, action) => {
        state.data = action.payload;

        state.error = null;
      })

      .addCase(accountDelete.rejected, (state, action) => {
        state.data = null;

        state.error = action.error.message;
      });

    builder

      .addCase(getOrderData.pending, state => {
        state.orderData = null;
        state.error = null;
      })
      .addCase(getOrderData.fulfilled, (state, action) => {
        state.orderData = action.payload;
        state.error = null;
        if (!action.payload) {
          state.noOrders = true;
        }
      })
      .addCase(getOrderData.rejected, (state, action) => {
        state.orderData = null;
        state.error = action.error.message;
      });
  },
});
export const {setOtherUserProfile, resetUserProfile, setNoOrders} =
  apiSlice.actions;
export default apiSlice.reducer;
