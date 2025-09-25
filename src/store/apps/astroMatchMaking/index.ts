import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {AstroAxios} from '../../../plugin/Axios';
import { MatchMakingPayload } from './index.d';

export const setMatchMakingData = createAsyncThunk(
    'matchmaking/setMatchMakingData',
    async (data: MatchMakingPayload) => {
      const response = await AstroAxios.post('/setMatchMakingData', data);
      return response.data.data;
    }
  );

const initialState = {
  matchMakingResult: []
};

const matchMakingSlice = createSlice({
    name: "matchmaking",
    initialState,
    reducers: {},
    extraReducers: builder => {
      builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(setMatchMakingData.pending, (state) =>{
        state.matchMakingResult = [];
      })
      .addCase(setMatchMakingData.fulfilled, (state, {payload}) =>{
        state.matchMakingResult = payload;
      })
      .addCase(setMatchMakingData.rejected, (state) =>{
        state.matchMakingResult = [];
      })
    }
});

export default matchMakingSlice.reducer;