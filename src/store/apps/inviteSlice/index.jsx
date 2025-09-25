import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const checkInviteUser = createAsyncThunk(
  'checkInviteUser',
  async payload => {
    const response = await Axios.post('/checkInviteUser', payload);
    return response.data;
  },
);

export const PopupMessageValidation = createAsyncThunk(
  'PopupMessageValidation',
  async payload => {
    const response = await Axios.post('/getPopupMessageValidation', payload);
    return response.data;
  },
);

const checkInviteUserSlice = createSlice({
  name: 'checkInviteUser',
  initialState: {
    status: 'idle',
    error: null,
    result: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(checkInviteUser.pending, state => {
        state.status = 'pending';
      })
      .addCase(checkInviteUser.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.result = action.payload;
      })
      .addCase(checkInviteUser.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      });

    builder

      .addCase(PopupMessageValidation.pending, state => {
        state.status = 'pending';
      })
      .addCase(PopupMessageValidation.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.result = action.payload;
      })
      .addCase(PopupMessageValidation.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message;
      });
  },
});

export default checkInviteUserSlice.reducer;
