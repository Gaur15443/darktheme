import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  showRedDot: false,
  showRedDotLikeComment: false,
  showRedDotInvite: false,
  showRedDotAllStories: false,
  socket: null,
  createStorySocket: null,
  inviteSocket: null,
  allStories: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSocket: (state, {payload}) => {
      state.socket = payload;
    },
    setAllStoriesSocket: (state, {payload}) => {
      state.allStories = payload;
    },
    setInviteSocketSocket: (state, {payload}) => {
      state.inviteSocket = payload;
    },
    setCreateStorySocket: (state, {payload}) => {
      state.createStorySocket = payload;
    },
    setRedDot: (state, action) => {
      state.showRedDot = action.payload;
    },
    setRedDotAllStories: (state, action) => {
      state.showRedDotAllStories = action.payload;
    },
    setRedDotAfterLikeComment: (state, action) => {
      state.showRedDotLikeComment = action.payload;
    },
    setRedDotAfterInvite: (state, action) => {
      state.showRedDotInvite = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase('LOGOUT', state => {
      Object.assign(state, initialState);
    });
  },
});

export const {
  setSocket,
  setAllStoriesSocket,
  setCreateStorySocket,
  setInviteSocketSocket,
  setRedDot,
  setRedDotAllStories,
  setRedDotAfterLikeComment,
  setRedDotAfterInvite,
} = appSlice.actions;

export default appSlice.reducer;
