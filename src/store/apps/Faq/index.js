import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await Axios.get('/get-public-categories');
    return response?.data;
  },
);

export const fetchVideos = createAsyncThunk('videos/fetchVideos', async () => {
  const response = await Axios.get('/getPublishedVideos');
  return response?.data?.videos || []; 
});

export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (subcategoryId) => {
      const response = await Axios.get(`/get-public-faq/${subcategoryId}`);
      return response?.data?.data?.[0]?.articles || [];
  }
);

export const fetchSearchResults = createAsyncThunk(
  'searchArticles/fetchSearchResults',
  async (searchQuery) => {
      const response = await Axios.get(`/faq/search?query=${searchQuery}`);
      return response?.data || [];
  }
);

const apiSlice = createSlice({
  name: 'api',
  initialState: {
  categories: [],
  videos: [],
  articles: {},
  searchArticles: [],
  status: 'idle',
  error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      //Fetching Videos
      .addCase(fetchVideos.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      //Fetching Articles
      .addCase(fetchArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const subcategoryId = action?.meta?.arg;
        state.articles[subcategoryId] = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      //Fetching Search Results
      .addCase(fetchSearchResults.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchArticles = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default apiSlice.reducer;
