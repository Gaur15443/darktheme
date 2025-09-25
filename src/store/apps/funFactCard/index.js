import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';
import nativeConfig from 'react-native-config';

// ** Fetch Fun Fact
export const fetchFunFact = createAsyncThunk(
  'funFact/fetch',
  async () => {
      const response = await Axios.get(`${nativeConfig.PD_ENTITY_URL}/getRandomFamousPersonByDate`);
      return response.data;  
    
  }
);

const initialState = {
  name: '',
  message: '',
  loading: false,
  error: null,
};

export const funFact = createSlice({
  name: 'funFact',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchFunFact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFunFact.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload?.name || "Unknown"; 
        state.message = action.payload?.message || "No fun fact available"; 
      })
      .addCase(fetchFunFact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('LOGOUT', (state) => {
        Object.assign(state, initialState);
      });
  },
});

export default funFact.reducer;
