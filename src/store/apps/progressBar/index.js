import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const progressBarData = createAsyncThunk(
  'api/progressBarData',
  async ({userId, clinkowner}, {rejectWithValue}) => {
    try {
      const response = await Axios.get(
        `/profileProgress/${userId}${clinkowner ? '?clinkowner=' + clinkowner : ''}`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

const initialState = {data: [], loading: 'idle', error: null};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(progressBarData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(progressBarData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(progressBarData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});
export default apiSlice.reducer;
