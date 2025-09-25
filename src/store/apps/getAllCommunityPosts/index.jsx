import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

// ** Fetch categories
export const getAllCommunityPosts = createAsyncThunk(
  'getAllCommunityPosts/getAllCommunityPosts',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await Axios.post('/communityAllPosts', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

const initialState = {
  communityPosts: [],
};

export const getAllCommunityPostsSlice = createSlice({
  name: 'getAllCommunityPosts',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Handle fulfilled case for fetching categories
      .addCase(getAllCommunityPosts.fulfilled, (state, action) => {
        state.communityPosts = action.payload;
      })
      // Handle LOGOUT action to reset state
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      });
  },
});

export default getAllCommunityPostsSlice.reducer;
