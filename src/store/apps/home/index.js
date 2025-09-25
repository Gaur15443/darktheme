import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

//get Quotes
export const getQuote = createAsyncThunk('appHome/getQuote', async () => {
  const response = await Axios.get('/quotation');
  return response.data;
});


//get Count

export const getCount = createAsyncThunk('appHome/getCount', async () => {
  const response = await Axios.get('/personsCount');
  return response.data;
});

//Testimonial

export const getTestimonial = createAsyncThunk(
  'appHome/getTestimonial',
  async () => {
    const response = await Axios.get('/getTestimonials');
    return response.data;
  },
);

//privateTreelist

export const getprivateTreeList = createAsyncThunk(
  'appHome/getprivateTreeList',
  async () => {
    const response = await Axios.get('/privateTreesName');
    return response.data;
  },
);

//Story

export const getAllstory = createAsyncThunk('appHome/getAllstory', async () => {
  const response = await Axios.get('/getAllStoriesHomescreen');
  return response.data;
});

//how to guide

export const getYoutubeVideo = createAsyncThunk(
  'appHome/getyoutubeVideo',
  async () => {
    const response = await Axios.get('/youtubeVideos');
    return response.data;
  },
);

export const getHomeMarketingBanners = createAsyncThunk(
	'appHome/getHomeMarketingBanners',
	async () => {
		const response = await Axios.get('/getHomeMarketingBanners');
		return response.data;
	}
);

export const getFilterData = createAsyncThunk('appHome/getFilterData',  async (value, { rejectWithValue }) => {
  try {
    if (typeof value !== 'boolean') {
      throw new Error("Invalid input: Expected a boolean value.");
    }
    return value;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Update TimeZone API
// export const updateTimeZone = createAsyncThunk(
//   'appHome/updateTimeZone',
//   async ({timezone, locationObject}) => {
//     const response = await Axios.post('/updateTimeZone', {
//       timezone,
//       locationObject,
//     });
//     return response.data;
//   },
// );

const initialState = {
  data: {
		isStoryPresent: 'no',
		latestStories: [],
	},
	quotes: {},
	counts: {},
	latestTestimonial: [],
	treeList: [],
	loading: 'idle',
	VideoUrl:[],
  marketingBanner: [],
  getSelectedFilterData:true
};

export const appHomeSlice = createSlice({
  name: 'appHome',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(getQuote.pending, state => {
        state.quotes = {};
      })
      .addCase(getQuote.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.quotes = action?.payload;
      })
      .addCase(getQuote.rejected, (state, action) => {
        state.quotes = {};
      });

    builder

      .addCase(getCount.pending, state => {
        state.counts = {};
      })
      .addCase(getCount.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.counts = action?.payload;
      })
      .addCase(getCount.rejected, state => {
        state.counts = {};
      });

    builder

      .addCase(getTestimonial.pending, state => {
        state.latestTestimonial = [];
      })
      .addCase(getTestimonial.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.latestTestimonial = action?.payload;
      })
      .addCase(getTestimonial.rejected, state => {
        state.latestTestimonial = [];
      });

    builder
      .addCase(getprivateTreeList.pending, state => {
        state.treeList = [];
      })
      .addCase(getprivateTreeList.fulfilled, (state, action) => {
        state.treeList = action.payload;
      })
      .addCase(getprivateTreeList.rejected, state => {
        state.treeList = [];
      });

    builder
      .addCase(getAllstory.pending, state => {
        state.loading = 'loading';
      })
      .addCase(getAllstory.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data.isStoryPresent = action?.payload?.isStoryPresent;
				action?.payload?.latestStories?.forEach((element, index) => {
					state.data.latestStories[index] = {
						_id: element?._id,
						storiesTitle: element?.storiesTitle,
						commentsCount: element?.commentsCount,
						likesCounts: element?.likesCounts,
						categoryId: element?.categoryId,
						contents: element?.contents,
						status: element?.status,
						storyCreatedAt: element?.createdAt
							? element?.createdAt
							: element?.storyCreatedAt,
						storyCreatedBy: element?.storyCreatedBy
							? element?.storyCreatedBy
							: element?.createdBy,
						media: element?.media
							? element?.media
							: element?.contents?.[0]?.elements?.map((media) => ({
									mediaUrl: media?.mediaUrl,
									thumbnailUrl: media?.thumbnailUrl,
									urlType: media.type,
							  })),
					};
				});
      })
      .addCase(getAllstory.rejected, state => {
        state.loading = 'failed';
      });

    builder
      .addCase(getYoutubeVideo.pending, state => {
        state.VideoUrl = [];
      })
      .addCase(getYoutubeVideo.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.VideoUrl = action?.payload;
      })
      .addCase(getYoutubeVideo.rejected, state => {
        state.VideoUrl = [];
      });

      builder

			.addCase(getHomeMarketingBanners.pending, (state) => {
				state.marketingBanner = [];
			})
			.addCase(getHomeMarketingBanners.fulfilled, (state, action) => {
				state.loading = 'succeeded';
				state.marketingBanner = action?.payload;
			})
			.addCase(getHomeMarketingBanners.rejected, (state) => {
				state.marketingBanner = [];
			});

      builder

			.addCase(getFilterData.pending, (state) => {
				state.getSelectedFilterData = true;
			})
			.addCase(getFilterData.fulfilled, (state, action) => {
				state.loading = 'succeeded';
				state.getSelectedFilterData = action?.payload;
			})
			.addCase(getFilterData.rejected, (state) => {
				state.getSelectedFilterData = false;
			});

    // ** updateTimeZone cases
    // builder

    //   .addCase(updateTimeZone.pending, state => {
    //     state.loading = 'loading';
    //   })
    //   .addCase(updateTimeZone.fulfilled, (state, action) => {
    //     state.loading = 'succeeded';
    //     state.timeZoneData = action.payload;
    //   })
    //   .addCase(updateTimeZone.rejected, state => {
    //     state.loading = 'failed';
    //   });
  },
});

export default appHomeSlice.reducer;
