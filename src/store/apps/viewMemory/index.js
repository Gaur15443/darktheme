/* eslint-disable no-use-before-define */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const createMemory = createAsyncThunk('api/createMemory', async data => {
  const createMemoryData = data;
  const response = await Axios.post(
    '/memory/createNewMemory',
    createMemoryData,
  );

  return response.data;
});

export const fetchMemoriesData = createAsyncThunk(
  'api/fetchMemoriesData',
  async (params, { rejectWithValue, getState }) => {
    try {
      const response = await Axios.get(
        `getAllLifeChaptersGallery/v1/${params?.memoriData?.userId}/${params?.memoriData?.pageNo}`,
      );
      console.log(`getAllLifeChaptersGallery/v1/${params?.memoriData?.userId}/${params?.memoriData?.pageNo}`)
      const state = await getState().apiViewChapter;
      if (Array.isArray(response.data) && response.data.length > 0) {
        if (state.recentlyPublishedBlob?.length) {
          //   const index = response.data.findIndex(
          //     data => data._id === state.recentlyPublishedBlob[0].chapterid,
          //   );

          const index = response.data.findIndex(data =>
            data.mediaIds.some(
              media => media._id === state.recentlyPublishedBlob[0].chapterid,
            ),
          );

          if (index !== -1) {
            // state.recentlyPublishedBlob[0].media.forEach(newMedia => {
            //   const mediaIndex = response.data[index].mediaIds.findIndex(
            //     media => media._id === newMedia.mediaId,
            //   );

            //   if (mediaIndex !== -1) {
            // response.data[index].mediaIds[mediaIndex] = {
            //   ...response.data[index].mediaIds[mediaIndex],
            //   mediaUrl: newMedia.thumbnailUrl,
            //   thumbnailUrl: newMedia.thumbnailUrl,
            // };
            response.data[index].mediaIds[0] = {
              ...response.data[index].mediaIds[0],
              mediaUrl: state.recentlyPublishedBlob[0].thumbnailUrl,
              thumbnailUrl: state.recentlyPublishedBlob[0].thumbnailUrl,
            };
          }
          // });
          //   }
        }
        if (state.recentlyPublishedBlobAuto?.length) {
          if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Birth') {
            const index = response.data.findIndex(
              data => data.EventTitle === 'birthDetails',
            );
            if (index !== -1) {
              state.recentlyPublishedBlobAuto[0].media.forEach(newMedia => {
                const mediaIndex = response.data[index].mediaIds.findIndex(
                  media => media._id === newMedia.mediaId,
                );

                if (mediaIndex !== -1) {
                  response.data[index].mediaIds[mediaIndex] = {
                    ...response.data[index].mediaIds[mediaIndex],
                    mediaUrl: newMedia.thumbnailUrl,
                    thumbnailUrl: newMedia.thumbnailUrl,
                  };
                }
              });
            }
          }
          if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Death') {
            const index = response.data.findIndex(
              data => data.EventTitle === 'deathDetails',
            );
            if (index !== -1) {
              state.recentlyPublishedBlobAuto[0].media.forEach(newMedia => {
                const mediaIndex = response.data[index].mediaIds.findIndex(
                  media => media._id === newMedia.mediaId,
                );

                if (mediaIndex !== -1) {
                  response.data[index].mediaIds[mediaIndex] = {
                    ...response.data[index].mediaIds[mediaIndex],
                    mediaUrl: newMedia.thumbnailUrl,
                    thumbnailUrl: newMedia.thumbnailUrl,
                  };
                }
              });
            }
          }
          if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Marriage') {
            const index = response.data.findIndex(
              data => data.EventTitle === 'marriageDetails',
            );
            if (index !== -1) {
              state.recentlyPublishedBlobAuto[0].media.forEach(newMedia => {
                const mediaIndex = response.data[index].mediaIds.findIndex(
                  media => media._id === newMedia.mediaId,
                );

                if (mediaIndex !== -1) {
                  response.data[index].mediaIds[mediaIndex] = {
                    ...response.data[index].mediaIds[mediaIndex],
                    mediaUrl: newMedia.thumbnailUrl,
                    thumbnailUrl: newMedia.thumbnailUrl,
                  };
                }
              });
            }
          }
          if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Education') {
            const index = response.data.findIndex(
              data => data.EventTitle === 'educationDetails',
            );
            if (index !== -1) {
              state.recentlyPublishedBlobAuto[0].media.forEach(newMedia => {
                const mediaIndex = response.data[index].mediaIds.findIndex(
                  media => media._id === newMedia.mediaId,
                );

                if (mediaIndex !== -1) {
                  response.data[index].mediaIds[mediaIndex] = {
                    ...response.data[index].mediaIds[mediaIndex],
                    mediaUrl: newMedia.thumbnailUrl,
                    thumbnailUrl: newMedia.thumbnailUrl,
                  };
                }
              });
            }
          }
          if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Work') {
            const index = response.data.findIndex(
              data => data.EventTitle === 'workDetails',
            );
            if (index !== -1) {
              state.recentlyPublishedBlobAuto[0].media.forEach(newMedia => {
                const mediaIndex = response.data[index].mediaIds.findIndex(
                  media => media._id === newMedia.mediaId,
                );

                if (mediaIndex !== -1) {
                  response.data[index].mediaIds[mediaIndex] = {
                    ...response.data[index].mediaIds[mediaIndex],
                    mediaUrl: newMedia.thumbnailUrl,
                    thumbnailUrl: newMedia.thumbnailUrl,
                  };
                }
              });
            }
          }
        }

        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchOneMemoryData = createAsyncThunk(
  'api/fetchOneMemoryData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await Axios.get(`/memory/getMyMemoryById/${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteOneMemoryData = createAsyncThunk(
  'api/deleteOneMemoryData',
  async (params, { dispatch, rejectWithValue }) => {
    try {
      const response = await Axios.post(`/deleteUserGalleryItem/${params}`);
      dispatch(updateMemories(params));
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateOneMemoryData = createAsyncThunk(
  'api/updateOneMemoryData',
  async (data, { rejectWithValue }) => {
    try {
      const response = await Axios.put(
        `/memory/updateMyMemory/${data.galleryId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  createNewMemory: null,
  memories: [],
  singleMemory: [],
  loading: 'idle',
  isDataFetched: false,
  error: null,
  recentlyPublishedBlob: [],
  recentlyPublishedBlobAuto: [],
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    resetMemoriesApiDta(state) {
      state.memories = [];
      state.isDataFetched = false;
    },
    updateMemories(state, { payload }) {
      state.memories = state.memories
        .map(event => ({
          ...event,
          mediaIds: event.mediaIds.filter(memory => memory._id !== payload),
        }))
        .filter(event => event.mediaIds.length > 0);
    },
    setRecentlyPublishedBlob(state, { payload = [] }) {
      state.recentlyPublishedBlob = payload;
    },
    setRecentlyPublishedBlobAuto(state, { payload = [] }) {
      state.recentlyPublishedBlobAuto = payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })

      .addCase(fetchMemoriesData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchMemoriesData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        if (action?.payload?.length) {
          state.memories.push(...action.payload);
          state.isDataFetched = true;
        }
      })
      .addCase(fetchMemoriesData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    builder
      .addCase(fetchOneMemoryData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchOneMemoryData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.singleMemory = action.payload;
      })
      .addCase(fetchOneMemoryData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    // delete chapter
    builder
      .addCase(deleteOneMemoryData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(deleteOneMemoryData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(deleteOneMemoryData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    // update chapter
    builder
      .addCase(updateOneMemoryData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(updateOneMemoryData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateOneMemoryData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    // create chapter
    builder
      .addCase(createMemory.pending, state => {
        state.loading = 'loading';
      })
      .addCase(createMemory.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.createNewMemory = action.payload;
      })
      .addCase(createMemory.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});
export const {
  resetMemoriesApiDta,
  updateMemories,
  setRecentlyPublishedBlob,
  setRecentlyPublishedBlobAuto,
} = apiSlice.actions;
export default apiSlice.reducer;
