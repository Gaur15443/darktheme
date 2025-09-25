import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  userManagementToastsConfig: null,
};

const userManagementToastsSlice = createSlice({
  name: 'userManagementToasts',
  initialState,
  reducers: {
    setUserManagementToastsConfig: (state, action) => {
      state.userManagementToastsConfig = action.payload;
    },
  },
});

export const {setUserManagementToastsConfig} =
  userManagementToastsSlice.actions;

export default userManagementToastsSlice.reducer;
