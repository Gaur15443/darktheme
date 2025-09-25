import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// Async thunk to create a community
export const getCommunityDetails = createAsyncThunk(
  'getCommunityDetails/getCommunityDetails',
  async (communityId, {rejectWithValue}) => {
    try {
      const response = await Axios.get(`/commmunityDetail/${communityId}`);
      return response.data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  communityDetails: null,
};

const getCommunityDetailsSlice = createSlice({
  name: 'getCommunityDetails',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getCommunityDetails.pending, state => {
        state.communityDetails = null;
      })
      .addCase(getCommunityDetails.fulfilled, (state, action) => {
        state.communityDetails = action.payload;
      })
      .addCase(getCommunityDetails.rejected, state => {
        state.communityDetails = null;
      });
  },
});

export default getCommunityDetailsSlice.reducer;
