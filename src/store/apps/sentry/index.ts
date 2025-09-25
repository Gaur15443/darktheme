import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  shouldMask: false,
};

const sentrySlice = createSlice({
  name: 'sentry',
  initialState,
  reducers: {
    setShouldMask: (state, action) => {
      state.shouldMask = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase('LOGOUT', state => {
      Object.assign(state, initialState);
    });
  },
});

export const {setShouldMask} = sentrySlice.actions;
export default sentrySlice.reducer;
