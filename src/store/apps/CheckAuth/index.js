// Create a file named authSlice.js
import {createSlice} from '@reduxjs/toolkit';


const initialState = {
  isSignedIn: false,
};

const authSlice = createSlice({
  name: 'CheckAuth',
  initialState,
  reducers: {
    setSignedIn: (state, action) => {
      state.isSignedIn = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      });
  },
});

export const {setSignedIn} = authSlice.actions;
export default authSlice.reducer;
