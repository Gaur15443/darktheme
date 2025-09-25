import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// Async thunk to create a community
export const getCommunityJoiningRequests = createAsyncThunk(
  'getCommunityJoiningRequests/getCommunityJoiningRequests',
  async ({communityId, pageNo}, {rejectWithValue}) => {
    try {
      const response = await Axios.get(
        `/communityJoinRequests/${communityId}/${pageNo}`,
      );
      return response.data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);

// Async thunk to accept or decline joining request
export const manageMemberRequest = createAsyncThunk(
  'manageMemberRequest',
  async ({communityId, action, memberId}, {rejectWithValue}) => {
    try {
      const response = await Axios.post(
        `/adminMemberManageRequest/${communityId}`,
        {
          action,
          memberId,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  communityJoiningRequests: null,
};

const getCommunityJoiningRequestsSlice = createSlice({
  name: 'getCommunityJoiningRequests',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getCommunityJoiningRequests.pending, state => {
        state.communityJoiningRequests = null;
      })
      .addCase(getCommunityJoiningRequests.fulfilled, (state, action) => {
        state.communityJoiningRequests = action.payload;
      })
      .addCase(getCommunityJoiningRequests.rejected, state => {
        state.communityJoiningRequests = null;
      });
  },
});

export default getCommunityJoiningRequestsSlice.reducer;
