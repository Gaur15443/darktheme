import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {ConsultationAxios} from '../../../plugin/Axios';
import type {
  AstrologerProfile,
  AstroProfileState,
  AstroRatingReviewsResponse,
  SaveRatingReviewPayload,
} from './index.d';
import {AstrologyStatusPayload} from '../../../hooks/sockets';

const initialState: AstroProfileState = {
  ratingReviews: [],
  shareLink: null,
  profile: null,
};

export const markReviewHelpful = createAsyncThunk(
  'astroProfile/markReviewHelpful',
  async ({
    reviewId,
    action,
  }: {
    reviewId: string;
    action: 'increment' | 'decrement';
  }) => {
    const response = await ConsultationAxios.patch(
      `/markReviewHelpful/${reviewId}`,
      {action},
    );
    return response.data;
  },
);
export const getAstroRatingReviews = createAsyncThunk(
  'astroProfile/getAstroRatingReviews',
  async ({
    astrologerId,
    page,
  }: {
    astrologerId: string;
    page?: number;
  }): Promise<AstroRatingReviewsResponse> => {
    const response = await ConsultationAxios.get<AstroRatingReviewsResponse>(
      `/getAstroRatingReviews/${astrologerId}?page=${page || 1}`,
    );
    return response.data;
  },
);

export const saveAstroProfileRatingReview = createAsyncThunk(
  'astroProfile/saveAstroProfileRatingReview',
  async ({
    astrologerId,
    payload,
  }: {
    astrologerId: string;
    payload: SaveRatingReviewPayload;
  }) => {
    const response = await ConsultationAxios.post(
      `/saveAstroProfileRatingReview/${astrologerId}`,
      payload,
    );
    return response.data;
  },
);

export const shareAstrologerLink = createAsyncThunk(
  'astroProfile/shareAstrologerLink',
  async (userId: string) => {
    const response = await ConsultationAxios.get(
      `/shareAstrologerLink/${userId}`,
    );
    return response.data;
  },
);

export const getAstrologerProfile = createAsyncThunk(
  'astroProfile/getAstrologerProfile',
  async (userId: string) => {
    const response = await ConsultationAxios.get(
      `/getAstrologerProfile/${userId}`,
    );
    return response.data as AstrologerProfile;
  },
);
const astroProfileSlice = createSlice({
  name: 'astroProfile',
  initialState,
  reducers: {
    resetProfileData: state => {
      state.profile = null;
    },
    updateProfileLiveStatus: (
      state,
      action: PayloadAction<AstrologyStatusPayload>,
    ) => {
      if (action.payload.astrologerId === state.profile?.userId) {
        state.profile.liveStatus = action.payload.status;
      }
    },
    updateReviewHelpfulCount: (
      state,
      action: PayloadAction<{
        reviewId: string;
        action: 'increment' | 'decrement';
      }>,
    ) => {
      state.ratingReviews = state.ratingReviews.map(review =>
        review._id === action.payload.reviewId
          ? {
              ...review,
              helpfulCount:
                action.payload.action === 'increment'
                  ? (review?.helpfulCount || 0) + 1
                  : Math.max((review?.helpfulCount || 0) - 1, 0),
            }
          : review,
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAstroRatingReviews.pending, state => {
        state.ratingReviews = [];
      })
      .addCase(getAstroRatingReviews.fulfilled, (state, action) => {
        state.ratingReviews = action.payload.paginatedReviews;
      })
      .addCase(getAstroRatingReviews.rejected, state => {
        state.ratingReviews = [];
      })
      .addCase(saveAstroProfileRatingReview.pending, state => {
        state.ratingReviews = [];
      })
      .addCase(saveAstroProfileRatingReview.fulfilled, state => {
        state.ratingReviews = [];
      })
      .addCase(saveAstroProfileRatingReview.rejected, (state, action) => {
        state.ratingReviews = [];
      })
      .addCase(shareAstrologerLink.fulfilled, (state, action) => {
        state.shareLink = action.payload;
      })
      .addCase(getAstrologerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const {resetProfileData, updateProfileLiveStatus} =
  astroProfileSlice.actions;
export default astroProfileSlice.reducer;
