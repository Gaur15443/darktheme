import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// Async thunk to create a community
export const pollsUpdatedData = createAsyncThunk(
  'pollsUpdatedData/pollsUpdatedData',
  async (data, {rejectWithValue}) => {
    try {
      return data;
    } catch (error) {
      // Return the error message if the request fails
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  pollsData: {},
};

const pollsUpdatedDatasSlice = createSlice({
  name: 'pollsUpdatedData',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(pollsUpdatedData.pending, state => {
        state.pollsData = {};
      })
      .addCase(pollsUpdatedData.fulfilled, (state, action) => {
        const updatedData = action.payload[0];
        const {pollId} = updatedData;
        state.pollsData[pollId] = action.payload;
      })
      .addCase(pollsUpdatedData.rejected, state => {
        state.pollsData = {};
      });
  },
});

export default pollsUpdatedDatasSlice.reducer;
