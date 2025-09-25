import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const createChapter = createAsyncThunk(
  'api/createChapter',
  async data => {
    const createChapterData = data;
    const response = await Axios.post(
      '/chapter/createNewChapter',
      createChapterData,
    );
    return response.data;
  },
);
export const fetchChaptersData = createAsyncThunk(
  'api/fetchChaptersData',
  async (params, {rejectWithValue, getState}) => {
    try {
      const url =
        params.treeId !== undefined
          ? `/chapter/getMyChapter_v1/${params.userId}/${params.treeId}${
              params.clinkowner ? `?clinkowner=${params.clinkowner}` : ''
            }`
          : `/chapter/getMyChapter_v1/${params.userId}`;

      const response = await Axios.get(url);

      const state = await getState().apiViewChapter;

      if (state.recentlyPublishedBlob?.length) {
        let index = response.data.findIndex(
          data =>
            data.months.findIndex(
              data1 =>
                data1.events.findIndex(
                  data2 =>
                    data2._id === state.recentlyPublishedBlob?.[0]?.chapterid,
                ) !== -1,
            ) !== -1,
        );
        let index1 = response?.data?.[index]?.months?.findIndex?.(
          data =>
            data.events.findIndex(
              data3 =>
                data3._id === state.recentlyPublishedBlob?.[0]?.chapterid,
            ) !== -1,
        );

        let index2 = response?.data?.[index]?.months?.[
          index1
        ]?.events?.findIndex?.(
          data => data._id === state.recentlyPublishedBlob?.[0]?.chapterid,
        );

        if (
          response?.data?.[index]?.months?.[index1]?.events?.[index2]
            ?.contents?.[0]?.elements
        ) {
          response.data[index].months[index1].events[
            index2
          ].contents[0].elements = response.data[index].months[index1].events[
            index2
          ].contents[0].elements.map(content => {
            return {
              ...content,
              mediaUrl:
                state.recentlyPublishedBlob[0]?.media?.filter?.(
                  data => data.mediaId === content.mediaId,
                )?.[0]?.mediaUrl || content.mediaUrl,
              thumbnailUrl:
                state.recentlyPublishedBlob[0]?.media?.filter?.(
                  data => data.mediaId === content.mediaId,
                )?.[0]?.thumbnailUrl || content.mediaUrl,
            };
          });
        }
      }
      if (state.recentlyPublishedBlobAuto?.length) {
        if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Birth') {
          const index = response.data.findIndex(
            data =>
              data.months.findIndex(
                data1 =>
                  data1.events.findIndex(
                    data2 =>
                      data2.userId ===
                        state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                      'BD_Flag' in data2,
                  ) !== -1,
              ) !== -1,
          );

          const index1 = response?.data?.[index]?.months?.findIndex?.(
            data =>
              data.events.findIndex(
                data3 =>
                  data3.userId ===
                    state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                  'BD_Flag' in data3,
              ) !== -1,
          );

          const index2 = response?.data?.[index]?.months?.[
            index1
          ]?.events?.findIndex?.(
            data =>
              data.userId === state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
              'BD_Flag' in data,
          );

          if (
            response?.data?.[index]?.months?.[index1]?.events?.[index2]
              .dobMediaIds
          ) {
            response.data[index].months[index1].events[index2].dobMediaIds =
              response.data[index].months[index1].events[
                index2
              ].dobMediaIds.map(content => ({
                ...content,
                mediaUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.mediaUrl || content.mediaUrl,
                thumbnailUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.thumbnailUrl || content.thumbnailUrl,
              }));
          }
        }
        if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Death') {
          const index = response.data.findIndex(
            data =>
              data.months.findIndex(
                data1 =>
                  data1.events.findIndex(
                    data2 =>
                      data2.userId ===
                        state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                      'DD_Flag' in data2,
                  ) !== -1,
              ) !== -1,
          );

          const index1 = response?.data?.[index]?.months?.findIndex?.(
            data =>
              data.events.findIndex(
                data3 =>
                  data3.userId ===
                    state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                  'DD_Flag' in data3,
              ) !== -1,
          );

          const index2 = response?.data?.[index]?.months?.[
            index1
          ]?.events?.findIndex?.(
            data =>
              data.userId === state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
              'DD_Flag' in data,
          );

          if (
            response?.data?.[index]?.months?.[index1]?.events?.[index2]
              .dodMediaIds
          ) {
            response.data[index].months[index1].events[index2].dodMediaIds =
              response.data[index].months[index1].events[
                index2
              ].dodMediaIds.map(content => ({
                ...content,
                mediaUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.mediaUrl || content.mediaUrl,
                thumbnailUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.thumbnailUrl || content.thumbnailUrl,
              }));
          }
        }
        if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Education') {
          const index = response.data.findIndex(
            data =>
              data.months.findIndex(
                data1 =>
                  data1.events.findIndex(
                    data2 =>
                      data2.EId ===
                        state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                      'TD_Flag' in data2,
                  ) !== -1,
              ) !== -1,
          );

          const index1 = response?.data?.[index]?.months?.findIndex?.(
            data =>
              data.events.findIndex(
                data3 =>
                  data3.EId ===
                    state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                  'TD_Flag' in data3,
              ) !== -1,
          );

          const index2 = response?.data?.[index]?.months?.[
            index1
          ]?.events?.findIndex?.(
            data =>
              data.EId === state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
              'TD_Flag' in data,
          );

          if (
            response?.data?.[index]?.months?.[index1]?.events?.[index2]
              .docMediaIds
          ) {
            response.data[index].months[index1].events[index2].docMediaIds =
              response.data[index].months[index1].events[
                index2
              ].docMediaIds.map(content => ({
                ...content,
                mediaUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.mediaUrl || content.mediaUrl,
                thumbnailUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.thumbnailUrl || content.thumbnailUrl,
              }));
          }
        }
        if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Work') {
          const index = response.data.findIndex(
            data =>
              data.months.findIndex(
                data1 =>
                  data1.events.findIndex(
                    data2 =>
                      data2.WId ===
                        state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                      'FD_Flag' in data2,
                  ) !== -1,
              ) !== -1,
          );

          const index1 = response?.data?.[index]?.months?.findIndex?.(
            data =>
              data.events.findIndex(
                data3 =>
                  data3.WId ===
                    state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                  'FD_Flag' in data3,
              ) !== -1,
          );

          const index2 = response?.data?.[index]?.months?.[
            index1
          ]?.events?.findIndex?.(
            data =>
              data.WId === state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
              'FD_Flag' in data,
          );

          if (
            response?.data?.[index]?.months?.[index1]?.events?.[index2]
              .dowMediaIds
          ) {
            response.data[index].months[index1].events[index2].dowMediaIds =
              response.data[index].months[index1].events[
                index2
              ].dowMediaIds.map(content => ({
                ...content,
                mediaUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.mediaUrl || content.mediaUrl,
                thumbnailUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.thumbnailUrl || content.thumbnailUrl,
              }));
          }
        }
        if (state.recentlyPublishedBlobAuto[0].chapterflag === 'Marriage') {
          const index = response.data.findIndex(
            data =>
              data.months.findIndex(
                data1 =>
                  data1.events.findIndex(
                    data2 =>
                      data2.spouseId ===
                        state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                      'MD_Flag' in data2,
                  ) !== -1,
              ) !== -1,
          );

          const index1 = response?.data?.[index]?.months?.findIndex?.(
            data =>
              data.events.findIndex(
                data3 =>
                  data3.spouseId ===
                    state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
                  'MD_Flag' in data3,
              ) !== -1,
          );

          const index2 = response?.data?.[index]?.months?.[
            index1
          ]?.events?.findIndex?.(
            data =>
              data.spouseId ===
                state.recentlyPublishedBlobAuto?.[0]?.chapterid &&
              'MD_Flag' in data,
          );

          if (
            response?.data?.[index]?.months?.[index1]?.events?.[index2]
              .domMediaIds
          ) {
            response.data[index].months[index1].events[index2].domMediaIds =
              response.data[index].months[index1].events[
                index2
              ].domMediaIds.map(content => ({
                ...content,
                mediaUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.mediaUrl || content.mediaUrl,
                thumbnailUrl:
                  state.recentlyPublishedBlobAuto[0]?.media?.filter?.(
                    data => data.mediaId === content.mediaId,
                  )?.[0]?.thumbnailUrl || content.thumbnailUrl,
              }));
          }
        }
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchOneChapterData = createAsyncThunk(
  'api/fetchOneChapterData',
  async (params, {rejectWithValue, getState}) => {
    try {
      const response = await Axios.get(`/chapter/getMyChapterById/${params}`);
      const state = await getState().apiViewChapter;
      if (state?.recentlyPublishedBlob?.length) {
        if (response?.data?.contents?.[0]?.elements) {
          response.data.contents[0].elements =
            response?.data?.contents?.[0]?.elements?.map(content => ({
              ...content,
              mediaUrl:
                state?.recentlyPublishedBlob?.[0]?.media?.filter?.(
                  data => data.mediaId === content?.mediaId,
                )?.[0]?.mediaUrl || content?.mediaUrl,
              thumbnailUrl:
                state?.recentlyPublishedBlob?.[0]?.media?.filter?.(
                  data => data.mediaId === content.mediaId,
                )?.[0]?.thumbnailUrl || content?.thumbnailUrl,
            }));
        }
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
export const updateOneAutoChapterData = createAsyncThunk(
  'api/updateOneAutoChapterData',
  async (data, {rejectWithValue}) => {
    try {
      const response = await Axios.put(
        `/addMediaAutogeneratedLifechater/${data.userId}`,
        {...data},
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
export const deleteOneChapterData = createAsyncThunk(
  'api/deleteOneChapterData',
  async (params, {rejectWithValue}) => {
    try {
      const response = await Axios.delete(`/chapter/deleteMyChapter/${params}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateOneChapterData = createAsyncThunk(
  'api/updateOneChapterData',
  async (data, {rejectWithValue}) => {
    try {
      const response = await Axios.put(
        `/chapter/updateMyChapter/${data.chapterId}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  data: null,
  fetchAll: {},
  isDataFetched: false,
  loading: 'idle',
  error: null,
  recentlyPublishedBlob: [],
  recentlyPublishedBlobAuto: [],
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setRecentlyPublishedBlob(state, {payload = []}) {
      state.recentlyPublishedBlob = payload;
    },
    setRecentlyPublishedBlobAuto(state, {payload = []}) {
      state.recentlyPublishedBlobAuto = payload;
    },
    setResetFetchAll(state, {payload}) {
      state.fetchAll[payload] = null;
      state.isDataFetched = false;
    },
    clearData(state, {payload}) {
      state.fetchAll[payload] = null; // Explicitly clear data
    },
  },

  extraReducers: builder => {
    // ViewOne chapter
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(fetchOneChapterData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchOneChapterData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchOneChapterData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    // delete chapter
    builder
      .addCase(deleteOneChapterData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(deleteOneChapterData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(deleteOneChapterData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });

    // update chapter
    builder
      .addCase(updateOneChapterData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(updateOneChapterData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateOneChapterData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    //updateAutogenerate chapter
    builder
      .addCase(updateOneAutoChapterData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(updateOneAutoChapterData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(updateOneAutoChapterData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    // create chapter
    builder
      .addCase(createChapter.pending, state => {
        state.loading = 'loading';
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(createChapter.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
    // view all chapters
    builder
      .addCase(fetchChaptersData.pending, state => {
        state.loading = 'loading';
      })
      .addCase(fetchChaptersData.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const userId = action.meta.arg.userId; 
        state.fetchAll[userId] = action.payload;
        state.isDataFetched = true;
      })
      .addCase(fetchChaptersData.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});
export const {
  setRecentlyPublishedBlob,
  setResetFetchAll,
  setRecentlyPublishedBlobAuto,
  clearData,
} = apiSlice.actions;
export default apiSlice.reducer;
