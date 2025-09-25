import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';
import base64 from 'react-native-base64';

export const feedPage = createAsyncThunk('feedback/feedPage', async (data) => {
    const username = 'lMvXqnipVPBpLvlkhUm';
const password = 'X';
const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);
  const response = await Axios.post(
    'https://imeuswe.freshdesk.com/api/v2/tickets',
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data', // Set Content-Type header
        'Authorization': authHeader, // Set Authorization header
      },
    }
  );

    return response.data;
});

const initialState = { data: null, error: null };

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase('LOGOUT', (state) => {
        Object.assign(state, initialState);
      })
      .addCase(feedPage.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(feedPage.rejected, (state, action) => {
        state.data = null;
        state.error = action.error.message;
      });
  },
});

export default feedbackSlice.reducer;
