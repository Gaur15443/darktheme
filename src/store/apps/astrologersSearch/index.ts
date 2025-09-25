import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import { ConsultationAxios} from '../../../plugin/Axios';
import type { AstrologersSearchState, SearchAstrologersPayload, AstrologerResponse } from './index.d';

const initialState: AstrologersSearchState = {
  astrologers: [],
};

export const searchAstrologers = createAsyncThunk(
  'astrologersSearch/searchAstrologers',
  async (data: SearchAstrologersPayload): Promise<AstrologerResponse[]> => {
    const response = await ConsultationAxios.post<AstrologerResponse[]>('/searchAstrologers', data);
    return response.data;
  }
);

const astrologersSearchSlice = createSlice({
  name: 'astrologersSearch',
  initialState,
  reducers: {
    clearAstrologers: (state) => {
      state.astrologers = [];
    },
    updateSearchAstrologersStatus: (state, action) => {

      state.astrologers = state.astrologers.map(astrologer => {
        if (astrologer.userId === action.payload.astrologerId) {
          return { ...astrologer, liveStatus: action.payload.status };
        }
        return astrologer;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAstrologers.pending, (state) => {
        state.astrologers = [];
      })
      .addCase(searchAstrologers.fulfilled, (state, action) => {
        state.astrologers = action.payload;
      })
      .addCase(searchAstrologers.rejected, (state, action) => {
        state.astrologers = [];
      });
  }
});

export const {clearAstrologers, updateSearchAstrologersStatus} = astrologersSearchSlice.actions;

export default astrologersSearchSlice.reducer;
