import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const fetchNews = createAsyncThunk('news/fetchNews', async () => {
  const response = await Axios.get('/get-public-news');
  return response.data;
});

// Fetch news details by ID
export const fetchNewsDetail = createAsyncThunk('news/fetchNewsDetail', async (newsId, { getState }) => {
    const cachedDetail = getState().news.newsDetailsById[newsId];
    if (cachedDetail) {
      return { id: newsId, data: cachedDetail }; // Return from cache
    }

    const response = await Axios.get(`/get-news/${newsId}`);
    return { id: newsId, data: response.data.data };
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    newsList: [],
    newsDetailsById: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.newsList = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      .addCase(fetchNewsDetail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNewsDetail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { id, data } = action.payload;
        state.newsDetailsById[id] = data;
      })
      .addCase(fetchNewsDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectNewsDetailById = (state, id) => state.news.newsDetailsById[id];

export default newsSlice.reducer;
