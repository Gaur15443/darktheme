import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const getFamilyStats = createAsyncThunk(
  'familyStats/getFamilyStats',
  async payload => {
    const response = await Axios.get(
      `/familyStatsNewFS/${payload.senderFamilyTreeId}/${payload.senderId}`,
    );
    return response.data;
  },
);

export const getFamilyStatsGC = createAsyncThunk(
  'familyStats/getFamilyStatsGC',
  async payload => {
    const response = await Axios.get(
      `/familyStatsNewGC/${payload.senderFamilyTreeId}/${payload.senderId}`,
    );
    return response.data;
  },
);

const initialState = {
  familyStats: [],
  familyStatsGC: [],
};

const familySlice = createSlice({
  name: 'familyStats',
  initialState,
  extraReducers: builder => {
    builder
      // .addCase('LOGOUT', state => {
      //   Object.assign(state, initialState);
      // })

      .addCase(getFamilyStats.pending, state => {
        state.familyStats = [];
      })
      .addCase(getFamilyStats.fulfilled, (state, action) => {
        if (action.payload) {
          state.familyStats = action.payload;
        }
      })
      .addCase(getFamilyStats.rejected, state => {
        state.familyStats = [];
      })
       // Handling getFamilyStatsGeneration count
      .addCase(getFamilyStatsGC.pending, state => {
        state.familyStatsGC = [];
      })
      .addCase(getFamilyStatsGC.fulfilled, (state, action) => {
        if (action.payload) {
          state.familyStatsGC = action.payload;
        }
      })
      .addCase(getFamilyStatsGC.rejected, state => {
        state.familyStatsGC = [];
      });
  },
});

export default familySlice.reducer;
