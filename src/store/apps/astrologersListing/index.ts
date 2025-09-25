import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ConsultationAxios } from '../../../plugin/Axios';
import type { AstrologersListingState, AstrologersListingResponse, AstrologersListingPayload } from './index.d';


export const getAllAstrologers = createAsyncThunk(
  'astrologersListing/getAllAstrologers',
  async (data: AstrologersListingPayload): Promise<AstrologersListingResponse> => {
    const response = await ConsultationAxios.post<AstrologersListingResponse>('/getAllAstrologers', data);
    return response.data;
  }
);
export const getTopAstrologers = createAsyncThunk(
  'astrologersListing/getTopAstrologers',
  async () => {
    const { data } = await ConsultationAxios.get('/getTopAstrologers');
    return data;
  }
);

const initialState: AstrologersListingState = {
  astrologers: [],
  topAstrologers: [],
  page: 1,
};

export const astrologersListingSlice = createSlice({
  name: 'astrologersListing',
  initialState,
  reducers: {
    updateAstrologersStatus: (state, action) => {
      const { astrologerId, status } = action.payload;
      const astrologerIndex = state.astrologers.findIndex(
        astrologer => astrologer.userId === astrologerId
      );
      
      if (astrologerIndex !== -1) {
        // Only update if status actually changed
        if (state.astrologers[astrologerIndex].liveStatus !== status) {
          state.astrologers[astrologerIndex] = {
            ...state.astrologers[astrologerIndex],
            liveStatus: status
          };
        }
      }
    },
    resetAstrologers: (state) => {
      state.astrologers = [];
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllAstrologers.fulfilled, (state, action) => {
      const newOnes = action.payload.filter(
        a => !state.astrologers.some(existing => existing.userId === a.userId)
      );
      state.astrologers = [...state.astrologers, ...newOnes];
    })
      .addCase(getTopAstrologers.fulfilled, (state, action) => {
        state.topAstrologers = action.payload;
      });
  },
});

export const { updateAstrologersStatus, resetAstrologers } = astrologersListingSlice.actions;

export default astrologersListingSlice.reducer;
