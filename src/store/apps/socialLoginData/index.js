import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  data: null,
};

const SocialData = createSlice({
  name: 'SocialData',
  initialState,
  reducers: {
    setSocialData: (state, action) => {
      state.data = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      });
  },
});

export const {setSocialData} = SocialData.actions;
export default SocialData.reducer;
